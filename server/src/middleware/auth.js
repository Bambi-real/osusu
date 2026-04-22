const supabaseAdmin = require('../lib/supabase');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, error: { message: 'No token provided' } });
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ success: false, error: { message: 'Invalid or expired token' } });
  }

  req.user = user; // user.id is the UUID used in all tables
  next();
}

module.exports = { authenticateToken };
