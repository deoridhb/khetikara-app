import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  throw new Error('Missing Supabase configuration')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Test connection on app start
supabase
  .from('categories')
  .select('count(*)')
  .single()
  .then(({ data, error }) => {
    if (error) {
      console.error('Supabase connection failed:', error)
    } else {
      console.log('✅ Supabase connected successfully')
    }
  })