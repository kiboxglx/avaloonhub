import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://hslmnfojscbvccvkxmuz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzbG1uZm9qc2NidmNjdmt4bXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MTc1MjQsImV4cCI6MjA4NjQ5MzUyNH0.NmkbV7dMIMcwIdHJXjzuPLmFABzqHcgy4na_r3k3zB0');

async function listUsers() {
    console.log('--- Buscando membros registrados na tabela team_members ---');
    const { data: members, error: membersErr } = await supabase
        .from('team_members')
        .select('*');

    if (membersErr) {
        console.error('Erro ao buscar membros:', membersErr);
    } else {
        console.table(members.map(m => ({
            id: m.id,
            nome: m.name,
            email: m.email,
            funcao: m.role,
            sistema: m.system_role
        })));
    }
}

listUsers();
