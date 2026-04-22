require('dotenv').config();
const supabaseAdmin = require('./src/lib/supabase');

async function testQuery() {
    const { data: members, error } = await supabaseAdmin
      .from('group_members')
      .select(`
        payout_order,
        groups (*)
      `)
      .limit(1);
    
    console.log("Error:", error);
    console.log("Data:", JSON.stringify(members, null, 2));
}
testQuery();
