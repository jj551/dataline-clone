import { AIProviderConfig, AIResponse } from '../types/ai'

// AI服务接口定义
export interface AIService {
  analyzeData(data: any[], question: string): Promise<string>
  generateInsights(data: any[]): Promise<string[]>
  suggestVisualizations(data: any[], columns: string[]): Promise<string[]>
  explainPattern(data: any[], pattern: string): Promise<string>
  getModelInfo(): { name: string; type: string }
}

// 基础AI服务实现
export abstract class BaseAIService implements AIService {
  protected config: AIProviderConfig

  constructor(config: AIProviderConfig) {
    this.config = config
  }

  abstract analyzeData(data: any[], question: string): Promise<string>
  abstract generateInsights(data: any[]): Promise<string[]>
  abstract suggestVisualizations(data: any[], columns: string[]): Promise<string[]>
  abstract explainPattern(data: any[], pattern: string): Promise<string>
  
  abstract getModelInfo(): { name: string; type: string }

  protected async makeAPIRequest(_messages: any[], _options?: any): Promise<AIResponse> {
    throw new Error('Method not implemented')
  }

  protected buildAnalysisPrompt(_data: any[], _question: string): string {
    throw new Error('Method not implemented')
  }

  protected buildInsightsPrompt(_data: any[]): string {
    throw new Error('Method not implemented')
  }

  protected buildVisualizationPrompt(_data: any[], _columns: string[]): string {
    throw new Error('Method not implemented')
  }

  protected buildPatternPrompt(_data: any[], _pattern: string): string {
    throw new Error('Method not implemented')
  }
}

// OpenAI API实现
export class OpenAIService extends BaseAIService {
  private apiKey: string
  private baseURL: string

  constructor(config: AIProviderConfig) {
    super(config)
    this.apiKey = config.apiKey || ''
    this.baseURL = config.baseURL || 'https://api.openai.com/v1'
  }

  getModelInfo() {
    return {
      name: this.config.modelName || 'gpt-3.5-turbo',
      type: this.config.type || 'gpt-3.5-turbo'
    }
  }

  async analyzeData(data: any[], question: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const sampleData = data.slice(0, 10) // 限制数据量
    const prompt = this.buildAnalysisPrompt(sampleData, question)

    try {
      const response = await this.callOpenAI(prompt)
      return response
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to analyze data with AI')
    }
  }

  async generateInsights(data: any[]): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const sampleData = data.slice(0, 5)
    const prompt = this.buildInsightsPrompt(sampleData)

    try {
      const response = await this.callOpenAI(prompt)
      // 解析返回的洞察列表
      return response.split('\n').filter(line => line.trim().length > 0)
    } catch (error) {
      console.error('OpenAI API error:', error)
      return ['Unable to generate insights at this time']
    }
  }

  async suggestVisualizations(data: any[], columns: string[]): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const prompt = this.buildVisualizationPrompt(data, columns)

    try {
      const response = await this.callOpenAI(prompt)
      return response.split('\n').filter(line => line.trim().length > 0)
    } catch (error) {
      console.error('OpenAI API error:', error)
      return ['Bar chart for categorical data', 'Line chart for trends', 'Pie chart for proportions']
    }
  }

  async explainPattern(data: any[], pattern: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const prompt = this.buildPatternExplanationPrompt(data, pattern)

    try {
      const response = await this.callOpenAI(prompt)
      return response
    } catch (error) {
      console.error('OpenAI API error:', error)
      return 'Unable to explain this pattern at this time'
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a data analysis expert. Provide clear, concise analysis of datasets.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const result = await response.json()
    return result.choices[0].message.content
  }

  protected buildAnalysisPrompt(data: any[], question: string): string {
    return `
Dataset sample (first 10 rows):
${JSON.stringify(data, null, 2)}

Question: ${question}

Please analyze this data and provide insights. Focus on:
1. Key patterns and trends
2. Statistical insights
3. Potential correlations
4. Data quality observations

Provide your analysis in clear, structured format.
    `.trim()
  }

  protected buildInsightsPrompt(data: any[]): string {
    return `
Dataset sample (first 5 rows):
${JSON.stringify(data, null, 2)}

Generate 3-5 key insights about this dataset. Each insight should be:
- Specific and actionable
- Based on observable patterns
- Formatted as a bullet point

Return only the insights, one per line.
    `.trim()
  }

  protected buildVisualizationPrompt(data: any[], columns: string[]): string {
    return `
Dataset columns: ${columns.join(', ')}
Dataset size: ${data.length} rows

Suggest the best visualization types for this data. Consider:
- Data types (numeric, categorical, temporal)
- Relationships between variables
- Common business use cases

Return 3-5 suggestions, one per line.
    `.trim()
  }

  private buildPatternExplanationPrompt(data: any[], pattern: string): string {
    return `
Dataset sample:
${JSON.stringify(data.slice(0, 3), null, 2)}

Pattern to explain: ${pattern}

Explain this pattern in the context of the dataset. Consider:
- Statistical significance
- Potential causes
- Business implications
- Data limitations

Provide a clear, concise explanation.
    `.trim()
  }
}

// 本地LLM实现（可选）
export class LocalLLMService implements AIService {
  private isAvailable: boolean = false

  constructor() {
    // 检查本地LLM是否可用
    this.isAvailable = this.checkLocalLLMAvailability()
  }

  getModelInfo() {
    return {
      name: 'Local LLM',
      type: 'local'
    }
  }

  async analyzeData(_data: any[], _question: string): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('Local LLM not available')
    }
    
    // 实现本地LLM调用逻辑
    return 'Local LLM analysis would go here'
  }

  async generateInsights(_data: any[]): Promise<string[]> {
    if (!this.isAvailable) {
      throw new Error('Local LLM not available')
    }
    
    return ['Local LLM insights would go here']
  }

  async suggestVisualizations(_data: any[], _columns: string[]): Promise<string[]> {
    if (!this.isAvailable) {
      throw new Error('Local LLM not available')
    }
    
    return ['Local LLM visualization suggestions']
  }

  async explainPattern(_data: any[], _pattern: string): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('Local LLM not available')
    }
    
    return 'Local LLM pattern explanation'
  }

  private checkLocalLLMAvailability(): boolean {
    // 检查本地LLM服务是否运行
    // 这里可以检查本地端口或服务状态
    return false // 默认不可用
  }
}

// AI服务工厂
export class AIServiceFactory {
  static createService(type: 'openai' | 'local' = 'openai', apiKey?: string): AIService {
    switch (type) {
      case 'openai':
        return new OpenAIService({
          id: 'openai-default',
          name: 'OpenAI GPT-3.5 Turbo',
          type: 'openai-gpt-3.5-turbo',
          apiKey: apiKey || '',
          modelName: 'gpt-3.5-turbo',
          baseURL: 'https://api.openai.com/v1',
          maxTokens: 1000,
          temperature: 0.3,
          enabled: true
        })
      case 'local':
        return new LocalLLMService()
      default:
        throw new Error(`Unsupported AI service type: ${type}`)
    }
  }
}