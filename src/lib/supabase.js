import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ezctmesapmuuoiusjlau.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6Y3RtZXNhcG11dW9pdXNqbGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0OTIyMTEsImV4cCI6MjA3MTA2ODIxMX0.kV1E_riNha-IgX5__Lf3XO1HTYhP4e01o_GlJ1Pbo_4"

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