require('dotenv').config({ path: 'server/.env' });
const supabaseAdmin = require('./server/src/lib/supabase');

async function testQuery() {
    const { data: cycles, error } = await supabaseAdmin
        .from('cycles')
        .select('*, profiles:payout_user_id(id, full_name, phone)')
        .limit(1);
        
    console.log("Error:", error);
    console.log("Data:", cycles);
}
testQuery();