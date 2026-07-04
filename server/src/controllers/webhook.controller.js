const crypto = require('crypto');
const { supabaseAdmin } = require('../lib/supabase');
function parseReference(reference) {
  if (!reference || !reference.startsWith('OSUSU-')) return null;
  const parts = reference.split('-');
  if (parts.length < 5) return null;
  return {
    groupId:   parts[1],
    cycleId:   parts[2],
    userId:    parts[3],
    timestamp: parseInt(parts[4]),
  };
}
exports.handleHexaiWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const sig = req.headers['x-hexai-signature'];
    const secret = process.env.HEXAI_WEBHOOK_SECRET;

    if (secret && sig) {
      const hash = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (sig !== hash) {
        return res.status(401).json({ message: 'Invalid signature' });
      }
    }

    const { event, transaction } = req.body;

    // Only handle successful payments
    if (event !== 'transaction.completed' || transaction?.status !== 'SUCCEEDED') {
      return res.status(200).json({ received: true });
    }

    // Parse the reference to get groupId, cycleId, userId
    const ref = parseReference(transaction.client_reference);
    if (!ref) {
      return res.status(200).json({ received: true });
    }

    const { groupId, cycleId, userId } = ref;

    // Get group contribution amount
    const { data: group } = await supabaseAdmin
      .from('groups')
      .select('contribution_amount')
      .eq('id', groupId)
      .single();

    if (!group) return res.status(200).json({ received: true });

    // Check if already paid
    const { data: existing } = await supabaseAdmin
      .from('contributions')
      .select('id')
      .eq('cycle_id', cycleId)
      .eq('user_id', userId)
      .single();

    if (existing) return res.status(200).json({ received: true });

    // Insert contribution as paid
    await supabaseAdmin.from('contributions').insert({
      group_id: groupId,
      cycle_id: cycleId,
      user_id: userId,
      amount: group.contribution_amount,
      note: 'Paid via Wave (HexAI)',
    });

    // Update cycle total
    await supabaseAdmin.rpc('increment_total_collected', {
      cycle_id: cycleId,
      amount_to_add: Number(group.contribution_amount),
    });

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ received: true });
  }
};