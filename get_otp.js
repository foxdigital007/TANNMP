require('dotenv').config({ path: './server/.env' });
const supabase = require('./server/lib/supabase');

async function getLatestOTP() {
  const { data, error } = await supabase
    .from('members')
    .select('email, otp, first_name')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching OTP:', error);
    return;
  }

  console.log('\n-----------------------------------------');
  console.log(`LATEST OTP for ${data.first_name} (${data.email}): ${data.otp}`);
  console.log('-----------------------------------------\n');
}

getLatestOTP();
