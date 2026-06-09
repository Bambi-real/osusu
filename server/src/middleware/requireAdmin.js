const { supabaseAdmin } = require('../lib/supabase');

async function requireAdmin(req, res, next) {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied.' },
      });
    }

    if (profile.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Admin access required.' },
      });
    }

    req.adminProfile = profile;
    next();

  } catch (err) {
    next(err);
  }
}

module.exports = { requireAdmin };
