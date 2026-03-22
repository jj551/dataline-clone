import React, { useCallback, useState } from 'react'
import { Upload, FileText, Database, AlertCircle, Brain, Shield, BarChart3 } from 'lucide-react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { Dataset } from '../App'

interface DataUploadProps {
  onDatasetUpload: (dataset: Dataset) => void
}

const DataUpload: React.FC<DataUploadProps> = ({ onDatasetUpload }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>('')

  const processFile = useCallback((file: File) => {
    const reader = new FileReader()
    const fileType = file.name.split('.').pop()?.toLowerCase()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        let data: any[] = []
        let columns: string[] = []

        if (fileType === 'csv') {
          const result = Papa.parse(content, {
            header: true,
            skipEmptyLines: true,
          })
          data = result.data
          columns = result.meta.fields || []
        } else if (fileType === 'xlsx' || fileType === 'xls') {
          const workbook = XLSX.read(content, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]
          data = jsonData
          columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : []
        } else if (fileType === 'json') {
          const jsonData = JSON.parse(content)
          data = Array.isArray(jsonData) ? jsonData : [jsonData]
          columns = data.length > 0 ? Object.keys(data[0]) : []
        } else {
          throw new Error('Unsupported file format')
        }

        if (data.length === 0) {
          throw new Error('No data found in file')
        }

        const dataset: Dataset = {
          id: Date.now().toString(),
          name: file.name,
          columns,
          data,
          type: fileType as 'csv' | 'excel' | 'json',
          uploadedAt: new Date(),
        }

        onDatasetUpload(dataset)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process file')
      }
    }

    if (fileType === 'csv' || fileType === 'json') {
      reader.readAsText(file)
    } else {
      reader.readAsBinaryString(file)
    }
  }, [onDatasetUpload])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Upload Your Data
        </h2>
        <p className="text-lg text-gray-600">
          Start exploring your data with AI-powered analysis. Your data stays on your device.
        </p>
      </div>

      <div
        className={`card p-8 border-2 border-dashed transition-colors duration-200 ${
          isDragging ? 'border-primary-400 bg-primary-50' : 'border-gray-300'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="flex justify-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>CSV</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Database className="h-4 w-4" />
              <span>Excel</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>JSON</span>
            </div>
          </div>
          
          <label className="btn-primary cursor-pointer inline-block">
            Choose File
            <input
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls,.json"
              onChange={handleFileSelect}
            />
          </label>
          
          <p className="mt-4 text-sm text-gray-500">
            or drag and drop your file here
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <Brain className="mx-auto h-8 w-8 text-primary-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
          <p className="text-sm text-gray-600">
            Get instant insights and patterns from your data using AI
          </p>
        </div>
        
        <div className="card p-6 text-center">
          <Shield className="mx-auto h-8 w-8 text-primary-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Privacy First</h3>
          <p className="text-sm text-gray-600">
            Your data never leaves your device. No cloud storage required
          </p>
        </div>
        
        <div className="card p-6 text-center">
          <BarChart3 className="mx-auto h-8 w-8 text-primary-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Visualization</h3>
          <p className="text-sm text-gray-600">
            Create beautiful charts and graphs to understand your data
          </p>
        </div>
      </div>
    </div>
  )
}

export default DataUpload