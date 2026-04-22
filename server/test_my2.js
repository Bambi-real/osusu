require('dotenv').config();
const supabaseAdmin = require('./src/lib/supabase');

async function testQuery() {
    const { data: members, error } = await supabaseAdmin
      .from('group_members')
      .select(`
        payout_order,
        groups (*)
      `)
      .eq('user_id', 'dummy');
    
    console.log("Error:", error);
    console.log("Data:", members);
}
testQuery();
