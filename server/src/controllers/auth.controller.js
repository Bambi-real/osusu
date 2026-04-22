const supabaseAdmin = require('../lib/supabase');
const { createClient } = require('@supabase/supabase-js');

exports.register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ success: false, error: { message: 'All fields are required' } });
    }

    if (!/^\+220[0-9]{7}$/.test(phone)) {
        return res.status(400).json({ success: false, error: { message: 'Phone must be in format +220XXXXXXX' } });
    }

    // Check if phone exists
    const { data: existingPhone } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingPhone) {
      return res.status(409).json({ success: false, error: { message: 'Phone number already in use' } });
    }

    // Create user in Supabase auth
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: fullName, phone },
      email_confirm: true
    });

    if (createError) {
      if (createError.message.includes('already been registered')) {
        return res.status(409).json({ success: false, error: { message: 'Email already exists' } });
      }
      return res.status(400).json({ success: false, error: { message: createError.message } });
    }

    // Ensure profile row exists (Supabase trigger might create it, but we confirm/insert to be safe)
    let { data: userProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, role, created_at')
      .eq('id', authData.user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile not found, insert it
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert([{ id: authData.user.id, full_name: fullName, phone: phone, role: 'MEMBER' }])
        .select('id, full_name, phone, role, created_at')
        .single();
        
      if (insertError) {
        return res.status(500).json({ success: false, error: { message: 'Error creating profile' } });
      }
      userProfile = newProfile;
    } else if (profileError) {
       return res.status(500).json({ success: false, error: { message: 'Error fetching profile' } });
    }

    // Sign in to get session
    const tempClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: signInData, error: signInError } = await tempClient.auth.signInWithPassword({
      email,
      password
    });

    if (signInError || !signInData.session) {
      return res.status(500).json({ success: false, error: { message: 'Error logging in after registration' } });
    }

    const token = signInData.session.access_token;
    const refreshToken = signInData.session.refresh_token;

    const safeProfileObject = {
      id: userProfile.id,
      email: email,
      fullName: userProfile.full_name,
      phone: userProfile.phone,
      role: userProfile.role,
      createdAt: userProfile.created_at
    };

    res.status(201).json({ success: true, data: { token, refreshToken, user: safeProfileObject } });

  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
       return res.status(400).json({ success: false, error: { message: 'Email and password required' } });
    }

    const tempClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: signInData, error: signInError } = await tempClient.auth.signInWithPassword({
      email,
      password
    });

    if (signInError || !signInData.session) {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    }

    const token = signInData.session.access_token;
    const refreshToken = signInData.session.refresh_token;
    
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, role, created_at')
      .eq('id', signInData.user.id)
      .single();

    if (profileError || !userProfile) {
       return res.status(500).json({ success: false, error: { message: 'Error fetching profile' } });
    }

    const safeProfileObject = {
      id: userProfile.id,
      email: signInData.user.email,
      fullName: userProfile.full_name,
      phone: userProfile.phone,
      role: userProfile.role,
      createdAt: userProfile.created_at
    };

    res.status(200).json({ success: true, data: { token, refreshToken, user: safeProfileObject } });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
     const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, role, created_at')
      .eq('id', req.user.id)
      .single();
      
     if (profileError) {
         return res.status(404).json({ success: false, error: { message: 'Profile not found' } });
     }
     
     const safeProfileObject = {
      id: userProfile.id,
      email: req.user.email,
      fullName: userProfile.full_name,
      phone: userProfile.phone,
      role: userProfile.role,
      createdAt: userProfile.created_at
    };
    
    res.status(200).json({ success: true, data: safeProfileObject });

  } catch(error) {
      next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { fullName, phone } = req.body;
        
        const updateData = {};
        if (fullName) updateData.full_name = fullName;
        if (phone) updateData.phone = phone;
        
        const { data: userProfile, error: updateError } = await supabaseAdmin
          .from('profiles')
          .update(updateData)
          .eq('id', req.user.id)
          .select('id, full_name, phone, role, created_at')
          .single();
          
        if (updateError) {
            if (updateError.code === '23505') {
                 return res.status(409).json({ success: false, error: { message: 'Phone number already in use' } });
            }
            return res.status(500).json({ success: false, error: { message: 'Failed to update profile' } });
        }
        
        const safeProfileObject = {
          id: userProfile.id,
          email: req.user.email,
          fullName: userProfile.full_name,
          phone: userProfile.phone,
          role: userProfile.role,
          createdAt: userProfile.created_at
        };
        
        res.status(200).json({ success: true, data: safeProfileObject });
    } catch(error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ success: false, error: { message: 'Password must be at least 8 characters' } });
        }
        
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            req.user.id, 
            { password: newPassword }
        );
        
        if (updateError) {
            return res.status(500).json({ success: false, error: { message: updateError.message } });
        }
        
        res.status(200).json({ success: true, data: { message: 'Password updated successfully' } });
    } catch(error) {
        next(error);
    }
}
