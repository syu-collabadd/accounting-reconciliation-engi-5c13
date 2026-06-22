import Papa from 'papaparse'
import { Transaction } from '../engine/types'

export function parseCSV(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const transactions = results.data.map((row: any, index: number) => ({
            id: row.id || `tx-${index}`,
            date: row.date || row.Date || '',
            description: row.description || row.Description || '',
            amount: parseFloat(row.amount || row.Amount || '0'),
            reference: row.reference || row.Reference || ''
          }))

          resolve(transactions.filter(tx => tx.date && tx.amount))
        } catch (error) {
          reject(error)
        }
      },
      error: reject
    })
  })
}
