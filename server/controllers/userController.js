// server/controllers/userController.js
const { supabase } = require('../config/supabaseClient');

const uploadImage = async (username, profileImage) => {
  if (!profileImage) {
    return null;
  }

  const fileName = `${username}-${Date.now()}.jpg`;
  const fileBuffer = profileImage.buffer;

  const { data: fileData, error: uploadError } = await supabase.storage
    .from('profile-images')
    .upload(`profile-images/${fileName}`, fileBuffer, {
      upsert: false,
      contentType: 'image/jpeg',
    });

  if (uploadError) {
    throw new Error(`Error uploading image: ${uploadError.message}`);
  }

  return `${supabase.storageUrl}/object/public/${fileData.fullPath}`;
};

const signUpUser = async (req, res) => {
  const { email, password, username, fullName, birthdate } = req.body;
  const profileImage = req.file;

  if (!email || !password || !username || !fullName || !birthdate) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      if (signUpError.message === 'User already registered') {
        // Attempt to log in the user if they are already registered
        const { data: loginData, error: loginError } = await supabase.auth.signIn({
          email,
          password,
        });

        if (loginError) {
          return res.status(400).json({ error: 'Erro ao fazer login. Por favor, verifique suas credenciais.' });
        }

        const { data: profileData, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', loginData.user.id)
          .single();

        if (fetchError) {
          throw new Error(`Error fetching profile: ${fetchError.message}`);
        }

        return res.status(200).json({ message: 'Login bem-sucedido', user: loginData.user, profile: profileData });
      }
      throw new Error(`Error signing up: ${signUpError.message}`);
    }

    const userId = signUpData.user.id;

    let profileImageUrl = null;
    if (profileImage) {
      profileImageUrl = await uploadImage(username, profileImage);
    }

    const { error: insertError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          username,
          full_name: fullName,
          birthdate: new Date(birthdate.split('/').reverse().join('-')).toISOString().split('T')[0],
          profile_image: profileImageUrl,
        },
      ]);

    if (insertError) {
      throw new Error(`Error inserting profile: ${insertError.message}`);
    }

    const { data: profileData, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw new Error(`Error fetching profile: ${fetchError.message}`);
    }

    res.status(200).json({ message: 'Usuário criado com sucesso', user: signUpData.user, profile: profileData });
  } catch (err) {
    console.error('Erro inesperado:', err);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
  }
};

const loginUser = async (req, res) => {
  if (!req.body) {
    console.error('Request body is missing.');
    return res.status(400).json({ error: 'Request body is missing.' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    console.error('Email and password are required.');
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    console.log('Attempting to sign in with email:', email);
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      console.error('Login error:', loginError.message);
      return res.status(400).json({ error: 'Erro ao fazer login. Por favor, verifique suas credenciais.' });
    }

    console.log('Login successful for user ID:', loginData.user.id);
    const { data: profileData, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError.message);
      throw new Error(`Error fetching profile: ${fetchError.message}`);
    }

    res.status(200).json({ message: 'Login bem-sucedido', user: loginData.user, profile: profileData });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return res.status(400).json({ error: 'Erro ao deslogar.' });
    }
    res.status(200).json({ message: 'Logout bem-sucedido' });
  } catch (err) {
    console.error('Erro inesperado:', err);
    res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
  }
};

module.exports = { signUpUser, loginUser, logoutUser };