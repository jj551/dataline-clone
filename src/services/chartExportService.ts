// 图表导出服务
export interface ExportOptions {
  format: 'png' | 'jpeg' | 'svg' | 'pdf'
  quality?: number // 0-1, 仅适用于JPEG
  width?: number
  height?: number
  filename?: string
  title?: string
  description?: string
}

export class ChartExportService {
  /**
   * 将图表导出为图片
   */
  static async exportChartAsImage(
    chartElement: HTMLElement,
    options: ExportOptions
  ): Promise<void> {
    const { format, quality = 0.92, filename = 'chart' } = options
    
    try {
      // 使用html2canvas库进行截图
      const html2canvas = await import('html2canvas')
      const canvas = await html2canvas.default(chartElement, {
        scale: 2, // 高清导出
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      const imageData = canvas.toDataURL(`image/${format}`, quality)
      this.downloadFile(imageData, `${filename}.${format}`)
    } catch (error) {
      console.error('图片导出失败:', error)
      throw new Error('图表导出失败，请重试')
    }
  }

  /**
   * 导出为SVG矢量图
   */
  static exportChartAsSVG(chartElement: HTMLElement, options: ExportOptions): void {
    const { filename = 'chart' } = options
    
    try {
      // 获取SVG内容
      const svgElement = chartElement.querySelector('svg')
      if (!svgElement) {
        throw new Error('未找到SVG元素')
      }
      
      // 克隆SVG元素以避免修改原元素
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement
      
      // 设置SVG属性
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      
      // 创建SVG字符串
      const svgString = new XMLSerializer().serializeToString(clonedSvg)
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })
      
      this.downloadBlob(svgBlob, `${filename}.svg`)
    } catch (error) {
      console.error('SVG导出失败:', error)
      throw new Error('SVG导出失败，请重试')
    }
  }

  /**
   * 导出为PDF文档
   */
  static async exportChartAsPDF(
    chartElement: HTMLElement,
    options: ExportOptions & { title?: string; description?: string }
  ): Promise<void> {
    const { filename = 'chart', title = '图表', description = '' } = options
    
    try {
      // 动态导入jsPDF库
      const { jsPDF } = await import('jspdf')
      const html2canvas = await import('html2canvas')
      
      // 创建PDF文档
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })
      
      // 添加标题
      pdf.setFontSize(16)
      pdf.text(title, 20, 20)
      
      if (description) {
        pdf.setFontSize(10)
        pdf.text(description, 20, 30)
      }
      
      // 将图表转换为图片
      const canvas = await html2canvas.default(chartElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      
      // 计算图片在PDF中的尺寸
      const imgWidth = 190 // A4宽度减去边距
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // 添加图片到PDF
      pdf.addImage(imgData, 'PNG', 10, 40, imgWidth, imgHeight)
      
      // 下载PDF
      pdf.save(`${filename}.pdf`)
    } catch (error) {
      console.error('PDF导出失败:', error)
      throw new Error('PDF导出失败，请重试')
    }
  }

  /**
   * 批量导出多个图表
   */
  static async exportMultipleCharts(
    charts: Array<{ element: HTMLElement; title: string }>,
    options: ExportOptions & { format: 'pdf' }
  ): Promise<void> {
    const { filename = 'charts-report' } = options
    
    try {
      const { jsPDF } = await import('jspdf')
      const html2canvas = await import('html2canvas')
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      let yPosition = 20
      
      for (let i = 0; i < charts.length; i++) {
        const { element, title } = charts[i]
        
        // 如果当前页空间不足，添加新页
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 20
        }
        
        // 添加图表标题
        pdf.setFontSize(14)
        pdf.text(title, 20, yPosition)
        yPosition += 10
        
        // 转换图表为图片
        const canvas = await html2canvas.default(element, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: '#ffffff'
        })
        
        const imgData = canvas.toDataURL('image/png')
        const imgWidth = 170
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        
        // 如果图片高度超过页面剩余空间，调整尺寸
        const availableHeight = 297 - yPosition - 20 // A4高度减去边距
        const finalHeight = Math.min(imgHeight, availableHeight)
        const finalWidth = (imgWidth * finalHeight) / imgHeight
        
        pdf.addImage(imgData, 'PNG', (210 - finalWidth) / 2, yPosition, finalWidth, finalHeight)
        yPosition += finalHeight + 20
      }
      
      pdf.save(`${filename}.pdf`)
    } catch (error) {
      console.error('批量导出失败:', error)
      throw new Error('批量导出失败，请重试')
    }
  }

  /**
   * 导出图表数据为CSV
   */
  static exportChartDataAsCSV(data: any[], filename: string = 'chart-data'): void {
    try {
      if (!data || data.length === 0) {
        throw new Error('没有数据可导出')
      }
      
      // 获取所有可能的列名
      const allColumns = new Set<string>()
      data.forEach(row => {
        Object.keys(row).forEach(key => allColumns.add(key))
      })
      
      const columns = Array.from(allColumns)
      
      // 创建CSV内容
      const csvContent = [
        columns.join(','), // 表头
        ...data.map(row => 
          columns.map(col => {
            const value = row[col]
            // 处理特殊字符和逗号
            if (value === null || value === undefined) return ''
            const stringValue = String(value)
            return stringValue.includes(',') ? `"${stringValue}"` : stringValue
          }).join(',')
        )
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      this.downloadBlob(blob, `${filename}.csv`)
    } catch (error) {
      console.error('CSV导出失败:', error)
      throw new Error('数据导出失败，请重试')
    }
  }

  /**
   * 通用文件下载方法
   */
  private static downloadFile(dataUrl: string, filename: string): void {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * 通用Blob下载方法
   */
  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * 获取支持的导出格式
   */
  static getSupportedFormats(): Array<{
    value: ExportOptions['format']
    label: string
    description: string
  }> {
    return [
      {
        value: 'png',
        label: 'PNG图片',
        description: '高质量位图，适合网页和演示'
      },
      {
        value: 'jpeg',
        label: 'JPEG图片',
        description: '压缩图片，文件较小'
      },
      {
        value: 'svg',
        label: 'SVG矢量图',
        description: '无损矢量格式，可无限缩放'
      },
      {
        value: 'pdf',
        label: 'PDF文档',
        description: '包含图表和标题的文档格式'
      }
    ]
  }
}