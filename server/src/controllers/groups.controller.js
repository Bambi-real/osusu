const supabaseAdmin = require('../lib/supabase');
const { generatePayoutSchedule } = require('../utils/generatePayoutSchedule');

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
    await supabaseAdmin
      .from('profiles')
      .update({ role: 'ORGANISER' })
      .eq('id', req.user.id);

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
            email: m.profiles.email,
            phone: m.profiles.phone
        }
    }));

    // Fetch Organiser details
    const { data: organiser } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .eq('id', group.organiser_id)
      .single() || { data: { id: group.organiser_id, full_name: 'Unknown' } };

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

exports.startGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    // req.group is already set by requireOrganiser middleware
    const group = req.group;

    if (group.status !== 'FORMING') {
        return res.status(400).json({ success: false, error: { message: 'Group has already started' } });
    }

    // Clamp start_date to now if it's in the past
    if (new Date(group.start_date) < new Date()) {
       group.start_date = new Date();
    }

    // Fetch members
    const { data: members, error: membersError } = await supabaseAdmin
      .from('group_members')
      .select('*')
      .eq('group_id', id);

    if (membersError || members.length < 2) {
      return res.status(400).json({ success: false, error: { message: 'A group requires at least 2 members to start' } });
    }

    // Generate schedule
    const cycles = generatePayoutSchedule(group, members);

    // Insert cycles
    const { error: cyclesError } = await supabaseAdmin
      .from('cycles')
      .insert(cycles);

    if (cyclesError) {
         return res.status(500).json({ success: false, error: { message: 'Failed to generate cycles' } });
    }

    // Update group status
    const { data: updatedGroup, error: updateError } = await supabaseAdmin
      .from('groups')
      .update({ status: 'ACTIVE', updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    res.status(200).json({ success: true, data: updatedGroup });

  } catch (error) {
    next(error);
  }
};

exports.getGroupSchedule = async (req, res, next) => {
   try {
       const { id } = req.params;
       
       // Note: Spec says Yes + Member. 
       
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