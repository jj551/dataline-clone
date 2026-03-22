import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AnalysisResult {
  id: string
  type: 'summary' | 'correlation' | 'trend' | 'insight'
  title: string
  description: string
  data: any
  createdAt: Date
}

interface AnalysisContextType {
  results: AnalysisResult[]
  addResult: (result: Omit<AnalysisResult, 'id' | 'createdAt'>) => void
  clearResults: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined)

export const useAnalysis = () => {
  const context = useContext(AnalysisContext)
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider')
  }
  return context
}

interface AnalysisProviderProps {
  children: ReactNode
}

export const AnalysisContextProvider: React.FC<AnalysisProviderProps> = ({ children }) => {
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (result: Omit<AnalysisResult, 'id' | 'createdAt'>) => {
    const newResult: AnalysisResult = {
      ...result,
      id: Date.now().toString(),
      createdAt: new Date()
    }
    setResults(prev => [newResult, ...prev])
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <AnalysisContext.Provider value={{
      results,
      addResult,
      clearResults,
      isLoading,
      setIsLoading
    }}>
      {children}
    </AnalysisContext.Provider>
  )
}