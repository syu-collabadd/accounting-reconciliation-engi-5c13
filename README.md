# Accounting Reconciliation Engine

A professional web application for reconciling transactions between bank statements and internal accounting records.

## Live Demo

🚀 **[View Live App](https://syucollabadd-accounting-reconciliation-engi-5c13.burrowapps.com)**

## Features

### Reconciliation Engine
- **Exact Matching**: Automatically identifies transactions with matching dates and amounts
- **Fuzzy Matching**: Detects similar transactions with configurable tolerances for:
  - Date discrepancies (±3 days default)
  - Amount differences (1% tolerance default)
  - Description similarity scoring
- **One-to-Many Splits**: Handles cases where one bank transaction matches multiple internal records
- **Confidence Scoring**: Each match receives a confidence score (0-100%)

### Review Interface
- **Upload CSV Files**: Import bank statements and internal records
- **Color-Coded Dashboard**:
  - 🟢 Green: Exact matches (auto-approved)
  - 🟡 Yellow: Fuzzy matches (need review)
  - 🔴 Red: Unmatched transactions
- **Side-by-Side Review**: Compare bank and internal transactions with detailed discrepancy analysis
- **Manual Approval/Rejection**: Review and approve fuzzy matches
- **Summary Metrics**: Track reconciliation progress at a glance

## CSV Format

Your CSV files should include these columns:
- `date` (YYYY-MM-DD format)
- `description` (transaction description)
- `amount` (numeric value)
- `id` (optional - auto-generated if missing)
- `reference` (optional)

### Sample Data

Download sample CSV files to test the app:
- [Bank Statement Sample](/samples/bank-statement.csv)
- [Internal Records Sample](/samples/internal-records.csv)

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **CSV Parsing**: PapaParse
- **Reconciliation**: Custom TypeScript engine with fuzzy matching

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Reconciliation Algorithm

1. **First Pass - Exact Matches**
   - Match on exact date and amount
   - Support one-to-many splits

2. **Second Pass - Fuzzy Matches**
   - Calculate similarity score based on:
     - Amount proximity (40% weight)
     - Date proximity (30% weight)
     - Description similarity (30% weight)
   - Only matches above confidence threshold (70%) are included

3. **Result Classification**
   - Matched transactions (exact + fuzzy)
   - Unmatched bank transactions
   - Unmatched internal transactions

## Configuration

Default reconciliation tolerances:
- Date tolerance: ±3 days
- Amount tolerance: 1%
- Fuzzy match threshold: 70% confidence

These can be adjusted in `src/engine/reconcile.ts`

## License

Built with Burrow — accounting-reconciliation-engi
