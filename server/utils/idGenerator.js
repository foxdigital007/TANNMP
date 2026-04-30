const supabase = require('../lib/supabase');

/**
 * Generates the next sequential TANNMP member ID.
 * Uses a PostgreSQL function to ensure uniqueness under concurrent requests.
 * @returns {Promise<string>} e.g. "TANNMP0001"
 */
const generateMemberId = async () => {
  const { data, error } = await supabase.rpc('get_next_member_id');

  if (error) {
    console.error('Member ID generation error:', error);
    throw new Error('Failed to generate member ID');
  }

  return data;
};

/**
 * Generates a 6-digit numeric OTP.
 * @returns {string}
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Returns OTP expiry timestamp (5 minutes from now).
 * @returns {Date}
 */
const getOTPExpiry = () => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 5);
  return expiry;
};

module.exports = { generateMemberId, generateOTP, getOTPExpiry };
