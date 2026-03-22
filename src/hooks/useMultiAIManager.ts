import { useState, useCallback } from 'react'
import { AIProviderConfig } from '../types/ai'
import { MultiAIServiceFactory, AIService } from '../services/multiAIService'

interface AIManagerState {
  configs: AIProviderConfig[]
  activeConfig: AIProviderConfig | null
  aiService: AIService | null
  isLoading: boolean
  error: string | null
}

export const useMultiAIManager = () => {
  const [state, setState] = useState<AIManagerState>(() => {
    // 从localStorage加载配置
    const savedConfigs = localStorage.getItem('aiProviderConfigs')
    const defaultConfigs = MultiAIServiceFactory.getDefaultConfigs()
    
    const configs = savedConfigs 
      ? JSON.parse(savedConfigs)
      : defaultConfigs
    
    return {
      configs,
      activeConfig: configs.find((config: AIProviderConfig) => config.enabled) || null,
      aiService: null,
      isLoading: false,
      error: null
    }
  })

  // 保存配置到localStorage
  const saveConfigs = useCallback((configs: AIProviderConfig[]) => {
    localStorage.setItem('aiProviderConfigs', JSON.stringify(configs))
    setState(prev => ({ ...prev, configs }))
  }, [])

  // 更新配置
  const updateConfig = useCallback((configId: string, updates: Partial<AIProviderConfig>) => {
    const updatedConfigs = state.configs.map(config =>
      config.id === configId ? { ...config, ...updates } : config
    )
    saveConfigs(updatedConfigs)
  }, [state.configs, saveConfigs])

  // 启用/禁用配置
  const toggleConfig = useCallback((configId: string, enabled: boolean) => {
    const updatedConfigs = state.configs.map(config =>
      config.id === configId 
        ? { ...config, enabled }
        : { ...config, enabled: false } // 禁用其他配置
    )
    
    saveConfigs(updatedConfigs)
    
    const activeConfig = updatedConfigs.find(config => config.enabled) || null
    setState(prev => ({ ...prev, activeConfig, aiService: null }))
  }, [state.configs, saveConfigs])

  // 初始化AI服务
  const initializeAIService = useCallback(async () => {
    if (!state.activeConfig) {
      setState(prev => ({ ...prev, error: '请先选择并配置AI服务' }))
      return false
    }

    if (!state.activeConfig.apiKey.trim()) {
      setState(prev => ({ ...prev, error: '请提供API密钥' }))
      return false
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const aiService = MultiAIServiceFactory.createService(state.activeConfig)
      
      // 简单的连接测试，不依赖具体数据
      // 使用更简单的测试方法，避免复杂的数据处理
      const testData = [{ sample: 'test', value: 1 }]
      const testQuestion = '这是一个连接测试'
      
      // 设置超时，避免长时间等待
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('连接超时')), 10000)
      })
      
      const testPromise = aiService.analyzeData(testData, testQuestion)
      
      // 等待测试完成或超时
      await Promise.race([testPromise, timeoutPromise])
      
      setState(prev => ({
        ...prev,
        aiService,
        isLoading: false
      }))
      
      return true
    } catch (error) {
      console.error('AI服务初始化失败:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `AI服务初始化失败: ${error instanceof Error ? error.message : '请检查API密钥和网络连接'}`
      }))
      return false
    }
  }, [state.activeConfig])

  // 添加新配置
  const addConfig = useCallback((config: Omit<AIProviderConfig, 'id'>) => {
    const newConfig: AIProviderConfig = {
      ...config,
      id: `custom-${Date.now()}`
    }
    
    const updatedConfigs = [...state.configs, newConfig]
    saveConfigs(updatedConfigs)
  }, [state.configs, saveConfigs])

  // 删除配置
  const removeConfig = useCallback((configId: string) => {
    const updatedConfigs = state.configs.filter(config => config.id !== configId)
    saveConfigs(updatedConfigs)
    
    if (state.activeConfig?.id === configId) {
      setState(prev => ({ ...prev, activeConfig: null, aiService: null }))
    }
  }, [state.configs, state.activeConfig, saveConfigs])

  // 重置为默认配置
  const resetToDefaults = useCallback(() => {
    const defaultConfigs = MultiAIServiceFactory.getDefaultConfigs()
    saveConfigs(defaultConfigs)
    setState(prev => ({ ...prev, activeConfig: null, aiService: null }))
  }, [saveConfigs])

  // 清除错误
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    // 状态
    configs: state.configs,
    activeConfig: state.activeConfig,
    aiService: state.aiService,
    isLoading: state.isLoading,
    error: state.error,
    isInitialized: !!state.aiService,
    
    // 方法
    updateConfig,
    toggleConfig,
    initializeAIService,
    addConfig,
    removeConfig,
    resetToDefaults,
    clearError
  }
}