import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function listUsers() {
    const { data, error } = await supabase
        .from('team_members')
        .select('id, name, email, system_role');

    if (error) {
        console.error('Error fetching team members:', error);
    } else {
        console.log('Team Members found:');
        console.table(data);
    }
}

listUsers();
