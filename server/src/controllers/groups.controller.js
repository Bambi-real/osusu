const { supabaseAdmin } = require('../lib/supabase');
const { generatePayoutSchedule } = require('../utils/generatePayoutSchedule');
const { shuffle } = require('../utils/shuffle');

exports.createGroup = async (req, res, next) => {
  try {
    const { name, description, contributionAmount, frequency, maxMembers, startDate } = req.body;

    if (!name || !contributionAmount || !frequency || !maxMembers || !startDate) {
      return res.status(400).json({ success: false, error: { message: 'Missing required fields' } });
    }

    // Insert into groups
    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .insert({
        name,
        description,
        contribution_amount: contributionAmount,
        frequency,
        max_members: maxMembers,
        start_date: startDate,
        organiser_id: req.user.id
      })
      .select()
      .single();

    if (groupError) {
      return res.status(500).json({ success: false, error: { message: 'Error creating group' } });
    }

    // Update profiles to ORGANISER
    const { error: roleError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'ORGANISER', updated_at: new Date().toISOString() })
      .eq('id', req.user.id);

    if (roleError) {
      console.error('[INFO] Failed to update profile role to ORGANISER:', roleError);
    }

    // Insert into group_members
    const { error: memberError } = await supabaseAdmin
      .from('group_members')
      .insert({
        user_id: req.user.id,
        group_id: group.id,
        payout_order: 1
      });

    if (memberError) {
        return res.status(500).json({ success: false, error: { message: 'Error adding member to group' } });
    }

    res.status(201).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

exports.getMyGroups = async (req, res, next) => {
  try {
    const { data: members, error } = await supabaseAdmin
      .from('group_members')
      .select(`
        payout_order,
        groups (*)
      `)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(500).json({ success: false, error: { message: 'Error fetching groups' } });
    }
    
    // Flatten structure for easier client consumption
    const groups = members.map(m => ({
        ...m.groups,
        payout_order: m.payout_order
    }));

    res.status(200).json({ success: true, data: groups });
  } catch (error) {
    next(error);
  }
};

exports.getGroupById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch Group
    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .select('*')
      .eq('id', id)
      .single();

    if (groupError) {
       if (groupError.code === 'PGRST116') { 
          return res.status(404).json({ success: false, error: { message: 'Group not found' } });
       }
       return res.status(500).json({ success: false, error: { message: 'Database error' } });
    }

    // Verify membership (or allow if they just have the link? Spec says "Yes + member")
    const { data: isMember } = await supabaseAdmin
      .from('group_members')
      .select('id')
      .eq('group_id', id)
      .eq('user_id', req.user.id)
      .single();

    if (!isMember) {
        return res.status(403).json({ success: false, error: { message: 'Not a member of this group' } });
    }

    // Fetch Members
    const { data: membersData, error: membersError } = await supabaseAdmin
      .from('group_members')
      .select('*, profiles(id, full_name, phone)')
      .eq('group_id', id)
      .order('payout_order', { ascending: true });
      
    if (membersError) {
        return res.status(500).json({ success: false, error: { message: 'Database error fetching members' } });
    }
      
    // Re-shape the members to put the joined profiles info onto a "user" key like spec
    const members = (membersData || []).map(m => ({
        ...m,
        user: {
            id: m.profiles.id,
            fullName: m.profiles.full_name,
            phone: m.profiles.phone
        }
    }));

    // Fetch Organiser details
    let organiser = { id: group.organiser_id, full_name: 'Unknown' };
    const { data: organiserData } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .eq('id', group.organiser_id)
      .single();
    if (organiserData) {
      organiser = organiserData;
    }

    // Fetch current active cycle if any
    let currentCycle = null;
    const { data: cycle } = await supabaseAdmin
        .from('cycles')
        .select('*')
        .eq('group_id', id)
        .eq('status', 'COLLECTING')
        .limit(1)
        .single();
        
    if (cycle) {
        // Also fetch contributions for this cycle
        const { data: contributions } = await supabaseAdmin
            .from('contributions')
            .select('*')
            .eq('cycle_id', cycle.id);
            
        currentCycle = { ...cycle, contributions: contributions || [] };
    }

    res.status(200).json({ 
        success: true, 
        data: { 
            group, 
            members, 
            currentCycle, 
            organiser 
        } 
    });
  } catch (error) {
    next(error);
  }
};

