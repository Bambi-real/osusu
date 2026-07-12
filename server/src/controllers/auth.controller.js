const { supabaseAdmin, supabaseAnon } = require('../lib/supabase');

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
      email_confirm: false
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

    // Send verification email manually
await supabaseAdmin.auth.admin.generateLink({
  type: 'signup',
  email: email,
  options: {
    redirectTo: `${process.env.CLIENT_URL}/login?verified=true`
  }
}).then(async ({ data }) => {
  if (data?.properties?.action_link) {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'noreply@osusu.tech',
      to: email,
      subject: 'Verify your Osusu account',
      html: `
        <h2>Welcome to Osusu!</h2>
        <p>Hi ${fullName}, click the link below to verify your email address:</p>
        <a href="${data.properties.action_link}" style="background:#16a34a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0;">Verify Email</a>
        <p>If you didn't create an account, ignore this email.</p>
      `
    });
  }
});

return res.status(201).json({
  success: true,
  data: { requiresEmailVerification: true }
});

    const safeProfileObject = {
      id: userProfile.id,
      email: email,
      fullName: userProfile.full_name,
      phone: userProfile.phone,
      role: userProfile.role,
      createdAt: userProfile.created_at
    };

    res.status(201).json({
      success: true,
      data: {
        access_token:  signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
        expires_at:    signInData.session.expires_at,
        user:          safeProfileObject,
      }
    });

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

    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password
    });

    if (signInError || !signInData.session) {
      return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    }

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

    res.status(200).json({
      success: true,
      data: {
        access_token:  signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
        expires_at:    signInData.session.expires_at,
        user:          safeProfileObject,
      }
    });
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
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email address is required.' }
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: { message: 'Please enter a valid email address.' }
      });
    }

    // Check if user exists
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const user = users?.users?.find(u => u.email === email.trim().toLowerCase());

    if (!user) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'If that email is registered, a reset link has been sent.',
      });
    }

    // Generate reset token
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Store token in database
    await supabaseAdmin.from('password_reset_tokens').insert({
      user_id: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    });

    // Send reset email via Resend
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: 'noreply@osusu.tech',
      to: email.trim().toLowerCase(),
      subject: 'Reset your Osusu password',
      html: `
        <h2>Reset your password</h2>
        <p>Click the link below to reset your Osusu password. This link expires in 1 hour.</p>
        <a href="${resetLink}" style="background:#16a34a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0;">Reset Password</a>
        <p>If you didn't request this, ignore this email.</p>
      `
    });

    return res.status(200).json({
      success: true,
      data: null,
      message: 'If that email is registered, a reset link has been sent.',
    });

  } catch (err) {
    console.error('[INFO] forgotPassword error:', err);
    return res.status(200).json({
      success: true,
      data: null,
      message: 'If that email is registered, a reset link has been sent.',
    });
  }
};
exports.resetPassword = async (req, res, next) => {
  try {
    const { newPassword, token } = req.body;

    if (!newPassword || !token) {
      return res.status(400).json({
        success: false,
        error: { message: 'New password and reset token are required.' }
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: { message: 'Password must be at least 8 characters long.' }
      });
    }

    // Look up token
    const { data: resetToken, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !resetToken) {
      return res.status(401).json({
        success: false,
        error: { message: 'This reset link is invalid or has expired.' }
      });
    }

    // Check expiry
    if (new Date(resetToken.expires_at) < new Date()) {
      await supabaseAdmin.from('password_reset_tokens').delete().eq('token', token);
      return res.status(401).json({
        success: false,
        error: { message: 'This reset link has expired. Please request a new one.' }
      });
    }

    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      resetToken.user_id,
      { password: newPassword }
    );

    if (updateError) {
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to update password. Please try again.' }
      });
    }

    // Delete token after use
    await supabaseAdmin.from('password_reset_tokens').delete().eq('token', token);

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Password updated successfully.',
    });

  } catch (err) {
    next(err);
  }
};

    