import { useState, useCallback } from 'react'
import { AIServiceFactory, AIService } from '../services/aiService'
import { Dataset } from '../App'

interface AIAnalysisState {
  isLoading: boolean
  error: string | null
  results: string[]
  lastAnalysis: string | null
}

export const useAIAnalysis = () => {
  const [state, setState] = useState<AIAnalysisState>({
    isLoading: false,
    error: null,
    results: [],
    lastAnalysis: null
  })

  const [aiService, setAIService] = useState<AIService | null>(null)

  // 初始化AI服务
  const initializeAIService = useCallback((apiKey: string, serviceType: 'openai' | 'local' = 'openai') => {
    try {
      const service = AIServiceFactory.createService(serviceType, apiKey)
      setAIService(service)
      setState(prev => ({ ...prev, error: null }))
      return true
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: `Failed to initialize AI service: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }))
      return false
    }
  }, [])

  // 分析数据集
  const analyzeDataset = useCallback(async (dataset: Dataset, question: string) => {
    if (!aiService) {
      setState(prev => ({ ...prev, error: 'AI service not initialized' }))
      return null
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const analysis = await aiService.analyzeData(dataset.data, question)
      setState(prev => ({
        ...prev,
        isLoading: false,
        lastAnalysis: analysis,
        results: [...prev.results, analysis]
      }))
      return analysis
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }))
      return null
    }
  }, [aiService])

  // 生成洞察
  const generateInsights = useCallback(async (dataset: Dataset) => {
    if (!aiService) {
      setState(prev => ({ ...prev, error: 'AI service not initialized' }))
      return []
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const insights = await aiService.generateInsights(dataset.data)
      setState(prev => ({
        ...prev,
        isLoading: false,
        results: [...prev.results, ...insights]
      }))
      return insights
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to generate insights: ${error instanceof Error ? error.message : 'Unknown error'}`
      }))
      return []
    }
  }, [aiService])

  // 建议可视化
  const suggestVisualizations = useCallback(async (dataset: Dataset) => {
    if (!aiService) {
      setState(prev => ({ ...prev, error: 'AI service not initialized' }))
      return []
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const suggestions = await aiService.suggestVisualizations(dataset.data, dataset.columns)
      setState(prev => ({
        ...prev,
        isLoading: false,
        results: [...prev.results, ...suggestions]
      }))
      return suggestions
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to suggest visualizations: ${error instanceof Error ? error.message : 'Unknown error'}`
      }))
      return []
    }
  }, [aiService])

  // 解释模式
  const explainPattern = useCallback(async (dataset: Dataset, pattern: string) => {
    if (!aiService) {
      setState(prev => ({ ...prev, error: 'AI service not initialized' }))
      return null
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const explanation = await aiService.explainPattern(dataset.data, pattern)
      setState(prev => ({
        ...prev,
        isLoading: false,
        lastAnalysis: explanation,
        results: [...prev.results, explanation]
      }))
      return explanation
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to explain pattern: ${error instanceof Error ? error.message : 'Unknown error'}`
      }))
      return null
    }
  }, [aiService])

  // 清除结果
  const clearResults = useCallback(() => {
    setState(prev => ({ ...prev, results: [], lastAnalysis: null, error: null }))
  }, [])

  // 清除错误
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    // 状态
    ...state,
    isInitialized: !!aiService,
    
    // 方法
    initializeAIService,
    analyzeDataset,
    generateInsights,
    suggestVisualizations,
    explainPattern,
    clearResults,
    clearError
  }
}