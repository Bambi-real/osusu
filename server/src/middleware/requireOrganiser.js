const { supabaseAdmin } = require('../lib/supabase');

async function requireOrganiser(req, res, next) {
  const groupId = req.params.groupId || req.params.id || req.body.groupId;

  const { data: group, error } = await supabaseAdmin
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (error || !group) {
    return res.status(404).json({ success: false, error: { message: 'Group not found' } });
  }
  if (group.organiser_id !== req.user.id) {
    return res.status(403).json({ success: false, error: { message: 'Only the group organiser can do this' } });
  }

  req.group = group;
  next();
}

module.exports = { requireOrganiser };