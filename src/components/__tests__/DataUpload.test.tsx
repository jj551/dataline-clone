import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DataUpload from '../DataUpload'

// Mock the toBeInTheDocument matcher for Vitest
declare global {
  namespace Vi {
    interface Assertion {
      toBeInTheDocument(): void
    }
  }
}

describe('DataUpload Component', () => {
  const mockOnDatasetUpload = vi.fn()

  beforeEach(() => {
    mockOnDatasetUpload.mockClear()
  })

  it('renders upload interface correctly', () => {
    render(<DataUpload onDatasetUpload={mockOnDatasetUpload} />)
    
    expect(screen.getByText('Upload Your Data')).toBeDefined()
    expect(screen.getByText(/Start exploring your data with AI-powered analysis/)).toBeDefined()
  })

  it('shows supported file formats', () => {
    render(<DataUpload onDatasetUpload={mockOnDatasetUpload} />)
    
    expect(screen.getByText('CSV')).toBeDefined()
    expect(screen.getByText('Excel')).toBeDefined()
    expect(screen.getByText('JSON')).toBeDefined()
  })

  it('has a file input that accepts correct formats', () => {
    render(<DataUpload onDatasetUpload={mockOnDatasetUpload} />)
    
    const fileInput = screen.getByLabelText(/Choose File/i)
    expect(fileInput.getAttribute('accept')).toBe('.csv,.xlsx,.xls,.json')
  })

  it('displays feature cards', () => {
    render(<DataUpload onDatasetUpload={mockOnDatasetUpload} />)
    
    expect(screen.getByText('AI Analysis')).toBeDefined()
    expect(screen.getByText('Privacy First')).toBeDefined()
    expect(screen.getByText('Visualization')).toBeDefined()
  })

  it('handles drag and drop area', () => {
    render(<DataUpload onDatasetUpload={mockOnDatasetUpload} />)
    
    const dropArea = screen.getByText(/drag and drop your file here/i)
    expect(dropArea).toBeDefined()
  })
})