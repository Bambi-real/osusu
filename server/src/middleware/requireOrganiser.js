const { supabaseAdmin } = require('../lib/supabase');
const logger = require('../lib/logger');

async function requireOrganiser(req, res, next) {
  try {
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
  } catch (error) {
    logger.error('requireOrganiser middleware error', { error: error.message, groupId: req.params.groupId || req.params.id });
    return res.status(500).json({ success: false, error: { message: 'Failed to verify group access. Please try again.' } });
  }
}

module.exports = { requireOrganiser };
