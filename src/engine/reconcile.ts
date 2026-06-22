import { Transaction, Match, MatchType, ReconciliationResult, ReconciliationConfig } from './types'

const DEFAULT_CONFIG: ReconciliationConfig = {
  dateTolerance: 3,
  amountTolerance: 0.01,
  fuzzyThreshold: 0.7
}

export function reconcile(
  bankTransactions: Transaction[],
  internalTransactions: Transaction[],
  config: ReconciliationConfig = DEFAULT_CONFIG
): ReconciliationResult {
  const matches: Match[] = []
  const usedInternal = new Set<string>()
  const usedBank = new Set<string>()

  // First pass: exact matches
  for (const bankTx of bankTransactions) {
    const exactMatches = findExactMatches(bankTx, internalTransactions, usedInternal)

    if (exactMatches.length > 0) {
      matches.push({
        id: `match-${bankTx.id}`,
        type: MatchType.EXACT,
        bankTransaction: bankTx,
        internalTransactions: exactMatches,
        confidence: 1.0
      })

      usedBank.add(bankTx.id)
      exactMatches.forEach(tx => usedInternal.add(tx.id))
    }
  }

  // Second pass: fuzzy matches
  for (const bankTx of bankTransactions) {
    if (usedBank.has(bankTx.id)) continue

    const fuzzyMatch = findBestFuzzyMatch(
      bankTx,
      internalTransactions,
      usedInternal,
      config
    )

    if (fuzzyMatch && fuzzyMatch.confidence >= config.fuzzyThreshold) {
      matches.push({
        id: `match-${bankTx.id}`,
        type: MatchType.FUZZY,
        bankTransaction: bankTx,
        internalTransactions: fuzzyMatch.transactions,
        confidence: fuzzyMatch.confidence,
        dateDiscrepancy: fuzzyMatch.dateDiscrepancy,
        amountDiscrepancy: fuzzyMatch.amountDiscrepancy
      })

      usedBank.add(bankTx.id)
      fuzzyMatch.transactions.forEach(tx => usedInternal.add(tx.id))
    }
  }

  const unmatchedBank = bankTransactions.filter(tx => !usedBank.has(tx.id))
  const unmatchedInternal = internalTransactions.filter(tx => !usedInternal.has(tx.id))

  const exactMatches = matches.filter(m => m.type === MatchType.EXACT).length
  const fuzzyMatches = matches.filter(m => m.type === MatchType.FUZZY).length

  return {
    matches,
    unmatchedBank,
    unmatchedInternal,
    summary: {
      totalMatches: matches.length,
      exactMatches,
      fuzzyMatches,
      unmatchedCount: unmatchedBank.length + unmatchedInternal.length,
      totalReconciled: exactMatches,
      pendingReview: fuzzyMatches + unmatchedBank.length + unmatchedInternal.length
    }
  }
}

function findExactMatches(
  bankTx: Transaction,
  internalTxs: Transaction[],
  usedIds: Set<string>
): Transaction[] {
  const matches: Transaction[] = []
  let remainingAmount = bankTx.amount

  for (const internalTx of internalTxs) {
    if (usedIds.has(internalTx.id)) continue

    if (
      bankTx.date === internalTx.date &&
      Math.abs(internalTx.amount - remainingAmount) < 0.01
    ) {
      matches.push(internalTx)
      remainingAmount -= internalTx.amount

      if (Math.abs(remainingAmount) < 0.01) break
    }
  }

  // Only return if we matched the full amount
  if (matches.length > 0 && Math.abs(remainingAmount) < 0.01) {
    return matches
  }

  return []
}

function findBestFuzzyMatch(
  bankTx: Transaction,
  internalTxs: Transaction[],
  usedIds: Set<string>,
  config: ReconciliationConfig
): { transactions: Transaction[], confidence: number, dateDiscrepancy?: number, amountDiscrepancy?: number } | null {
  let bestMatch: { transactions: Transaction[], confidence: number, dateDiscrepancy?: number, amountDiscrepancy?: number } | null = null

  // Try single transaction matches
  for (const internalTx of internalTxs) {
    if (usedIds.has(internalTx.id)) continue

    const score = calculateMatchScore(bankTx, [internalTx], config)
    if (score && (!bestMatch || score.confidence > bestMatch.confidence)) {
      bestMatch = score
    }
  }

  // Try one-to-many matches (splits)
  const availableInternal = internalTxs.filter(tx => !usedIds.has(tx.id))
  for (let i = 0; i < availableInternal.length - 1; i++) {
    for (let j = i + 1; j < availableInternal.length; j++) {
      const combination = [availableInternal[i], availableInternal[j]]
      const score = calculateMatchScore(bankTx, combination, config)
      if (score && (!bestMatch || score.confidence > bestMatch.confidence)) {
        bestMatch = score
      }
    }
  }

  return bestMatch
}

function calculateMatchScore(
  bankTx: Transaction,
  internalTxs: Transaction[],
  config: ReconciliationConfig
): { transactions: Transaction[], confidence: number, dateDiscrepancy?: number, amountDiscrepancy?: number } | null {
  const totalAmount = internalTxs.reduce((sum, tx) => sum + tx.amount, 0)
  const amountDiff = Math.abs(bankTx.amount - totalAmount)
  const amountDiscrepancy = amountDiff / Math.abs(bankTx.amount)

  if (amountDiscrepancy > config.amountTolerance) {
    return null
  }

  const bankDate = new Date(bankTx.date)
  const dateDiscrepancies = internalTxs.map(tx => {
    const internalDate = new Date(tx.date)
    return Math.abs((bankDate.getTime() - internalDate.getTime()) / (1000 * 60 * 60 * 24))
  })

  const maxDateDiscrepancy = Math.max(...dateDiscrepancies)
  if (maxDateDiscrepancy > config.dateTolerance) {
    return null
  }

  // Calculate confidence based on amount match and date proximity
  const amountScore = 1 - (amountDiscrepancy / config.amountTolerance)
  const dateScore = 1 - (maxDateDiscrepancy / config.dateTolerance)
  const descriptionScore = calculateDescriptionSimilarity(
    bankTx.description,
    internalTxs.map(tx => tx.description).join(' ')
  )

  const confidence = (amountScore * 0.4) + (dateScore * 0.3) + (descriptionScore * 0.3)

  return {
    transactions: internalTxs,
    confidence,
    dateDiscrepancy: maxDateDiscrepancy,
    amountDiscrepancy: amountDiff
  }
}

function calculateDescriptionSimilarity(desc1: string, desc2: string): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const n1 = normalize(desc1)
  const n2 = normalize(desc2)

  if (n1 === n2) return 1.0
  if (n1.includes(n2) || n2.includes(n1)) return 0.8

  const words1 = new Set(desc1.toLowerCase().split(/\s+/))
  const words2 = new Set(desc2.toLowerCase().split(/\s+/))

  const intersection = new Set([...words1].filter(w => words2.has(w)))
  const union = new Set([...words1, ...words2])

  return intersection.size / union.size
}
