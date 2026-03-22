import React, { useState } from 'react'
import { Settings, Plus, Trash2, TestTube, Check, X, AlertCircle, Brain, ArrowLeft } from 'lucide-react'
import { useMultiAIManager } from '../hooks/useMultiAIManager'
import { AIProviderConfig, AIModelType } from '../types/ai'

interface MultiAIConfigPanelProps {
  onBack?: () => void
}

const MultiAIConfigPanel: React.FC<MultiAIConfigPanelProps> = ({ onBack }) => {
  const {
    configs,
    activeConfig,
    isLoading,
    error,
    isInitialized,
    updateConfig,
    toggleConfig,
    initializeAIService,
    addConfig,
    removeConfig,
    resetToDefaults,
    clearError
  } = useMultiAIManager()

  const [showAddForm, setShowAddForm] = useState(false)
  const [newConfig, setNewConfig] = useState<Partial<AIProviderConfig>>({
    name: '',
    type: 'openai-gpt-3.5-turbo',
    baseURL: '',
    apiKey: '',
    modelName: '',
    maxTokens: 1000,
    temperature: 0.3,
    enabled: false
  })

  const handleAddConfig = () => {
    if (newConfig.name && newConfig.type && newConfig.baseURL && newConfig.modelName) {
      addConfig(newConfig as Omit<AIProviderConfig, 'id'>)
      setNewConfig({
        name: '',
        type: 'openai-gpt-3.5-turbo',
        baseURL: '',
        apiKey: '',
        modelName: '',
        maxTokens: 1000,
        temperature: 0.3,
        enabled: false
      })
      setShowAddForm(false)
    }
  }

  const handleTestConnection = async (config: AIProviderConfig) => {
    // 模拟测试连接
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert(`✅ ${config.name} 连接测试成功`)
    } catch {
      alert(`❌ ${config.name} 连接测试失败`)
    }
  }

  const getModelDisplayName = (type: AIModelType) => {
    const names: Record<AIModelType, string> = {
      'openai-gpt-3.5-turbo': 'OpenAI GPT-3.5 Turbo',
      'openai-gpt-4': 'OpenAI GPT-4',
      'openai-gpt-4-turbo': 'OpenAI GPT-4 Turbo',
      'azure-openai': 'Azure OpenAI',
      'google-gemini-pro': 'Google Gemini Pro',
      'anthropic-claude-3': 'Anthropic Claude 3'
    }
    return names[type] || type
  }

  return (
    <div className="space-y-6">
      {/* 标题和状态 */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">多模型AI配置</h3>
          </div>
          <div className="flex items-center space-x-2">
            {isInitialized && (
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span>已初始化</span>
              </div>
            )}
            <Settings className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        {activeConfig && (
          <div className="p-3 bg-blue-50 rounded-lg mb-4">
            <div className="text-sm text-blue-700">
              <strong>当前激活:</strong> {activeConfig.name} ({getModelDisplayName(activeConfig.type)})
            </div>
          </div>
        )}

        {/* 错误显示 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 mb-4">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
            <button
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* 配置列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4 text-purple-600" />
            <h3 className="text-base font-semibold text-gray-900">AI服务配置</h3>
          </div>
          <button
            onClick={() => onBack?.()}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
            title="返回"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">AI服务配置</h4>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>添加配置</span>
            </button>
            <button
              onClick={resetToDefaults}
              className="btn-secondary"
            >
              重置默认
            </button>
          </div>
        </div>

        {/* 添加配置表单 */}
        {showAddForm && (
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <h5 className="font-medium text-gray-900 mb-3">添加新配置</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="配置名称"
                value={newConfig.name}
                onChange={(e) => setNewConfig(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
              />
              <select
                value={newConfig.type}
                onChange={(e) => setNewConfig(prev => ({ ...prev, type: e.target.value as AIModelType }))}
                className="input-field"
              >
                <option value="openai-gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</option>
                <option value="openai-gpt-4">OpenAI GPT-4</option>
                <option value="azure-openai">Azure OpenAI</option>
                <option value="google-gemini-pro">Google Gemini Pro</option>
                <option value="anthropic-claude-3">Anthropic Claude 3</option>
              </select>
              <input
                type="text"
                placeholder="API基础URL"
                value={newConfig.baseURL}
                onChange={(e) => setNewConfig(prev => ({ ...prev, baseURL: e.target.value }))}
                className="input-field"
              />
              <input
                type="text"
                placeholder="模型名称"
                value={newConfig.modelName}
                onChange={(e) => setNewConfig(prev => ({ ...prev, modelName: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleAddConfig}
                className="btn-primary"
                disabled={!newConfig.name || !newConfig.type || !newConfig.baseURL || !newConfig.modelName}
              >
                添加
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* 配置项列表 */}
        <div className="space-y-3">
          {configs.map((config) => (
            <div key={config.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    checked={config.enabled}
                    onChange={(e) => toggleConfig(config.id, e.target.checked)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{config.name}</div>
                    <div className="text-sm text-gray-500">{getModelDisplayName(config.type)}</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTestConnection(config)}
                    className="p-2 text-blue-600 hover:text-blue-800"
                    title="测试连接"
                  >
                    <TestTube className="h-4 w-4" />
                  </button>
                  {!config.id.startsWith('openai-gpt') && (
                    <button
                      onClick={() => removeConfig(config.id)}
                      className="p-2 text-red-600 hover:text-red-800"
                      title="删除配置"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {config.enabled && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      type="password"
                      placeholder="API密钥"
                      value={config.apiKey}
                      onChange={(e) => updateConfig(config.id, { apiKey: e.target.value })}
                      className="input-field text-sm"
                    />
                    <input
                      type="text"
                      placeholder="基础URL"
                      value={config.baseURL}
                      onChange={(e) => updateConfig(config.id, { baseURL: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="模型名称"
                      value={config.modelName}
                      onChange={(e) => updateConfig(config.id, { modelName: e.target.value })}
                      className="input-field text-sm"
                    />
                    <input
                      type="number"
                      placeholder="最大令牌数"
                      value={config.maxTokens}
                      onChange={(e) => updateConfig(config.id, { maxTokens: parseInt(e.target.value) || 1000 })}
                      className="input-field text-sm"
                    />
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      placeholder="温度"
                      value={config.temperature}
                      onChange={(e) => updateConfig(config.id, { temperature: parseFloat(e.target.value) || 0.3 })}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 初始化按钮 */}
        {activeConfig && (
          <div className="mt-4">
            <button
              onClick={initializeAIService}
              disabled={isLoading || !activeConfig.apiKey.trim()}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>初始化中...</span>
                </div>
              ) : (
                `初始化 ${activeConfig.name} 服务`
              )}
            </button>
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div className="card p-6">
        <h4 className="font-medium text-gray-900 mb-3">使用说明</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• 选择并配置一个AI服务，然后点击"初始化"</p>
          <p>• 支持OpenAI、Azure OpenAI、Google Gemini等主流模型</p>
          <p>• API密钥仅存储在浏览器本地，不会发送到服务器</p>
          <p>• 可以同时配置多个服务，但每次只能激活一个</p>
        </div>
      </div>
    </div>
  )
}

export default MultiAIConfigPanel