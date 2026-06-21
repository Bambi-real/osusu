const { supabaseAdmin } = require('../lib/supabase');
const logger = require('../lib/logger');
const ModemPay = require("modem-pay");
const modempay = new ModemPay(process.env.MODEMPAY_API_KEY);

exports.createContribution = async (req, res, next) => {
  try {
    const { groupId, cycleId, userId, amount, note } = req.body;

    if (Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: { message: "Amount must be greater than zero" } });
    }
    if (!groupId || !cycleId || !userId || !amount) {
      return res.status(400).json({ success: false, error: { message: 'Missing required fields' } });
    }

    const { data: group, error: groupFetchError } = await supabaseAdmin
      .from('groups')
      .select('contribution_amount, organiser_id, status')
      .eq('id', groupId)
      .single();
      
    if (groupFetchError || !group || Number(amount) !== group.contribution_amount) {
        return res.status(400).json({ success: false, error: { message: `Contribution amount must exactly match the group's designated amount.` } });
    }

    if (group.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: { message: 'This group has been cancelled. No new contributions can be recorded.' },
      });
    }

    if (group.organiser_id !== req.user.id) {
        return res.status(403).json({ success: false, error: { message: 'Only the group organiser can record contributions.' } });
    }

    const { data: cycle, error: cycleError } = await supabaseAdmin
      .from('cycles')
      .select('id, group_id, total_collected')
      .eq('id', cycleId)
      .single();

    if (cycleError || !cycle || cycle.group_id !== groupId) {
        return res.status(400).json({ success: false, error: { message: 'Cycle does not belong to this group.' } });
    }

    const { data: member, error: memberError } = await supabaseAdmin
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !member) {
        return res.status(400).json({ success: false, error: { message: 'User is not a member of this group.' } });
    }

    // Insert into contributions
    const { data: contribution, error: insertError } = await supabaseAdmin
      .from('contributions')
      .insert({
        group_id: groupId,
        cycle_id: cycleId,
        user_id: userId,
        amount,
        note
      })
      .select()
      .single();

    if (insertError || !contribution) {
      if (insertError && insertError.code === '23505') {
        return res.status(409).json({ success: false, error: { message: 'Contribution already recorded for this member in this cycle' } });
      }
      return res.status(500).json({ success: false, error: { message: 'Failed to record contribution' } });
    }

    // Atomically increment cycle total (prevents race conditions)
    const { error: rpcError } = await supabaseAdmin.rpc(
      'increment_total_collected',
      { cycle_id: cycleId, amount_to_add: Number(amount) }
    );
    if (rpcError) {
      // Rollback: delete the contribution we just inserted
      await supabaseAdmin.from('contributions').delete().eq('id', contribution.id);
      logger.error('Failed to increment total_collected — rolled back contribution', {
        contributionId: contribution.id, cycleId, amount, rpcError: rpcError.message,
      });
      return res.status(500).json({ success: false, error: { message: 'Failed to update cycle total. Please try again.' } });
    }

    res.status(201).json({ success: true, data: contribution });
  } catch (error) {
    next(error);
  }
};

exports.getGroupContributions = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const { data: isMember } = await supabaseAdmin
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', req.user.id)
      .single();
    if (!isMember) {
      return res.status(403).json({ success: false, error: { message: 'Not a member of this group' } });
    }

    const { data: contributions, error } = await supabaseAdmin
      .from('contributions')
      .select('*, profiles:user_id(id, full_name, phone)')
      .eq('group_id', groupId)
      .order('paid_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, error: { message: 'Failed to fetch contributions' } });
    }

    const formatted = contributions.map(c => {
       const { profiles, ...rest } = c;
       return { ...rest, user: profiles };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

exports.getMyContributions = async (req, res, next) => {
  try {
    const { data: contributions, error } = await supabaseAdmin
      .from('contributions')
      .select('*, groups(id, name), cycles(cycle_number)')
      .eq('user_id', req.user.id)
      .order('paid_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, error: { message: 'Failed to fetch contributions' } });
    }

    const formatted = contributions.map(c => {
      const { groups, cycles, ...rest } = c;
      return { 
        ...rest, 
        group: groups,
        cycle: cycles
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

exports.deleteContribution = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch the contribution to subtract the amount from cycle
    const { data: contribution, error: fetchError } = await supabaseAdmin
      .from('contributions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !contribution) {
      return res.status(404).json({ success: false, error: { message: 'Contribution not found' } });
    }

    // Ensure organiser is deleting it (handled by requireOrganiser middleware which needs groupId)
    // Wait, requireOrganiser uses req.params.groupId || req.params.id || req.body.groupId
    // If we call DELETE /api/contributions/:id, req.params.id is the contribution ID, not group ID!
    // Let's verify the group organiser manually here
    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .select('organiser_id')
      .eq('id', contribution.group_id)
      .single();
      
    if (groupError || !group) {
        return res.status(404).json({ success: false, error: { message: 'Group not found' } });
    }

    if (group.organiser_id !== req.user.id) {
       return res.status(403).json({ success: false, error: { message: 'Only the group organiser can do this' } });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('contributions')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(500).json({ success: false, error: { message: 'Failed to delete contribution' } });
    }

    // Atomically decrement cycle total (prevents race conditions)
    const { error: rpcError } = await supabaseAdmin.rpc(
      'decrement_total_collected',
      { cycle_id: contribution.cycle_id, amount_to_remove: Number(contribution.amount) }
    );
    if (rpcError) {
      logger.error('Failed to decrement total_collected — data may be inconsistent', {
        contributionId: id, cycleId: contribution.cycle_id, rpcError: rpcError.message,
      });
      // Don't rollback the delete since the contribution is already removed.
      // Log prominently so operators can reconcile.
    }

    res.status(200).json({ success: true, data: { message: 'Contribution deleted' } });
  } catch (error) {
    next(error);
  }
};
exports.payContributionViaModemPay = async (req, res, next) => {
  try {
    const { groupId, cycleId, userId, amount } = req.body;

    if (!groupId || !cycleId || !userId || !amount) {
      return res.status(400).json({ success: false, error: { message: 'Missing required fields' } });
    }

    const intent = await modempay.paymentIntents.create({
      amount: Number(amount),
      currency: "GMD",
      title: "Osusu Contribution",
      return_url: `${process.env.CLIENT_URL}/groups/${groupId}?paid=true`,
      cancel_url: `${process.env.CLIENT_URL}/groups/${groupId}?cancelled=true`
    });

    res.status(200).json({ success: true, payment_link: intent.data.payment_link });
  } catch (error) {
    next(error);
  }
};