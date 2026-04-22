require('dotenv').config();
const supabaseAdmin = require('./src/lib/supabase');

async function testQuery() {
    const { data: group, error } = await supabaseAdmin
        .from('groups')
        .select('id')
        .limit(1)
        .single();
    
    if (group) {
        const id = group.id;
        console.log("Found group:", id);
        
        const { data: cycles, err } = await supabaseAdmin
            .from('cycles')
            .select('*, profiles:payout_user_id(id, full_name, phone)')
            .eq('group_id', id)
            .order('cycle_number', { ascending: true });
        console.log("Cycles error:", err);
        console.log("Cycles data length:", cycles ? cycles.length : 0);
    }
}
testQuery();
