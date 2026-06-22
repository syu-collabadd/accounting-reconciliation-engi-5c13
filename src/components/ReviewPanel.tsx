import { Match } from '../engine/types'

interface ReviewPanelProps {
  match: Match
  onApprove: (matchId: string) => void
  onReject: (matchId: string) => void
  onClose: () => void
}

export default function ReviewPanel({ match, onApprove, onReject, onClose }: ReviewPanelProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Review Match</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Bank Transaction</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm font-medium text-gray-900">{match.bankTransaction.date}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm font-medium text-gray-900">{match.bankTransaction.description}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${match.bankTransaction.amount.toFixed(2)}
                  </p>
                </div>
                {match.bankTransaction.reference && (
                  <div>
                    <p className="text-xs text-gray-500">Reference</p>
                    <p className="text-sm font-medium text-gray-900">{match.bankTransaction.reference}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                Internal Transaction{match.internalTransactions.length > 1 ? 's' : ''}
              </h3>
              <div className="space-y-3">
                {match.internalTransactions.map((tx, idx) => (
                  <div key={tx.id} className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                    {match.internalTransactions.length > 1 && (
                      <p className="text-xs font-semibold text-green-700">Split {idx + 1}</p>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm font-medium text-gray-900">{tx.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-lg font-semibold text-gray-900">${tx.amount.toFixed(2)}</p>
                    </div>
                    {tx.reference && (
                      <div>
                        <p className="text-xs text-gray-500">Reference</p>
                        <p className="text-sm font-medium text-gray-900">{tx.reference}</p>
                      </div>
                    )}
                  </div>
                ))}

                {match.internalTransactions.length > 1 && (
                  <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                    <p className="text-xs text-gray-600">Total Internal Amount</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${match.internalTransactions.reduce((sum, tx) => sum + tx.amount, 0).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Match Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Confidence</p>
                <p className="text-lg font-semibold text-gray-900">
                  {(match.confidence * 100).toFixed(1)}%
                </p>
              </div>
              {match.dateDiscrepancy !== undefined && (
                <div>
                  <p className="text-xs text-gray-500">Date Difference</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {match.dateDiscrepancy.toFixed(1)} days
                  </p>
                </div>
              )}
              {match.amountDiscrepancy !== undefined && (
                <div>
                  <p className="text-xs text-gray-500">Amount Difference</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${match.amountDiscrepancy.toFixed(2)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Match Type</p>
                <p className="text-lg font-semibold text-yellow-700">Fuzzy</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={() => onReject(match.id)}
              className="px-6 py-2 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors"
            >
              Reject Match
            </button>
            <button
              onClick={() => onApprove(match.id)}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Approve Match
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
