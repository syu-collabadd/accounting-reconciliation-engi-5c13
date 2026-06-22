import { useState } from 'react'
import { ReconciliationResult, Match, MatchType } from '../engine/types'
import ReviewPanel from './ReviewPanel'

interface DashboardProps {
  results: ReconciliationResult
  onReset: () => void
}

export default function Dashboard({ results, onReset }: DashboardProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [filter, setFilter] = useState<'all' | MatchType>('all')
  const [matches, setMatches] = useState(results.matches)

  const handleApprove = (matchId: string) => {
    setMatches(prev =>
      prev.map(m => (m.id === matchId ? { ...m, approved: true } : m))
    )
    setSelectedMatch(null)
  }

  const handleReject = (matchId: string) => {
    setMatches(prev => prev.filter(m => m.id !== matchId))
    setSelectedMatch(null)
  }

  const filteredMatches = filter === 'all'
    ? matches
    : matches.filter(m => m.type === filter)

  const approvedCount = matches.filter(m => m.approved).length
  const pendingCount = matches.filter(m => !m.approved && m.type === MatchType.FUZZY).length

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Matched"
          value={results.summary.totalMatches}
          color="blue"
        />
        <SummaryCard
          label="Exact Matches"
          value={results.summary.exactMatches}
          color="green"
        />
        <SummaryCard
          label="Pending Review"
          value={pendingCount}
          color="yellow"
        />
        <SummaryCard
          label="Unmatched"
          value={results.summary.unmatchedCount}
          color="red"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
            <div className="flex gap-2">
              <FilterButton
                active={filter === 'all'}
                onClick={() => setFilter('all')}
                label="All"
              />
              <FilterButton
                active={filter === MatchType.EXACT}
                onClick={() => setFilter(MatchType.EXACT)}
                label="Exact"
                color="green"
              />
              <FilterButton
                active={filter === MatchType.FUZZY}
                onClick={() => setFilter(MatchType.FUZZY)}
                label="Fuzzy"
                color="yellow"
              />
            </div>
          </div>
          <button
            onClick={onReset}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            New Reconciliation
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Confidence
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMatches.map((match) => (
                <tr key={match.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <MatchBadge type={match.type} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {match.bankTransaction.date}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {match.bankTransaction.description}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                    ${match.bankTransaction.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-700">
                      {(match.confidence * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {match.approved ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Approved
                      </span>
                    ) : match.type === MatchType.EXACT ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Auto-matched
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Needs Review
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!match.approved && match.type === MatchType.FUZZY && (
                      <button
                        onClick={() => setSelectedMatch(match)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMatches.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No transactions found for this filter
          </div>
        )}
      </div>

      {results.unmatchedBank.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-red-200">
          <div className="p-4 border-b border-red-200 bg-red-50">
            <h3 className="text-lg font-semibold text-red-900">
              Unmatched Bank Transactions ({results.unmatchedBank.length})
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {results.unmatchedBank.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                  <p className="text-xs text-gray-500">{tx.date}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">${tx.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.unmatchedInternal.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-red-200">
          <div className="p-4 border-b border-red-200 bg-red-50">
            <h3 className="text-lg font-semibold text-red-900">
              Unmatched Internal Transactions ({results.unmatchedInternal.length})
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {results.unmatchedInternal.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                  <p className="text-xs text-gray-500">{tx.date}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">${tx.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMatch && (
        <ReviewPanel
          match={selectedMatch}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-3xl font-semibold ${colorClasses[color as keyof typeof colorClasses]}`}>
        {value}
      </p>
    </div>
  )
}

function MatchBadge({ type }: { type: MatchType }) {
  const config = {
    [MatchType.EXACT]: { label: 'Exact', color: 'bg-green-100 text-green-800' },
    [MatchType.FUZZY]: { label: 'Fuzzy', color: 'bg-yellow-100 text-yellow-800' },
    [MatchType.UNMATCHED]: { label: 'None', color: 'bg-red-100 text-red-800' }
  }

  const { label, color } = config[type]

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}

function FilterButton({
  active,
  onClick,
  label,
  color
}: {
  active: boolean
  onClick: () => void
  label: string
  color?: string
}) {
  const baseClasses = 'px-3 py-1 text-xs font-medium rounded-lg transition-colors'
  const activeClasses = color
    ? `bg-${color}-100 text-${color}-800`
    : 'bg-blue-100 text-blue-800'
  const inactiveClasses = 'bg-gray-100 text-gray-600 hover:bg-gray-200'

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
    >
      {label}
    </button>
  )
}
