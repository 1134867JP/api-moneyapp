// server/models/userModel.js
const { supabase } = require('../config/supabaseClient');

const createUser  = async (userData) => {
  const { data, error } = await supabase.from('users').insert(userData);
  return { data, error };
};

module.exports = { createUser };