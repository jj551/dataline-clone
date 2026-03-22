import React, { useState } from 'react'
import { Zap, Lightbulb, BarChart3, Send, AlertCircle, Cpu } from 'lucide-react'
import { useMultiAIManager } from '../hooks/useMultiAIManager'
import { Dataset } from '../App'
import MultiAIConfigPanel from './MultiAIConfigPanel'

interface AIAnalysisPanelProps {
  dataset: Dataset
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ dataset }) => {
  const [question, setQuestion] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<string[]>([])
  
  const {
    activeConfig,
    aiService,
    isLoading,
    error,
    isInitialized,
    clearError
  } = useMultiAIManager()

  const handleAskQuestion = async () => {
    if (question.trim() && aiService) {
      try {
        const result = await aiService.analyzeData(dataset.data, question.trim())
        setAnalysisResults(prev => [...prev, result])
        setQuestion('')
      } catch (err) {
        console.error('Analysis failed:', err)
      }
    }
  }

  const handleAIQuickAnalysis = async (type: 'insights' | 'visualizations') => {
    if (!aiService) return
    
    try {
      let results: string[]
      if (type === 'insights') {
        results = await aiService.generateInsights(dataset.data)
      } else {
        results = await aiService.suggestVisualizations(dataset.data, dataset.columns)
      }
      setAnalysisResults(prev => [...prev, ...results])
    } catch (err) {
      console.error('Quick analysis failed:', err)
    }
  }

  const clearResults = () => {
    setAnalysisResults([])
  }

  return (
    <div className="space-y-4">
      {/* Configuration panel toggle */}
      {showConfig ? (
        <MultiAIConfigPanel onBack={() => setShowConfig(false)} />
      ) : (
        <>
          {/* AI Analysis Control Panel */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-600" />
                <h3 className="text-base font-semibold text-gray-900">AI Data Analysis</h3>
              </div>
              <button
                onClick={() => setShowConfig(true)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                title="Configure AI Service"
              >
                <Cpu className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Service Status */}
            {!isInitialized ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-3.5 w-3.5 text-yellow-600" />
                  <span className="text-xs text-yellow-700">
                    AI Service Not Initialized
                  </span>
                </div>
                <button
                  onClick={() => setShowConfig(true)}
                  className="w-full mt-2 px-3 py-1.5 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                >
                  Configure Service
                </button>
              </div>
            ) : activeConfig && (
              <div className="p-2 bg-blue-50 rounded-lg mb-3 text-xs">
                <div className="text-blue-700">
                  <strong>Current:</strong> {activeConfig.name}
                </div>
              </div>
            )}

            {/* AI Quick Analysis Buttons */}
            <div className="grid grid-cols-1 gap-2 mb-3">
              <button
                onClick={() => handleAIQuickAnalysis('insights')}
                disabled={!isInitialized || isLoading}
                className="flex items-center justify-center space-x-2 p-2 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                <span>Generate Insights</span>
              </button>
              
              <button
                onClick={() => handleAIQuickAnalysis('visualizations')}
                disabled={!isInitialized || isLoading}
                className="flex items-center justify-center space-x-2 p-2 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Suggest Charts</span>
              </button>
            </div>

            {/* Question Input */}
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask AI a question..."
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                disabled={!isInitialized || isLoading}
              />
              <button
                onClick={handleAskQuestion}
                disabled={!isInitialized || isLoading || !question.trim()}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Loading Status */}
            {isLoading && (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-xs text-gray-600">Analyzing...</span>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded flex items-center space-x-2 text-xs">
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                <span className="text-red-700">{error}</span>
                <button
                  onClick={clearError}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          
          {/* AI分析结果 */}
          {analysisResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">分析结果</h4>
                <button
                  onClick={clearResults}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  清除
                </button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {analysisResults.map((result, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {result}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 数据集信息 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">数据集信息</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">行数:</span>
                <span className="ml-1 font-medium">{dataset.data.length}</span>
              </div>
              <div>
                <span className="text-gray-500">列数:</span>
                <span className="ml-2 font-medium">{dataset.columns.length}</span>
              </div>
              <div>
                <span className="text-gray-500">文件类型:</span>
                <span className="ml-2 font-medium">{dataset.type.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-gray-500">上传时间:</span>
                <span className="ml-2 font-medium">
                  {dataset.uploadedAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 返回按钮 */}
      {showConfig && (
        <div className="text-center">
          <button
            onClick={() => setShowConfig(false)}
            className="btn-secondary"
          >
            返回分析界面
          </button>
        </div>
      )}
    </div>
  )
}

export default AIAnalysisPanel