import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://kzaitfmyxljzygtnyxua.supabase.co'
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YWl0Zm15eGxqenlndG55eHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MjI1NzEsImV4cCI6MjA5NTI5ODU3MX0.w_XZjZ8MuHxguOfjBwe5hK-a21vR6_htC-2n2V9wvXg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
