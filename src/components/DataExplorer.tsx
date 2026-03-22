import React, { useState } from 'react'
import { Search, Filter, Download } from 'lucide-react'
import Papa from 'papaparse'
import { Dataset } from '../App'

interface DataExplorerProps {
  dataset: Dataset
}

const DataExplorer: React.FC<DataExplorerProps> = ({ dataset }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedColumns, setSelectedColumns] = useState<string[]>(dataset.columns)

  const filteredData = dataset.data.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const totalPages = Math.ceil(filteredData.length / 10)

  const handleColumnToggle = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    )
  }

  const exportData = () => {
    const dataToExport = filteredData.map(row => {
      const filteredRow: any = {}
      selectedColumns.forEach(col => {
        filteredRow[col] = row[col]
      })
      return filteredRow
    })

    const csv = Papa.unparse(dataToExport)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${dataset.name.split('.')[0]}_filtered.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getColumnStats = (column: string) => {
    const values = dataset.data.map(row => row[column]).filter(val => val != null)
    if (values.length === 0) return null

    const numericValues = values.map(val => {
      const num = parseFloat(val)
      return isNaN(num) ? null : num
    }).filter(val => val != null)

    if (numericValues.length > 0) {
      const sum = numericValues.reduce((a, b) => a + b, 0)
      const avg = sum / numericValues.length
      const min = Math.min(...numericValues)
      const max = Math.max(...numericValues)
      return { type: 'numeric', avg, min, max, count: values.length }
    }

    const uniqueValues = new Set(values.map(String))
    return { type: 'categorical', unique: uniqueValues.size, count: values.length }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Dataset Explorer</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportData}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search in data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{filteredData.length} rows found</span>
            <span>{totalPages} pages</span>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Columns</h4>
          <Filter className="h-4 w-4 text-gray-400" />
        </div>
        
        <div className="space-y-2">
          {dataset.columns.map(column => (
            <label key={column} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedColumns.includes(column)}
                onChange={() => handleColumnToggle(column)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 flex-1">{column}</span>
              
              {(() => {
                const stats = getColumnStats(column)
                if (!stats) return null
                
                return (
                  <span className="text-xs text-gray-500">
                    {stats.type === 'numeric' ? (
                      `${stats.avg?.toFixed(2) || '0.00'} avg`
                    ) : (
                      `${stats.unique} unique`
                    )}
                  </span>
                )
              })()}
            </label>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h4 className="font-medium text-gray-900 mb-4">Quick Analysis</h4>
        <div className="space-y-3">
          <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="font-medium text-gray-900">Summary Statistics</div>
            <div className="text-sm text-gray-600">Get basic stats for numeric columns</div>
          </button>
          
          <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="font-medium text-gray-900">Correlation Analysis</div>
            <div className="text-sm text-gray-600">Find relationships between columns</div>
          </button>
          
          <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="font-medium text-gray-900">Trend Analysis</div>
            <div className="text-sm text-gray-600">Identify patterns over time</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DataExplorer