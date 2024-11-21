const { supabase } = require('./supabaseClient'); // Importar o cliente Supabase

// Função para registrar um novo usuário
const signUpUser  = async (email, password, username, fullName, birthdate) => {
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(`Erro ao registrar: ${error.message}`);
  }

  // Aqui você pode adicionar lógica para salvar o perfil no Supabase
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{ id: user.id, username, full_name: fullName, birthdate }]);

  if (profileError) {
    throw new Error(`Erro ao criar perfil: ${profileError.message}`);
  }

  return user;
};

// Função para login de usuário
const loginUser  = async (email, password) => {
  const { user, error } = await supabase.auth.signIn({
    email,
    password,
  });

  if (error) {
    throw new Error(`Erro ao fazer login: ${error.message}`);
  }

  return user;
};

// Função para deslogar usuário
const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Erro ao deslogar: ${error.message}`);
  }
};

module.exports = { signUpUser, loginUser, logoutUser };