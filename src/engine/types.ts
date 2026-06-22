export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  reference?: string
}

export enum MatchType {
  EXACT = 'exact',
  FUZZY = 'fuzzy',
  UNMATCHED = 'unmatched'
}

export interface Match {
  id: string
  type: MatchType
  bankTransaction: Transaction
  internalTransactions: Transaction[]
  confidence: number
  dateDiscrepancy?: number
  amountDiscrepancy?: number
  approved?: boolean
}

export interface ReconciliationResult {
  matches: Match[]
  unmatchedBank: Transaction[]
  unmatchedInternal: Transaction[]
  summary: {
    totalMatches: number
    exactMatches: number
    fuzzyMatches: number
    unmatchedCount: number
    totalReconciled: number
    pendingReview: number
  }
}

export interface ReconciliationConfig {
  dateTolerance: number // days
  amountTolerance: number // percentage
  fuzzyThreshold: number // 0-1
}