exports.joinGroup = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) return res.status(400).json({ success: false, error: { message: 'Invite code required' } });

    // Find group
    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups')
      .select('*')
      .eq('invite_code', inviteCode)
      .single();

    if (groupError || !group) {
        return res.status(404).json({ success: false, error: { message: 'Invalid invite code' } });
    }

    if (group.status === 'CANCELLED') {
        return res.status(400).json({ success: false, error: { message: 'This group has been cancelled and is no longer accepting members.' } });
    }

    if (group.status !== 'FORMING') {
        return res.status(400).json({ success: false, error: { message: 'This group has already started' } });
    }

    // Count members
    const { count, error: countError } = await supabaseAdmin
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id);
        
    if (count >= group.max_members) {
        return res.status(400).json({ success: false, error: { message: 'Group is full' } });
    }

    // Check if already member
    const { data: existing } = await supabaseAdmin
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', req.user.id)
        .single();
        
    if (existing) {
        return res.status(409).json({ success: false, error: { message: 'You are already a member' } });
    }

    // Insert
    const { error: insertError } = await supabaseAdmin
        .from('group_members')
        .insert({
            user_id: req.user.id,
            group_id: group.id,
            payout_order: count + 1
        });
        
    if (insertError) {
         return res.status(500).json({ success: false, error: { message: 'Failed to join group' } });
    }

    res.status(200).json({ success: true, data: { message: 'Joined successfully', groupId: group.id } });
  } catch (error) {
    next(error);
  }
};

exports.deleteGroup = async (req, res, next) => {
  try {
    const { id } = req.params;

    const group = req.group;

    if (group.status !== 'FORMING') {
      return res.status(400).json({
        success: false,
        error: {
          message: group.status === 'ACTIVE'
            ? 'An active group cannot be deleted. You can archive it instead to preserve member records.'
            : group.status === 'COMPLETED'
            ? 'A completed group cannot be deleted. It contains financial records for your members.'
            : 'This group cannot be deleted.',
        },
      });
    }

    const { error } = await supabaseAdmin
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete group error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to delete group. Please try again.' },
      });
    }

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Group deleted successfully.',
    });

  } catch (err) {
    next(err);
  }
};

exports.cancelGroup = async (req, res, next) => {
  try {
    const { id } = req.params;

    const group = req.group;

    if (group.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: {
          message: group.status === 'FORMING'
            ? 'This group has not started yet. You can delete it instead.'
            : group.status === 'COMPLETED'
            ? 'This group has already completed. No action needed.'
            : group.status === 'CANCELLED'
            ? 'This group is already cancelled.'
            : 'This group cannot be cancelled.',
        },
      });
    }

    const { data: updatedGroup, error } = await supabaseAdmin
      .from('groups')
      .update({
        status: 'CANCELLED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Cancel group error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to cancel group. Please try again.' },
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedGroup,
      message: 'Group has been cancelled. All contribution history has been preserved.',
    });

  } catch (err) {
    next(err);
  }
};

