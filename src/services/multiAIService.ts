import { AIModelType, AIProviderConfig } from '../types/ai'

// AI服务接口定义
export interface AIService {
  analyzeData(data: any[], question: string): Promise<string>
  generateInsights(data: any[]): Promise<string[]>
  suggestVisualizations(data: any[], columns: string[]): Promise<string[]>
  explainPattern(data: any[], pattern: string): Promise<string>
  getModelInfo(): { name: string; type: AIModelType }
}

// OpenAI服务实现
export class OpenAIService implements AIService {
  private config: AIProviderConfig

  constructor(config: AIProviderConfig) {
    this.config = config
  }

  getModelInfo() {
    return {
      name: this.config.modelName,
      type: this.config.type as AIModelType
    }
  }

  async analyzeData(data: any[], question: string): Promise<string> {
    return this.callAPI(this.buildAnalysisPrompt(data, question))
  }

  async generateInsights(data: any[]): Promise<string[]> {
    const response = await this.callAPI(this.buildInsightsPrompt(data))
    return response.split('\n').filter(line => line.trim().length > 0)
  }

  async suggestVisualizations(data: any[], columns: string[]): Promise<string[]> {
    const response = await this.callAPI(this.buildVisualizationPrompt(data, columns))
    return response.split('\n').filter(line => line.trim().length > 0)
  }

  async explainPattern(data: any[], pattern: string): Promise<string> {
    return this.callAPI(this.buildPatternExplanationPrompt(data, pattern))
  }

  private async callAPI(prompt: string): Promise<string> {
    const response = await fetch(this.config.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.modelName,
        messages: [
          {
            role: 'system',
            content: '你是一个数据分析专家。提供清晰、简洁的数据集分析。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API错误: ${response.status}`)
    }

    const result = await response.json()
    return result.choices[0].message.content
  }

  private buildAnalysisPrompt(data: any[], question: string): string {
    return `
数据集样本（前10行）：
${JSON.stringify(data.slice(0, 10), null, 2)}

问题：${question}

请分析这些数据并提供洞察。重点关注：
1. 关键模式和趋势
2. 统计洞察
3. 潜在相关性
4. 数据质量观察

请以清晰、结构化的格式提供分析。
    `.trim()
  }

  private buildInsightsPrompt(data: any[]): string {
    return `
数据集样本（前5行）：
${JSON.stringify(data.slice(0, 5), null, 2)}

生成3-5个关于此数据集的关键洞察。每个洞察应：
- 具体且可操作
- 基于可观察模式
- 格式化为项目符号

仅返回洞察，每行一个。
    `.trim()
  }

  private buildVisualizationPrompt(data: any[], columns: string[]): string {
    return `
数据集列：${columns.join(', ')}
数据集大小：${data.length} 行

为此数据建议最佳可视化类型。考虑：
- 数据类型（数值、分类、时间）
- 变量之间的关系
- 常见业务用例

返回3-5个建议，每行一个。
    `.trim()
  }

  private buildPatternExplanationPrompt(data: any[], pattern: string): string {
    return `
数据集样本：
${JSON.stringify(data.slice(0, 3), null, 2)}

要解释的模式：${pattern}

在数据集上下文中解释此模式。考虑：
- 统计显著性
- 潜在原因
- 业务影响
- 数据限制

提供清晰、简洁的解释。
    `.trim()
  }
}

// Azure OpenAI服务实现
export class AzureOpenAIService implements AIService {
  private config: AIProviderConfig

  constructor(config: AIProviderConfig) {
    this.config = config
  }

  getModelInfo() {
    return {
      name: this.config.modelName,
      type: 'azure-openai' as AIModelType
    }
  }

  async analyzeData(data: any[], question: string): Promise<string> {
    return this.callAzureAPI(this.buildAnalysisPrompt(data, question))
  }

  async generateInsights(data: any[]): Promise<string[]> {
    const response = await this.callAzureAPI(this.buildInsightsPrompt(data))
    return response.split('\n').filter(line => line.trim().length > 0)
  }

  async suggestVisualizations(data: any[], columns: string[]): Promise<string[]> {
    const response = await this.callAzureAPI(this.buildVisualizationPrompt(data, columns))
    return response.split('\n').filter(line => line.trim().length > 0)
  }

  async explainPattern(data: any[], pattern: string): Promise<string> {
    return this.callAzureAPI(this.buildPatternExplanationPrompt(data, pattern))
  }

  private async callAzureAPI(prompt: string): Promise<string> {
    // Azure OpenAI API调用格式略有不同
    const response = await fetch(this.config.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.config.apiKey
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: '你是一个数据分析专家。提供清晰、简洁的数据集分析。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })
    })

    if (!response.ok) {
      throw new Error(`Azure OpenAI API错误: ${response.status}`)
    }

    const result = await response.json()
    return result.choices[0].message.content
  }

  // 提示词构建方法与OpenAI相同
  private buildAnalysisPrompt(data: any[], question: string): string {
    return new OpenAIService(this.config).analyzeData(data, question) as any
  }

  private buildInsightsPrompt(data: any[]): string {
    return new OpenAIService(this.config).generateInsights(data) as any
  }

  private buildVisualizationPrompt(data: any[], columns: string[]): string {
    return new OpenAIService(this.config).suggestVisualizations(data, columns) as any
  }

  private buildPatternExplanationPrompt(data: any[], pattern: string): string {
    return new OpenAIService(this.config).explainPattern(data, pattern) as any
  }
}

// Google Gemini服务实现
export class GoogleGeminiService implements AIService {
  private config: AIProviderConfig

