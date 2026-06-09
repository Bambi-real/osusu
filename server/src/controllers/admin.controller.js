const { supabaseAdmin } = require('../lib/supabase');

async function getPlatformStats(req, res, next) {
  try {
    const { data: stats, error } = await supabaseAdmin
      .from('platform_stats')
      .select('*')
      .single();

    if (error) {
      console.error('[ADMIN] Stats error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to load platform stats.' },
      });
    }

    return res.status(200).json({
      success: true,
      data: stats,
    });

  } catch (err) {
    next(err);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const search = req.query.search?.trim() || '';
    const from = (page - 1) * limit;
    const to   = from + limit - 1;

    let query = supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, role, created_at',
              { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) {
      query = query.ilike('full_name', `%${search}%`);
    }

    const { data: users, error, count } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to load users.' },
      });
    }

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });

  } catch (err) {
    next(err);
  }
}

async function getAllGroups(req, res, next) {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 20);
    const status = req.query.status || null;
    const from   = (page - 1) * limit;
    const to     = from + limit - 1;

    let query = supabaseAdmin
      .from('groups')
      .select(`
        id,
        name,
        description,
        contribution_amount,
        frequency,
        max_members,
        start_date,
        status,
        invite_code,
        organiser_id,
        created_at,
        profiles!groups_organiser_id_fkey (
          full_name,
          phone
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: groups, error, count } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to load groups.' },
      });
    }

    const groupIds = groups.map(g => g.id);
    const { data: memberCounts } = await supabaseAdmin
      .from('group_members')
      .select('group_id')
      .in('group_id', groupIds);

    const countMap = {};
    (memberCounts || []).forEach(row => {
      countMap[row.group_id] = (countMap[row.group_id] || 0) + 1;
    });

    const enriched = groups.map(g => ({
      ...g,
      member_count: countMap[g.id] || 0,
    }));

    return res.status(200).json({
      success: true,
      data: enriched,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });

  } catch (err) {
    next(err);
  }
}

async function getGroupDetail(req, res, next) {
  try {
    const { id } = req.params;

    const { data: group, error } = await supabaseAdmin
      .from('groups')
      .select(`
        *,
        profiles!groups_organiser_id_fkey (
          id, full_name, phone, role
        )
      `)
      .eq('id', id)
      .single();

    if (error || !group) {
      return res.status(404).json({
        success: false,
        error: { message: 'Group not found.' },
      });
    }

    const { data: members } = await supabaseAdmin
      .from('group_members')
      .select('*, profiles(id, full_name, phone, role)')
      .eq('group_id', id)
      .order('payout_order');

    const { data: cycles } = await supabaseAdmin
      .from('cycles')
      .select('*, profiles:payout_user_id(id, full_name, phone)')
      .eq('group_id', id)
      .order('cycle_number');

    const { data: contributions } = await supabaseAdmin
      .from('contributions')
      .select('amount, paid_at')
      .eq('group_id', id);

    const totalCollected = (contributions || [])
      .reduce((sum, c) => sum + Number(c.amount), 0);

    return res.status(200).json({
      success: true,
      data: {
        group,
        members:          members || [],
        cycles:           cycles  || [],
        totalCollected,
        contributionCount: (contributions || []).length,
      },
    });

  } catch (err) {
    next(err);
  }
}

async function getUserDetail(req, res, next) {
  try {
    const { id } = req.params;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !profile) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found.' },
      });
    }

    const { data: memberships } = await supabaseAdmin
      .from('group_members')
      .select('payout_order, joined_at, groups(id, name, status, contribution_amount, frequency)')
      .eq('user_id', id);

    const { data: contributions } = await supabaseAdmin
      .from('contributions')
      .select('amount')
      .eq('user_id', id);

    const totalContributed = (contributions || [])
      .reduce((sum, c) => sum + Number(c.amount), 0);

    return res.status(200).json({
      success: true,
      data: {
        profile,
        memberships:      memberships || [],
        totalContributed,
        contributionCount: (contributions || []).length,
      },
    });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPlatformStats,
  getAllUsers,
  getAllGroups,
  getGroupDetail,
  getUserDetail,
};
