// 支持的AI模型类型
export type AIModelType = 
  | 'openai-gpt-3.5-turbo'
  | 'openai-gpt-4'
  | 'openai-gpt-4-turbo'
  | 'azure-openai'
  | 'google-gemini-pro'
  | 'anthropic-claude-3'

// AI提供商配置
export interface AIProviderConfig {
  id: string
  name: string
  type: AIModelType
  baseURL: string
  apiKey: string
  modelName: string
  maxTokens: number
  temperature: number
  enabled: boolean
}

// AI服务响应
export interface AIResponse {
  content: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  timestamp: Date
}

// 分析请求
export interface AnalysisRequest {
  data: any[]
  question: string
  context?: string
  options?: {
    maxTokens?: number
    temperature?: number
    includeStats?: boolean
  }
}

// 洞察结果
export interface Insight {
  id: string
  title: string
  description: string
  confidence: number
  category: 'trend' | 'correlation' | 'anomaly' | 'summary'
  dataPoints: number[]
}

// 可视化建议
export interface VisualizationSuggestion {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap'
  title: string
  description: string
  xAxis?: string
  yAxis?: string
  grouping?: string
}