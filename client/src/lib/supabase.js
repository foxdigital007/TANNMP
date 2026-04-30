import { createClient } from '@supabase/supabase-js';

// Anon key only — safe for frontend. All privileged ops go through Express backend.
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default supabase;
