import React, { useState, useRef } from 'react'
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  AreaChart,
  Radar,
  Filter,
  Maximize2,
  Palette,
  Layers,
  RotateCcw
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar,
  ComposedChart
} from 'recharts'
import { Dataset } from '../App'
import ChartExportButton from './ChartExportButton'


interface VisualizationPanelProps {
  dataset: Dataset
}

type ChartType = 'bar' | 'pie' | 'line' | 'area' | 'radar' | 'composed'
type SortOrder = 'asc' | 'desc' | 'none'
type ThemeType = 'default' | 'dark' | 'pastel' | 'vibrant'

// Theme color configuration
const THEMES = {
  default: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
  dark: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
  pastel: ['#AEC6CF', '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#D4A5A5', '#9FE2BF', '#FFD8B1', '#DEECDC'],
  vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFE66D', '#FF9F1C', '#6A0572', '#AB83A1', '#2EC4B6', '#E71D36']
}



const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ dataset }) => {
  // Removed multilingual support, using English text
  const [selectedChart, setSelectedChart] = useState<ChartType>('bar')
  const [xAxis, setXAxis] = useState<string>(dataset.columns[0] || '')
  const [yAxis, setYAxis] = useState<string>(dataset.columns[1] || '')

  const [pieChartType, setPieChartType] = useState<'count' | 'sum' | 'average'>('sum')
  const [showPieLabels, setShowPieLabels] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [showLegend, setShowLegend] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [dataLimit, setDataLimit] = useState(50)
  const [sortOrder, setSortOrder] = useState<SortOrder>('none')
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('default')
  const [animationEnabled, setAnimationEnabled] = useState(true)
  const [multipleSeries, setMultipleSeries] = useState<string[]>([])
  const [dataFilter, setDataFilter] = useState('')
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // Get numeric and categorical columns
  const numericColumns = dataset.columns.filter(col => {
    const values = dataset.data.map(row => row[col]).filter(val => val != null)
    return values.some(val => !isNaN(parseFloat(val)))
  })

  const categoricalColumns = dataset.columns.filter(col => {
    const values = dataset.data.map(row => row[col]).filter(val => val != null)
    return values.every(val => isNaN(parseFloat(val)))
  })



  // Data preprocessing and formatting
  const prepareChartData = () => {
    let filteredData = dataset.data.slice(0, dataLimit === -1 ? dataset.data.length : dataLimit)
    
    // Apply data filtering
    if (dataFilter.trim()) {
      filteredData = filteredData.filter(row => {
        return Object.values(row).some(value => 
          String(value).toLowerCase().includes(dataFilter.toLowerCase())
        )
      })
    }
    
    if (selectedChart === 'bar' || selectedChart === 'line' || selectedChart === 'area' || selectedChart === 'composed') {
      if (!xAxis || !yAxis) return []
      
      const groupedData: { [key: string]: { [series: string]: number } } = {}
      filteredData.forEach(row => {
        const key = String(row[xAxis])
        const value = parseFloat(row[yAxis])
        
        if (!groupedData[key]) {
          groupedData[key] = {}
        }
        
        if (!isNaN(value)) {
          groupedData[key][yAxis] = (groupedData[key][yAxis] || 0) + value
        }
        
        // Handle multiple series data
        multipleSeries.forEach(series => {
          const seriesValue = parseFloat(row[series])
          if (!isNaN(seriesValue)) {
            groupedData[key][series] = (groupedData[key][series] || 0) + seriesValue
          }
        })
      })
      
      let result = Object.entries(groupedData).map(([name, values]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        ...values
      }))
      
      // Apply sorting
      if (sortOrder !== 'none') {
        result = result.sort((a, b) => {
          const aVal = (a as any)[yAxis] || 0
          const bVal = (b as any)[yAxis] || 0
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
        })
      }
      
      return result
    }
    
    if (selectedChart === 'pie') {
      if (!xAxis || !yAxis) return []
      
      const groupedData: { [key: string]: { sum: number; count: number } } = {}
      filteredData.forEach(row => {
        const key = String(row[xAxis])
        const value = parseFloat(row[yAxis])
        
        if (!groupedData[key]) {
          groupedData[key] = { sum: 0, count: 0 }
        }
        
        if (!isNaN(value)) {
          groupedData[key].sum += value
          groupedData[key].count += 1
        }
      })
      
      let result = Object.entries(groupedData).map(([name, data]) => {
        let value: number
        
        switch (pieChartType) {
          case 'count':
            value = data.count
            break
          case 'average':
            value = data.count > 0 ? data.sum / data.count : 0
            break
          case 'sum':
          default:
            value = data.sum
            break
        }

        return {
          name: name.length > 15 ? name.substring(0, 15) + '...' : name,
          value: Math.round(value * 100) / 100
        }
      }).filter(item => item.value > 0)
      
      // Pie chart sorting
      if (sortOrder !== 'none') {
        result = result.sort((a, b) => {
          return sortOrder === 'asc' ? a.value - b.value : b.value - a.value
        })
      }
      
      return result
    }
    

    
    if (selectedChart === 'radar') {
      if (!xAxis || !yAxis) return []
      
      const groupedData: { [key: string]: number } = {}
      filteredData.forEach(row => {
        const key = String(row[xAxis])
        const value = parseFloat(row[yAxis])
        if (!isNaN(value)) {
          groupedData[key] = (groupedData[key] || 0) + value
        }
      })
      
      return Object.entries(groupedData).map(([subject, value]) => ({
        subject: subject.length > 10 ? subject.substring(0, 10) + '...' : subject,
        A: Math.round(value * 100) / 100,
        fullMark: Math.max(...Object.values(groupedData)) * 1.2
      }))
    }
    
    return []
  }

  const chartData = prepareChartData()
  const colors = THEMES[selectedTheme]

  // Render chart
  const renderChart = () => {
    const chartProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    }

    switch (selectedChart) {
      case 'bar':
        const barSeries = [yAxis, ...multipleSeries]
        return (
          <ResponsiveContainer width="100%" height={isFullscreen ? 500 : 400}>
            <BarChart {...chartProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              {barSeries.map((series, index) => (
                <Bar 
                  key={series}
                  dataKey={series} 
                  fill={colors[index % colors.length]}
                  isAnimationActive={animationEnabled}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={isFullscreen ? 500 : 400}>
            <RechartsPieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={showPieLabels}
                label={showPieLabels ? ({ name, value }) => `${name}: ${value}` : false}
                outerRadius={isFullscreen ? 180 : 120}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={animationEnabled}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              {showLegend && <Legend />}
            </RechartsPieChart>
          </ResponsiveContainer>
        )
      
      case 'line':
        const lineSeries = [yAxis, ...multipleSeries]
        return (
          <ResponsiveContainer width="100%" height={isFullscreen ? 500 : 400}>
            <RechartsLineChart {...chartProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              {lineSeries.map((series, index) => (
                <Line 
                  key={series}
                  type="monotone" 
                  dataKey={series} 
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[index % colors.length], strokeWidth: 2 }}
                  isAnimationActive={animationEnabled}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        )
      
      case 'area':
        const areaSeries = [yAxis, ...multipleSeries]
        return (
          <ResponsiveContainer width="100%" height={isFullscreen ? 500 : 400}>
            <RechartsAreaChart {...chartProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              {areaSeries.map((series, index) => (
                <Area 
                  key={series}
                  type="monotone" 
                  dataKey={series} 
                  stroke={colors[index % colors.length]} 
                  fill={colors[index % colors.length]} 
                  fillOpacity={0.3}
                  isAnimationActive={animationEnabled}
                />
              ))}
            </RechartsAreaChart>
          </ResponsiveContainer>
        )
      

      
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={isFullscreen ? 500 : 400}>
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Tooltip />
              {showLegend && <Legend />}
              <RechartsRadar name="Value" dataKey="A" stroke={colors[0]} fill={colors[0]} fillOpacity={0.6} isAnimationActive={animationEnabled} />
            </RadarChart>
          </ResponsiveContainer>
        )
      
      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={isFullscreen ? 500 : 400}>
            <ComposedChart {...chartProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              <Bar dataKey={yAxis} fill={colors[0]} isAnimationActive={animationEnabled} />
              <Line type="monotone" dataKey={yAxis} stroke={colors[1]} isAnimationActive={animationEnabled} />
            </ComposedChart>
          </ResponsiveContainer>
        )
      
      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Please select a chart type
          </div>
        )
    }
  }

  // Chart type configuration
  const chartTypes = [
    { type: 'bar' as ChartType, icon: BarChart3, label: 'Bar Chart' },
    { type: 'pie' as ChartType, icon: PieChart, label: 'Pie Chart' },
    { type: 'line' as ChartType, icon: LineChart, label: 'Line Chart' },
    { type: 'area' as ChartType, icon: AreaChart, label: 'Area Chart' },
    { type: 'radar' as ChartType, icon: Radar, label: 'Radar Chart' },
    { type: 'composed' as ChartType, icon: Layers, label: 'Composed Chart' }
  ]

  // Fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Reset configuration
  const resetConfig = () => {
    setXAxis(dataset.columns[0] || '')
    setYAxis(dataset.columns[1] || '')
    setPieChartType('sum')
    setShowPieLabels(true)
    setShowGrid(true)
    setShowLegend(true)
    setDataLimit(50)
    setSortOrder('none')
    setSelectedTheme('default')
    setAnimationEnabled(true)
    setMultipleSeries([])
    setDataFilter('')
  }

  // Add/remove multiple series
  const toggleSeries = (series: string) => {
    if (multipleSeries.includes(series)) {
      setMultipleSeries(multipleSeries.filter(s => s !== series))
    } else {
      setMultipleSeries([...multipleSeries, series])
    }
  }

  return (
    <div 
      ref={chartContainerRef}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${
        isFullscreen 
          ? 'fixed inset-0 z-50 p-6 bg-white' 
          : 'p-6'
      }`}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Data Visualization
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Export button */}
          <ChartExportButton 
            chartElementRef={chartContainerRef}
            chartTitle="Data Visualization"
            chartData={chartData}
            className={chartData.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
          />
          
          {/* 全屏按钮 */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            title={isFullscreen ? '退出全屏' : '全屏显示'}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          
          {/* 重置按钮 */}
          <button
            onClick={resetConfig}
            className="p-2 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
            title="重置配置"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 图表类型选择 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {chartTypes.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => setSelectedChart(type)}
            className={`flex flex-col items-center space-y-2 p-3 rounded-lg border transition-colors ${
              selectedChart === type
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 配置面板 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 数据筛选 */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Filter className="h-4 w-4" />
                <span>数据筛选</span>
              </label>
              <input
                type="text"
                value={dataFilter}
                onChange={(e) => setDataFilter(e.target.value)}
                placeholder="输入关键词筛选数据..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            


          {/* 轴选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">X Axis</label>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">选择X轴</option>
              {categoricalColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Y Axis</label>
            <select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">选择Y轴</option>
              {numericColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* 多系列选择 */}
          {numericColumns.length > 1 && (
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Layers className="h-4 w-4" />
                <span>多系列数据</span>
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {numericColumns
                  .filter(col => col !== yAxis)
                  .map(col => (
                    <label key={col} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={multipleSeries.includes(col)}
                        onChange={() => toggleSeries(col)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{col}</span>
                    </label>
                  ))}
              </div>
            </div>
          )}

          {/* 饼图配置 */}
          {selectedChart === 'pie' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pie Type</label>
              <select
                value={pieChartType}
                onChange={(e) => setPieChartType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="sum">总和</option>
                <option value="count">计数</option>
                <option value="average">平均值</option>
              </select>
            </div>
          )}

          {/* 显示选项 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">显示选项</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Show Grid</span>
              </label>
              
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={showLegend}
                  onChange={(e) => setShowLegend(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Show Legend</span>
              </label>
              
              {selectedChart === 'pie' && (
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPieLabels}
                    onChange={(e) => setShowPieLabels(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Show Labels</span>
                </label>
              )}
              
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={animationEnabled}
                  onChange={(e) => setAnimationEnabled(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>动画效果</span>
              </label>
            </div>
          </div>

          {/* 排序选项 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">排序方式</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="none">默认排序</option>
              <option value="asc">升序排列</option>
              <option value="desc">降序排列</option>
            </select>
          </div>

          {/* 主题选择 */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Palette className="h-4 w-4" />
              <span>主题颜色</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(THEMES).map(([theme, colors]) => (
                <button
                  key={theme}
                  onClick={() => setSelectedTheme(theme as ThemeType)}
                  className={`p-2 rounded border text-xs font-medium ${
                    selectedTheme === theme
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-center space-x-1 mb-1">
                    {colors.slice(0, 3).map((color, i) => (
                      <div key={i} className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  {theme === 'default' ? '默认' : 
                   theme === 'dark' ? '深色' : 
                   theme === 'pastel' ? '柔和' : '鲜艳'}
                </button>
              ))}
            </div>
          </div>

          {/* 数据限制 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Data Limit</label>
            <select
              value={dataLimit}
              onChange={(e) => setDataLimit(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={50}>前50条</option>
              <option value={100}>前100条</option>
              <option value={200}>前200条</option>
              <option value={500}>前500条</option>
              <option value={-1}>全部数据</option>
            </select>
          </div>


        </div>

        {/* 图表显示区域 */}
        <div className="lg:col-span-3">
          {chartData.length > 0 ? (
            <div className="bg-gray-50 rounded-lg p-4">
              {renderChart()}
              
              {/* 数据统计 */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-semibold text-gray-900">{chartData.length}</div>
                  <div className="text-gray-600">数据点数</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-semibold text-gray-900">
                    {chartData.length > 0 ? Math.max(...chartData.map(d => ('value' in d ? Number(d.value) : 0) || 0)).toFixed(2) : '0.00'}
                  </div>
                  <div className="text-gray-600">最大值</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-semibold text-gray-900">
                    {chartData.length > 0 ? Math.min(...chartData.map(d => ('value' in d ? Number(d.value) : 0) || 0)).toFixed(2) : '0.00'}
                  </div>
                  <div className="text-gray-600">最小值</div>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <div className="font-semibold text-gray-900">
                    {chartData.length > 0 ? (chartData.reduce((sum, d) => sum + (('value' in d ? Number(d.value) : 0) || 0), 0) / chartData.length).toFixed(2) : '0.00'}
                  </div>
                  <div className="text-gray-600">平均值</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>请选择数据列并配置图表参数</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VisualizationPanel
