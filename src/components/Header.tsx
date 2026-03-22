import React from 'react'
import { Brain, Database, BarChart3 } from 'lucide-react'

// Feature item interface
interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
}

const Header: React.FC = () => {
  // Feature items configuration
  const featureItems: FeatureItem[] = [
    { icon: Database, label: 'Dataset' },
    { icon: BarChart3, label: 'Bar Chart' },
    { icon: Brain, label: 'AI Analysis' }
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        {/* Main header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Dataline AI</h1>
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              AI Data Analysis
            </span>
          </div>
          
          {/* Empty space for alignment */}
          <div className="w-16"></div>
        </div>
        
        {/* Feature descriptions */}
        <div className="flex items-center space-x-6 text-gray-600 mt-2">
          {featureItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <item.icon className="h-4 w-4" />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}

export default Header