import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Dataset } from '../App'

interface DataContextType {
  datasets: Dataset[]
  addDataset: (dataset: Dataset) => void
  removeDataset: (id: string) => void
  activeDataset: Dataset | null
  setActiveDataset: (dataset: Dataset | null) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

interface DataProviderProps {
  children: ReactNode
}

export const DataContextProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null)

  const addDataset = (dataset: Dataset) => {
    setDatasets(prev => [...prev, dataset])
    setActiveDataset(dataset)
  }

  const removeDataset = (id: string) => {
    setDatasets(prev => prev.filter(dataset => dataset.id !== id))
    if (activeDataset?.id === id) {
      setActiveDataset(null)
    }
  }

  return (
    <DataContext.Provider value={{
      datasets,
      addDataset,
      removeDataset,
      activeDataset,
      setActiveDataset
    }}>
      {children}
    </DataContext.Provider>
  )
}