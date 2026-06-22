import { useState } from 'react'
import Upload from './components/Upload'
import Dashboard from './components/Dashboard'
import { ReconciliationResult } from './engine/types'

function App() {
  const [results, setResults] = useState<ReconciliationResult | null>(null)

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Reconciliation Engine</h1>
          <p className="text-sm text-gray-600 mt-1">Match and review accounting transactions</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!results ? (
          <Upload onReconcile={setResults} />
        ) : (
          <Dashboard results={results} onReset={() => setResults(null)} />
        )}
      </main>
    </div>
  )
}

export default App
