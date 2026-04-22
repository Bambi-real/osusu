const supabaseAdmin = require('../lib/supabase');

exports.getCyclesByGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const { data: cycles, error } = await supabaseAdmin
      .from('cycles')
      .select('*, profiles:payout_user_id(id, full_name, phone)')
      .eq('group_id', groupId)
      .order('cycle_number', { ascending: true });

    if (error) {
      return res.status(500).json({ success: false, error: { message: 'Failed to get cycles' } });
    }

    const formattedCycles = cycles.map(c => {
      const { profiles, ...cycleData } = c;
      return {
        ...cycleData,
        payoutUser: profiles
      };
    });

    res.status(200).json({ success: true, data: formattedCycles });
  } catch (error) {
    next(error);
  }
};

exports.getCycleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: cycle, error: cycleError } = await supabaseAdmin
      .from('cycles')
      .select('*, profiles:payout_user_id(id, full_name, phone)')
      .eq('id', id)
      .single();

    if (cycleError) {
      return res.status(404).json({ success: false, error: { message: 'Cycle not found' } });
    }

    const { data: contributions, error: contribError } = await supabaseAdmin
      .from('contributions')
      .select('*, profiles:user_id(full_name)')
      .eq('cycle_id', id);

    if (contribError) {
      return res.status(500).json({ success: false, error: { message: 'Failed to get contributions' } });
    }

    const formattedContributions = contributions.map(c => ({
      ...c,
      full_name: c.profiles.full_name
    }));

    const { profiles, ...cycleData } = cycle;
    
    res.status(200).json({ 
      success: true, 
      data: {
        ...cycleData,
        payoutUser: profiles,
        contributions: formattedContributions
      } 
    });
  } catch (error) {
    next(error);
  }
};

exports.completeCycle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: cycle, error: cycleError } = await supabaseAdmin
      .from('cycles')
      .select('*')
      .eq('id', id)
      .single();

    if (cycleError || !cycle) {
      return res.status(404).json({ success: false, error: { message: 'Cycle not found' } });
    }

    // Verify organiser status. We can check via the group
    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .select('organiser_id')
      .eq('id', cycle.group_id)
      .single();

    if (groupError || !group) {
      return res.status(404).json({ success: false, error: { message: 'Group not found' } });
    }

    if (group.organiser_id !== req.user.id) {
      return res.status(403).json({ success: false, error: { message: 'Only organiser can mark cycle complete' } });
    }

    const { data: updatedCycle, error: updateError } = await supabaseAdmin
      .from('cycles')
      .update({ status: 'PAID_OUT' })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ success: false, error: { message: 'Failed to update cycle' } });
    }

    // Check if there is a next PENDING cycle to mark as COLLECTING
    const { data: nextCycle } = await supabaseAdmin
      .from('cycles')
      .select('id')
      .eq('group_id', cycle.group_id)
      .eq('status', 'PENDING')
      .order('cycle_number', { ascending: true })
      .limit(1)
      .single();

    if (nextCycle) {
       await supabaseAdmin
        .from('cycles')
        .update({ status: 'COLLECTING' })
        .eq('id', nextCycle.id);
    } else {
        // If no next cycle, the group is COMPLETED
        await supabaseAdmin
          .from('groups')
          .update({ status: 'COMPLETED' })
          .eq('id', cycle.group_id);
    }

    res.status(200).json({ success: true, data: updatedCycle });
  } catch (error) {
    next(error);
  }
};
