import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Header from './components/Header'
import DataUpload from './components/DataUpload'
import DataExplorer from './components/DataExplorer'
import VisualizationPanel from './components/VisualizationPanel'
import AIAnalysisPanel from './components/AIAnalysisPanel'
import { DataContextProvider } from './contexts/DataContext'
import { AnalysisContextProvider } from './contexts/AnalysisContext'

export interface Dataset {
  id: string
  name: string
  columns: string[]
  data: any[]
  type: 'csv' | 'excel' | 'json'
  uploadedAt: Date
}

// Layout configuration
const LAYOUT_CONFIG = {
  grid: {
    base: 'grid-cols-1',
    lg: 'lg:grid-cols-4'
  },
  columns: {
    explorer: 'lg:col-span-1',
    visualization: 'lg:col-span-2',
    analysis: 'lg:col-span-1'
  }
}

const queryClient = new QueryClient()

function App() {
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null)

  // Main content renderer
  const renderMainContent = () => {
    if (!activeDataset) {
      return <DataUpload onDatasetUpload={setActiveDataset} />
    }

    return (
      <div className={`grid ${LAYOUT_CONFIG.grid.base} ${LAYOUT_CONFIG.grid.lg} gap-8`}>
        <div className={`${LAYOUT_CONFIG.columns.explorer} space-y-6`}>
          <DataExplorer dataset={activeDataset} />
        </div>
        
        <div className={`${LAYOUT_CONFIG.columns.visualization} space-y-6`}>
          <VisualizationPanel dataset={activeDataset} />
        </div>
        
        <div className={`${LAYOUT_CONFIG.columns.analysis} space-y-6`}>
          <AIAnalysisPanel dataset={activeDataset} />
        </div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DataContextProvider>
        <AnalysisContextProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            
            <main className="container mx-auto px-4 py-8">
              {renderMainContent()}
            </main>
          </div>
        </AnalysisContextProvider>
      </DataContextProvider>
    </QueryClientProvider>
  )
}

export default App