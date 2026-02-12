
import { supabase } from './supabase';

export const dataService = {
    clients: {
        getAll: async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('name');
            if (error) throw error;
            return data;
        },
        create: async (client) => {
            const { data, error } = await supabase
                .from('clients')
                .insert([client])
                .select();
            if (error) throw error;
            return data[0];
        },
        update: async (id, updates) => {
            const { data, error } = await supabase
                .from('clients')
                .update(updates)
                .eq('id', id)
                .select();
            if (error) throw error;
            return data[0];
        }
    },
    demands: {
        getAll: async () => {
            const { data, error } = await supabase
                .from('demands')
                .select(`
                    *,
                    clients (name),
                    services (name),
                    profiles (full_name, avatar_url)
                `)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        create: async (demand) => {
            const { data, error } = await supabase
                .from('demands')
                .insert([demand])
                .select();
            if (error) throw error;
            return data[0];
        },
        updateStatus: async (id, status) => {
            const { error } = await supabase
                .from('demands')
                .update({ status })
                .eq('id', id);
            if (error) throw error;
        }
    },
    services: {
        getAll: async () => {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .order('name');
            if (error) throw error;
            return data;
        }
    }
};
