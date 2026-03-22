import React, { useState, useRef } from 'react'
import { Download, Image, FileText, Zap, AlertCircle, Check } from 'lucide-react'
import { ChartExportService, ExportOptions } from '../services/chartExportService'

interface ChartExportButtonProps {
  chartElementRef: React.RefObject<HTMLDivElement>
  chartTitle: string
  chartData?: any[]
  className?: string
}

const ChartExportButton: React.FC<ChartExportButtonProps> = ({
  chartElementRef,
  chartTitle,
  chartData,
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const [showFormatMenu, setShowFormatMenu] = useState(false)
  const [lastExportStatus, setLastExportStatus] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const menuRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭菜单
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowFormatMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExport = async (format: ExportOptions['format']) => {
    if (!chartElementRef.current) {
      setLastExportStatus({
        success: false,
        message: '未找到图表元素'
      })
      return
    }

    setIsExporting(true)
    setLastExportStatus(null)

    try {
      const options: ExportOptions = {
        format,
        filename: `${chartTitle}-${new Date().getTime()}`,
        title: chartTitle,
        description: `生成于 ${new Date().toLocaleString()}`
      }

      switch (format) {
        case 'png':
        case 'jpeg':
          await ChartExportService.exportChartAsImage(chartElementRef.current, options)
          break
        case 'svg':
          ChartExportService.exportChartAsSVG(chartElementRef.current, options)
          break
        case 'pdf':
          await ChartExportService.exportChartAsPDF(chartElementRef.current, options)
          break
      }

      setLastExportStatus({
        success: true,
        message: `图表已成功导出为 ${format.toUpperCase()} 格式`
      })
    } catch (error) {
      setLastExportStatus({
        success: false,
        message: error instanceof Error ? error.message : '导出失败'
      })
    } finally {
      setIsExporting(false)
      setShowFormatMenu(false)
    }
  }

  const handleExportData = () => {
    if (!chartData || chartData.length === 0) {
      setLastExportStatus({
        success: false,
        message: '没有数据可导出'
      })
      return
    }

    try {
      ChartExportService.exportChartDataAsCSV(
        chartData,
        `${chartTitle}-data-${new Date().getTime()}`
      )
      
      setLastExportStatus({
        success: true,
        message: '数据已成功导出为 CSV 格式'
      })
    } catch (error) {
      setLastExportStatus({
        success: false,
        message: error instanceof Error ? error.message : '数据导出失败'
      })
    }
  }

  const getFormatIcon = (format: ExportOptions['format']) => {
    switch (format) {
      case 'png':
      case 'jpeg':
        return <Image className="h-4 w-4" />
      case 'svg':
        return <Zap className="h-4 w-4" />
      case 'pdf':
        return <FileText className="h-4 w-4" />
      default:
        return <Download className="h-4 w-4" />
    }
  }

  const supportedFormats = ChartExportService.getSupportedFormats()

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* 主下载按钮 */}
      <button
        onClick={() => setShowFormatMenu(!showFormatMenu)}
        disabled={isExporting}
        className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        title="导出图表"
      >
        {isExporting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {isExporting ? '导出中...' : '导出图表'}
        </span>
      </button>

      {/* 格式选择菜单 */}
      {showFormatMenu && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-2">
              选择导出格式
            </div>
            
            {/* 图片格式 */}
            <div className="mb-2">
              <div className="text-xs font-medium text-gray-700 mb-1 px-2">图片格式</div>
              {supportedFormats
                .filter(f => f.value === 'png' || f.value === 'jpeg' || f.value === 'svg')
                .map(format => (
                  <button
                    key={format.value}
                    onClick={() => handleExport(format.value)}
                    className="flex items-center space-x-2 w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {getFormatIcon(format.value)}
                    <div className="text-left">
                      <div className="font-medium">{format.label}</div>
                      <div className="text-xs text-gray-500">{format.description}</div>
                    </div>
                  </button>
                ))
              }
            </div>

            {/* 文档格式 */}
            <div className="mb-2">
              <div className="text-xs font-medium text-gray-700 mb-1 px-2">文档格式</div>
              {supportedFormats
                .filter(f => f.value === 'pdf')
                .map(format => (
                  <button
                    key={format.value}
                    onClick={() => handleExport(format.value)}
                    className="flex items-center space-x-2 w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {getFormatIcon(format.value)}
                    <div className="text-left">
                      <div className="font-medium">{format.label}</div>
                      <div className="text-xs text-gray-500">{format.description}</div>
                    </div>
                  </button>
                ))
              }
            </div>

            {/* 数据导出 */}
            {chartData && chartData.length > 0 && (
              <div className="border-t border-gray-200 pt-2">
                <button
                  onClick={handleExportData}
                  className="flex items-center space-x-2 w-full px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">导出数据 (CSV)</div>
                    <div className="text-xs text-gray-500">导出原始数据表格</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 导出状态提示 */}
      {lastExportStatus && (
        <div className={`absolute top-full right-0 mt-2 p-3 rounded-lg border ${
          lastExportStatus.success 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-center space-x-2">
            {lastExportStatus.success ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{lastExportStatus.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChartExportButton