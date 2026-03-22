import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Header from '../Header'

describe('Header Component', () => {
  it('renders the application title', () => {
    render(<Header />)
    
    expect(screen.getByText('DataLine Clone')).toBeDefined()
  })

  it('displays the AI Data Analysis subtitle', () => {
    render(<Header />)
    
    expect(screen.getByText('AI Data Analysis')).toBeDefined()
  })

  it('shows privacy-focused features', () => {
    render(<Header />)
    
    expect(screen.getByText('Local First')).toBeDefined()
    expect(screen.getByText('Privacy Focused')).toBeDefined()
  })

  it('renders the description text', () => {
    render(<Header />)
    
    expect(screen.getByText(/AI-powered data exploration and visualization/)).toBeDefined()
    expect(screen.getByText(/Your data never leaves your device/)).toBeDefined()
  })
})