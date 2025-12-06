import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zxwoozdkkwcsmvvhaayl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4d29vemRra3djc212dmhhYXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MTkxOTMsImV4cCI6MjA3NzM5NTE5M30.c1HECxagL2O2j-w8VuUzW8A75T7325Q4poTPsj_4hyg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
