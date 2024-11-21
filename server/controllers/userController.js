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
        return res.status(400).json({ error: 'Usuário já registrado. Por favor, faça login.' });
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

module.exports = { signUpUser };