  constructor(config: AIProviderConfig) {
    this.config = config
  }

  getModelInfo() {
    return {
      name: this.config.modelName,
      type: 'google-gemini-pro' as AIModelType
    }
  }

  async analyzeData(data: any[], question: string): Promise<string> {
    return this.callGeminiAPI(this.buildAnalysisPrompt(data, question))
  }

  async generateInsights(data: any[]): Promise<string[]> {
    const response = await this.callGeminiAPI(this.buildInsightsPrompt(data))
    return response.split('\n').filter(line => line.trim().length > 0)
  }

  async suggestVisualizations(data: any[], columns: string[]): Promise<string[]> {
    const response = await this.callGeminiAPI(this.buildVisualizationPrompt(data, columns))
    return response.split('\n').filter(line => line.trim().length > 0)
  }

  async explainPattern(data: any[], pattern: string): Promise<string> {
    return this.callGeminiAPI(this.buildPatternExplanationPrompt(data, pattern))
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    const response = await fetch(this.config.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: '你是一个数据分析专家。提供清晰、简洁的数据集分析。' },
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: this.config.maxTokens,
          temperature: this.config.temperature
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Google Gemini API错误: ${response.status}`)
    }

    const result = await response.json()
    return result.candidates[0].content.parts[0].text
  }

  // 提示词构建方法
  private buildAnalysisPrompt(data: any[], question: string): string {
    return `
数据集样本（前10行）：
${JSON.stringify(data.slice(0, 10), null, 2)}

问题：${question}

请分析这些数据并提供洞察。重点关注：
1. 关键模式和趋势
2. 统计洞察
3. 潜在相关性
4. 数据质量观察

请以清晰、结构化的格式提供分析。
    `.trim()
  }

  private buildInsightsPrompt(data: any[]): string {
    return `
数据集样本（前5行）：
${JSON.stringify(data.slice(0, 5), null, 2)}

生成3-5个关于此数据集的关键洞察。每个洞察应：
- 具体且可操作
- 基于可观察模式
- 格式化为项目符号

仅返回洞察，每行一个。
    `.trim()
  }

  private buildVisualizationPrompt(data: any[], columns: string[]): string {
    return `
数据集列：${columns.join(', ')}
数据集大小：${data.length} 行

为此数据建议最佳可视化类型。考虑：
- 数据类型（数值、分类、时间）
- 变量之间的关系
- 常见业务用例

返回3-5个建议，每行一个。
    `.trim()
  }

  private buildPatternExplanationPrompt(data: any[], pattern: string): string {
    return `
数据集样本：
${JSON.stringify(data.slice(0, 3), null, 2)}

要解释的模式：${pattern}

在数据集上下文中解释此模式。考虑：
- 统计显著性
- 潜在原因
- 业务影响
- 数据限制

提供清晰、简洁的解释。
    `.trim()
  }
}

// AI服务工厂
export class MultiAIServiceFactory {
  static createService(config: AIProviderConfig): AIService {
    switch (config.type) {
      case 'openai-gpt-3.5-turbo':
      case 'openai-gpt-4':
      case 'openai-gpt-4-turbo':
        return new OpenAIService(config)
      case 'azure-openai':
        return new AzureOpenAIService(config)
      case 'google-gemini-pro':
        return new GoogleGeminiService(config)
      case 'anthropic-claude-3':
        // 暂时使用OpenAI作为占位符
        return new OpenAIService(config)
      default:
        throw new Error(`不支持的AI服务类型: ${config.type}`)
    }
  }

  // 获取默认配置
  static getDefaultConfigs(): AIProviderConfig[] {
    return [
      {
        id: 'openai-gpt-3.5',
        name: 'OpenAI GPT-3.5 Turbo',
        type: 'openai-gpt-3.5-turbo',
        baseURL: 'https://api.openai.com/v1/chat/completions',
        apiKey: '',
        modelName: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.3,
        enabled: true
      },
      {
        id: 'openai-gpt-4',
        name: 'OpenAI GPT-4',
        type: 'openai-gpt-4',
        baseURL: 'https://api.openai.com/v1/chat/completions',
        apiKey: '',
        modelName: 'gpt-4',
        maxTokens: 2000,
        temperature: 0.3,
        enabled: false
      },
      {
        id: 'azure-openai',
        name: 'Azure OpenAI',
        type: 'azure-openai',
        baseURL: '', // 需要用户填写
        apiKey: '',
        modelName: 'gpt-4',
        maxTokens: 1000,
        temperature: 0.3,
        enabled: false
      },
      {
        id: 'google-gemini',
        name: 'Google Gemini Pro',
        type: 'google-gemini-pro',
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        apiKey: '',
        modelName: 'gemini-pro',
        maxTokens: 1000,
        temperature: 0.3,
        enabled: false
      }
    ]
  }
}