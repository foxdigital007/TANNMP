const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use SERVICE ROLE KEY — bypasses RLS, only used server-side
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = supabase;