exports.startGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const group = req.group;

    if (group.status === 'CANCELLED') {
        return res.status(400).json({ success: false, error: { message: 'This group has been cancelled and cannot be restarted.' } });
    }

    if (group.status !== 'FORMING') {
        return res.status(400).json({ success: false, error: { message: 'Group has already started' } });
    }

    if (new Date(group.start_date) < new Date()) {
       const newStartDate = new Date().toISOString();
       await supabaseAdmin
         .from('groups')
         .update({ start_date: newStartDate })
         .eq('id', id);
       group.start_date = newStartDate;
    }

    // Fetch members (sorted by join order via payout_order)
    const { data: members, error: membersError } = await supabaseAdmin
      .from('group_members')
      .select('*')
      .eq('group_id', id)
      .order('payout_order', { ascending: true });

    if (membersError || members.length < 2) {
      return res.status(400).json({ success: false, error: { message: 'A group requires at least 2 members to start' } });
    }

    // Save original payout_orders for possible rollback
    const originalOrders = members.map(m => ({ id: m.id, payout_order: m.payout_order }));

    // Helper to batch-update payout_order for all members.
    // Returns true on success, false if any update failed.
    async function updatePayoutOrders(orderList) {
      const results = await Promise.all(
        orderList.map(m =>
          supabaseAdmin
            .from('group_members')
            .update({ payout_order: m.payout_order })
            .eq('id', m.id)
        )
      );
      return !results.some(r => r.error);
    }

    // Fisher-Yates shuffle for unbiased random payout order
    const shuffled = shuffle([...members]);

    // Reassign payout_order based on shuffled position
    const membersWithNewOrder = shuffled.map((member, index) => ({
      ...member,
      payout_order: index + 1,
    }));

    // Update each member's payout_order in the database
    if (!(await updatePayoutOrders(membersWithNewOrder))) {
      return res.status(500).json({ success: false, error: { message: 'Failed to assign payout order' } });
    }

    // Generate schedule using the shuffled order
    const cycles = generatePayoutSchedule(group, membersWithNewOrder);

    // Insert cycles
    const { error: cyclesError } = await supabaseAdmin
      .from('cycles')
      .insert(cycles);

    // Compensating rollback: if cycle insertion fails, restore original payout_orders
    if (cyclesError) {
      await updatePayoutOrders(originalOrders);
      return res.status(500).json({ success: false, error: { message: 'Failed to generate cycles' } });
    }

    // Update group status
    const { data: updatedGroup, error: statusError } = await supabaseAdmin
      .from('groups')
      .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (statusError) {
      // Rollback: restore original payout_orders and delete inserted cycles
      await updatePayoutOrders(originalOrders);
      await supabaseAdmin
        .from('cycles')
        .delete()
        .eq('group_id', id);
      return res.status(500).json({ success: false, error: { message: 'Failed to update group status' } });
    }

    res.status(200).json({ success: true, data: updatedGroup });

  } catch (error) {
    next(error);
  }
};

exports.getGroupSchedule = async (req, res, next) => {
   try {
        const { id } = req.params;

        const { data: isMember } = await supabaseAdmin
          .from('group_members')
          .select('id')
          .eq('group_id', id)
          .eq('user_id', req.user.id)
          .single();
        if (!isMember) {
          return res.status(403).json({ success: false, error: { message: 'Not a member of this group' } });
        }

        const { data: cycles, error } = await supabaseAdmin
        .from('cycles')
        .select('*, profiles:payout_user_id(id, full_name, phone)')
        .eq('group_id', id)
        .order('cycle_number', { ascending: true });
        
       if (error) {
           console.error('Schedule Fetch Error:', error);
           return res.status(500).json({ success: false, error: { message: 'Failed to get schedule' } });
       }
       
       // map to payoutUser 
       const formattedCycles = cycles.map(c => {
           const { profiles, ...cycleData } = c;
           return {
               ...cycleData,
               payoutUser: profiles
           };
       });
       
       res.status(200).json({ success: true, data: formattedCycles });
   } catch(error) {
       next(error);
   }
}

exports.getGroupMembers = async (req, res, next) => {
   try {
        const { id } = req.params;

        const { data: isMember } = await supabaseAdmin
          .from('group_members')
          .select('id')
          .eq('group_id', id)
          .eq('user_id', req.user.id)
          .single();
        if (!isMember) {
          return res.status(403).json({ success: false, error: { message: 'Not a member of this group' } });
        }

        const { data: membersData, error } = await supabaseAdmin
         .from('group_members')
         .select('*, profiles(id, full_name, phone)')
         .eq('group_id', id)
         .order('payout_order', { ascending: true });
        
       if (error) {
           return res.status(500).json({ success: false, error: { message: 'Failed to get members' } });
       }
       
       const members = membersData.map(m => ({
            ...m,
            user: {
                id: m.profiles.id,
                fullName: m.profiles.full_name,
                phone: m.profiles.phone
            }
        }));
        
       res.status(200).json({ success: true, data: members });
   } catch(error) {
       next(error);
   }
}