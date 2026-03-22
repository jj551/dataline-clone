import React, { useState } from 'react'
import { Download, FileText, Check, AlertCircle, Zap } from 'lucide-react'
import { ChartExportService } from '../services/chartExportService'

interface ChartInfo {
  id: string
  title: string
  element: HTMLElement
  data?: any[]
}

interface BatchExportPanelProps {
  charts: ChartInfo[]
  className?: string
}

const BatchExportPanel: React.FC<BatchExportPanelProps> = ({ charts, className = '' }) => {
  const [isExporting, setIsExporting] = useState(false)
  const [selectedCharts, setSelectedCharts] = useState<Set<string>>(new Set())
  const [exportStatus, setExportStatus] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // 选择/取消选择所有图表
  const toggleSelectAll = () => {
    if (selectedCharts.size === charts.length) {
      setSelectedCharts(new Set())
    } else {
      setSelectedCharts(new Set(charts.map(chart => chart.id)))
    }
  }

  // 切换单个图表的选择状态
  const toggleChartSelection = (chartId: string) => {
    const newSelected = new Set(selectedCharts)
    if (newSelected.has(chartId)) {
      newSelected.delete(chartId)
    } else {
      newSelected.add(chartId)
    }
    setSelectedCharts(newSelected)
  }

  // 批量导出为PDF报告
  const handleBatchExportPDF = async () => {
    if (selectedCharts.size === 0) {
      setExportStatus({
        success: false,
        message: '请选择要导出的图表'
      })
      return
    }

    setIsExporting(true)
    setExportStatus(null)

    try {
      const selectedChartInfos = charts.filter(chart => selectedCharts.has(chart.id))
      
      await ChartExportService.exportMultipleCharts(
        selectedChartInfos.map(chart => ({
          element: chart.element,
          title: chart.title
        })),
        {
          format: 'pdf',
          filename: `charts-report-${new Date().getTime()}`
        }
      )

      setExportStatus({
        success: true,
        message: `成功导出 ${selectedCharts.size} 个图表到PDF报告`
      })
    } catch (error) {
      setExportStatus({
        success: false,
        message: error instanceof Error ? error.message : '批量导出失败'
      })
    } finally {
      setIsExporting(false)
    }
  }

  // 批量导出为图片
  const handleBatchExportImages = async () => {
    if (selectedCharts.size === 0) {
      setExportStatus({
        success: false,
        message: '请选择要导出的图表'
      })
      return
    }

    setIsExporting(true)
    setExportStatus(null)

    try {
      const selectedChartInfos = charts.filter(chart => selectedCharts.has(chart.id))
      
      // 逐个导出图片
      for (const chart of selectedChartInfos) {
        await ChartExportService.exportChartAsImage(chart.element, {
          format: 'png',
          filename: chart.title
        })
      }

      setExportStatus({
        success: true,
        message: `成功导出 ${selectedCharts.size} 个图表为PNG图片`
      })
    } catch (error) {
      setExportStatus({
        success: false,
        message: error instanceof Error ? error.message : '批量导出失败'
      })
    } finally {
      setIsExporting(false)
    }
  }

  // 批量导出数据
  const handleBatchExportData = () => {
    if (selectedCharts.size === 0) {
      setExportStatus({
        success: false,
        message: '请选择要导出数据的图表'
      })
      return
    }

    try {
      const selectedChartInfos = charts.filter(chart => selectedCharts.has(chart.id))
      
      // 导出所有数据到一个CSV文件
      const allData = selectedChartInfos.flatMap(chart => chart.data || [])
      
      if (allData.length === 0) {
        setExportStatus({
          success: false,
          message: '选中的图表没有可导出的数据'
        })
        return
      }

      ChartExportService.exportChartDataAsCSV(
        allData,
        `charts-data-${new Date().getTime()}`
      )

      setExportStatus({
        success: true,
        message: `成功导出 ${allData.length} 行数据到CSV文件`
      })
    } catch (error) {
      setExportStatus({
        success: false,
        message: error instanceof Error ? error.message : '数据导出失败'
      })
    }
  }

  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">批量导出</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            已选择 {selectedCharts.size} / {charts.length} 个图表
          </span>
        </div>
      </div>

      {/* 全选控制 */}
      <div className="flex items-center space-x-3 mb-4">
        <button
          onClick={toggleSelectAll}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          {selectedCharts.size === charts.length ? '取消全选' : '全选'}
        </button>
      </div>

      {/* 图表列表 */}
      <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
        {charts.map(chart => (
          <div key={chart.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={selectedCharts.has(chart.id)}
              onChange={() => toggleChartSelection(chart.id)}
              className="h-4 w-4 text-primary-600 rounded"
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{chart.title}</div>
              <div className="text-xs text-gray-500">
                {chart.data ? `${chart.data.length} 行数据` : '无数据'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 导出按钮组 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={handleBatchExportPDF}
          disabled={isExporting || selectedCharts.size === 0}
          className="flex items-center justify-center space-x-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          {isExporting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : (
            <FileText className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {isExporting ? '导出中...' : '导出PDF报告'}
          </span>
        </button>

        <button
          onClick={handleBatchExportImages}
          disabled={isExporting || selectedCharts.size === 0}
          className="flex items-center justify-center space-x-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
        >
          {isExporting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {isExporting ? '导出中...' : '导出PNG图片'}
          </span>
        </button>

        <button
          onClick={handleBatchExportData}
          disabled={selectedCharts.size === 0}
          className="flex items-center justify-center space-x-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
        >
          <Zap className="h-4 w-4" />
          <span className="text-sm font-medium">导出数据 (CSV)</span>
        </button>
      </div>

      {/* 导出状态提示 */}
      {exportStatus && (
        <div className={`mt-4 p-3 rounded-lg border ${
          exportStatus.success 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center space-x-2">
            {exportStatus.success ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{exportStatus.message}</span>
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-700">
          <strong>使用提示：</strong>
          <ul className="mt-1 space-y-1">
            <li>• PDF报告：将所有选中的图表导出到一个PDF文档中</li>
            <li>• PNG图片：为每个选中的图表单独导出PNG图片</li>
            <li>• 数据导出：将所有选中图表的数据合并到一个CSV文件中</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default BatchExportPanel