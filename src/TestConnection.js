import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase values
const supabaseUrl = 'https://ezctmesapmuuoiusjlau.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Y3RtZXNhcG11dW9pdXNqbGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0OTIyMTEsImV4cCI6MjA3MTA2ODIxMX0.kV1E_riNha-IgX5__Lf3XO1HTYhP4e01o_GlJ1Pbo_4
'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const TestConnection = () => {
  const [status, setStatus] = useState('🔄 Testing connection...')
  const [details, setDetails] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...')
        
        // Test 1: Basic connection to categories
        const { data: categories, error: catError } = await supabase
          .from('categories')
          .select('*')
        
        if (catError) {
          throw new Error(`Categories error: ${catError.message}`)
        }

        // Test 2: Products with grades view
        const { data: products, error: prodError } = await supabase
          .from('products_with_grades')
          .select('*')
          .limit(3)
        
        if (prodError) {
          throw new Error(`Products error: ${prodError.message}`)
        }

        // Test 3: Market metrics
        const { data: metrics, error: metError } = await supabase
          .from('market_metrics')
          .select('*')
          .limit(3)
        
        if (metError) {
          throw new Error(`Market metrics error: ${metError.message}`)
        }

        // Success!
        setStatus('✅ Connection Successful!')
        setDetails({
          categories: categories?.length || 0,
          products: products?.length || 0,
          metrics: metrics?.length || 0,
          sampleCategory: categories?.[0]?.name || 'None',
          sampleProduct: products?.[0]?.name || 'None'
        })
        
        console.log('Connection test passed!', {
          categories: categories?.length,
          products: products?.length,
          metrics: metrics?.length
        })

      } catch (err) {
        console.error('Connection test failed:', err)
        setError(err.message)
        setStatus('❌ Connection Failed')
      }
    }

    testConnection()
  }, [])

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '20px auto',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>🧪 Supabase Connection Test</h2>
      
      <div style={{ 
        padding: '15px', 
        backgroundColor: error ? '#ffebee' : details ? '#e8f5e8' : '#fff3cd',
        borderRadius: '4px',
        margin: '10px 0'
      }}>
        <h3>{status}</h3>
        
        {error && (
          <div style={{ color: '#d32f2f', marginTop: '10px' }}>
            <strong>Error Details:</strong>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
              {error}
            </pre>
          </div>
        )}
        
        {details && (
          <div style={{ marginTop: '10px' }}>
            <h4>📊 Database Statistics:</h4>
            <ul>
              <li>Categories found: <strong>{details.categories}</strong></li>
              <li>Products found: <strong>{details.products}</strong></li>
              <li>Market metrics: <strong>{details.metrics}</strong></li>
              <li>Sample category: <strong>{details.sampleCategory}</strong></li>
              <li>Sample product: <strong>{details.sampleProduct}</strong></li>
            </ul>
          </div>
        )}
      </div>

      <div style={{ fontSize: '14px', color: '#666', marginTop: '15px' }}>
        <strong>Expected Results:</strong>
        <ul>
          <li>Categories: 4 (Vegetables, Fruits, Leafy Greens, Herbs & Spices)</li>
          <li>Products: 6 (Tomatoes, Onion, Carrot, Potato, Cabbage, Spinach)</li>
          <li>Market metrics: 4 (Various market indicators)</li>
        </ul>
      </div>
    </div>
  )
}

export default TestConnection