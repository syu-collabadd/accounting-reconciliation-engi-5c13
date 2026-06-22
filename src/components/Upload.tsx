import { useState } from 'react'
import { parseCSV } from '../utils/csv'
import { reconcile } from '../engine/reconcile'
import { ReconciliationResult } from '../engine/types'

interface UploadProps {
  onReconcile: (result: ReconciliationResult) => void
}

export default function Upload({ onReconcile }: UploadProps) {
  const [bankFile, setBankFile] = useState<File | null>(null)
  const [internalFile, setInternalFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReconcile = async () => {
    if (!bankFile || !internalFile) {
      setError('Please upload both files')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [bankTransactions, internalTransactions] = await Promise.all([
        parseCSV(bankFile),
        parseCSV(internalFile)
      ])

      const result = reconcile(bankTransactions, internalTransactions)
      onReconcile(result)
    } catch (err) {
      setError('Failed to process files. Please check the CSV format.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Transaction Files</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Statement (CSV)
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setBankFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {bankFile && (
              <p className="mt-1 text-sm text-gray-500">
                {bankFile.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internal Records (CSV)
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setInternalFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {internalFile && (
              <p className="mt-1 text-sm text-gray-500">
                {internalFile.name}
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>CSV Format:</strong> Your files should include columns: date, description, amount
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleReconcile}
            disabled={loading || !bankFile || !internalFile}
            className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Start Reconciliation'}
          </button>
        </div>
      </div>

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Sample CSV Format</h3>
        <pre className="text-xs text-gray-700 bg-white p-3 rounded border border-gray-200 overflow-x-auto">
{`date,description,amount
2026-06-01,Office Supplies,125.50
2026-06-02,Software License,499.00
2026-06-03,Client Payment,-1500.00`}
        </pre>
      </div>
    </div>
  )
}
