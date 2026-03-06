import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://hslmnfojscbvccvkxmuz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzbG1uZm9qc2NidmNjdmt4bXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MTc1MjQsImV4cCI6MjA4NjQ5MzUyNH0.NmkbV7dMIMcwIdHJXjzuPLmFABzqHcgy4na_r3k3zB0');

async function setupAdmin() {
    const adminEmail = 'admin@avaloon.com';

    // Check if user exists already
    const { data: existing, error: checkErr } = await supabase
        .from('team_members')
        .select('id')
        .eq('email', adminEmail)
        .single();

    if (existing) {
        // Update to admin
        const { error: updErr } = await supabase
            .from('team_members')
            .update({ system_role: 'admin' })
            .eq('email', adminEmail);
        if (updErr) console.error('Erro ao atualizar admin:', updErr);
        else console.log('Admin atualizado com sucesso!');
    } else {
        // Create new record
        const { error: insErr } = await supabase
            .from('team_members')
            .insert([{
                name: 'Administrador',
                email: adminEmail,
                role: 'Gestão',
                system_role: 'admin'
            }]);
        if (insErr) console.error('Erro ao criar admin:', insErr);
        else console.log('Novo admin criado na tabela de equipe!');
    }
}

setupAdmin();
