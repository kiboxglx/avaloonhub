import { supabase } from './supabase';
import { logger } from '@/utils/logger';
import { cacheService } from '@/utils/cacheService';

export const dataService = {
    clients: {
        getAll: async () => {
            return cacheService.withCache('clients_list', async () => {
                const { data, error } = await supabase
                    .from('clients')
                    .select(`
                        *,
                        account_manager:team_members!account_manager_id (id, name, avatar_url, email)
                    `)
                    .order('name');
                if (error) throw error;
                return data;
            }, 5 * 60 * 1000); // 5 min TTL
        },
        getByManager: async (managerId) => {
            const { data, error } = await supabase
                .from('clients')
                .select(`
                    *,
                    account_manager:team_members!account_manager_id (id, name, avatar_url, email)
                `)
                .eq('account_manager_id', managerId)
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
            cacheService.invalidate('clients_list');
            return data[0];
        },
        update: async (id, updates) => {
            const { data, error } = await supabase
                .from('clients')
                .update(updates)
                .eq('id', id)
                .select();
            if (error) throw error;
            cacheService.invalidate('clients_list');
            return data[0];
        }
    },
    demands: {
        // shared select fragment
        _select: `
            *,
            clients (id, name, account_manager_id),
            services (id, name),
            profiles (full_name, avatar_url),
            assignee:team_members!assigned_to (id, name, avatar_url)
        `,
        getAll: async function (startDate = null, endDate = null, limit = null) {
            let query = supabase
                .from('demands')
                .select(this._select);

            if (startDate) query = query.gte('scheduled_at', startDate);
            if (endDate) query = query.lte('scheduled_at', endDate);
            if (limit) query = query.limit(limit);

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        checkConflict: async function (memberId, dateStr, startTimeStr, durationHours, signal = null) {
            if (!memberId || !dateStr || !startTimeStr || !durationHours) return false;

            const newStart = new Date(`${dateStr}T${startTimeStr}:00`).getTime();
            const newEnd = newStart + (durationHours * 60 * 60 * 1000);

            // Create a safe 24h window around the proposed start time to account for timezone differences
            const startWindow = new Date(newStart - 24 * 60 * 60 * 1000).toISOString();
            const endWindow = new Date(newEnd + 24 * 60 * 60 * 1000).toISOString();

            // Get all demands for this user within the 48h window
            let query = supabase
                .from('demands')
                .select('id, title, scheduled_at, briefing_data')
                .eq('assigned_to', memberId)
                .gte('scheduled_at', startWindow)
                .lt('scheduled_at', endWindow);

            if (signal) query = query.abortSignal(signal);

            const { data, error } = await query;

            if (error) {
                // Ignore AbortError - it's a lifecycle event, not a system failure
                if (error.name === 'AbortError' || error.hash === 'abort' || error.message?.includes('aborted')) {
                    return false;
                }
                logger.error('FALHA_CHECAGEM_CONFLITO_AGENDA', 'Erro no banco de dados ao verificar conflitos', { memberId, error });
                return false;
            }

            if (!data || data.length === 0) return false;

            for (const d of data) {
                if (!d.scheduled_at) continue;

                // Duration fallback to 1h if not specified in briefing_data
                const existingDuration = d.briefing_data?.duration_hours || 1;

                const existingStart = new Date(d.scheduled_at).getTime();
                const existingEnd = existingStart + (existingDuration * 60 * 60 * 1000);

                // Overlap condition: startA < endB and endA > startB
                if (newStart < existingEnd && newEnd > existingStart) {
                    logger.warn('CONFLITO_AGENDA', 'Agendamento duplo evitado', {
                        attempted_booking: {
                            assigned_to: memberId,
                            requested_date: dateStr,
                            requested_start_time: startTimeStr,
                            requested_duration_hours: durationHours
                        },
                        conflicting_booking: {
                            demand_id: d.id,
                            demand_title: d.title,
                            existing_start: new Date(existingStart).toISOString(),
                            existing_end: new Date(existingEnd).toISOString()
                        }
                    });
                    return {
                        conflict: true,
                        conflictingDemand: d,
                        existingStart: new Date(existingStart).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                        existingEnd: new Date(existingEnd).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    };
                }
            }
            return false;
        },
        getByMember: async function (memberId, startDate = null, endDate = null, limit = null) {
            if (!memberId) return [];
            let query = supabase
                .from('demands')
                .select(this._select)
                .eq('assigned_to', memberId);

            if (startDate) query = query.gte('scheduled_at', startDate);
            if (endDate) query = query.lte('scheduled_at', endDate);
            if (limit) query = query.limit(limit);

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        getCreatorNotifications: async function (memberId) {
            if (!memberId) return [];
            // Filtra demandas criadas pelo usuário logado que tiveram aceite/recusa e ainda não foram notificadas
            const { data, error } = await supabase
                .from('demands')
                .select(this._select)
                .eq('briefing_data->>created_by', memberId)
                .eq('briefing_data->>creator_notified', 'false')
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
        createSafely: async (payload, signal = null) => {
            // payload in this case maps exactly to the RPC function arguments
            let query = supabase.rpc('book_demand_safely', payload);
            if (signal) query = query.abortSignal(signal);

            const { data, error } = await query;
            if (error) {
                // Ignore AbortError in logs
                if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                    throw error; // Rethrow so component knows it was aborted, but don't log here
                }
                throw error;
            }

            // Fire notification to the assignee (if assigned to someone)
            if (payload.p_assigned_to) {
                const demandTitle = payload.p_title || 'Nova Demanda';
                try {
                    await supabase.rpc('notify_user_safely', {
                        p_user_id: payload.p_assigned_to,
                        p_type: 'NEW_DEMAND',
                        p_related_entity_id: data?.id || null,
                        p_content: {
                            title: 'Nova demanda atribuída a você',
                            message: `Você foi designado(a) para a demanda "${demandTitle}".`,
                            icon_type: 'Zap',
                            action_url: '/dashboard/briefings',
                        },
                    });
                } catch (_) {
                    // Silent — notification failure should never block demand creation
                }
            }

            return data;
        },
        rejectDemand: async ({ demandId, demand, rejectorName, rejectorId, chips, text, delegateeId, delegateeName }) => {
            const chipLabels = {
                NO_TIME: 'Sem tempo hábil',
                MISSING_INFO: 'Faltam informações',
                WRONG_SCOPE: 'Escopo incorreto',
                WRONG_BRIEF: 'Briefing incompleto',
                OTHER: 'Outro motivo',
            };
            const chipText = chips.map(c => chipLabels[c] || c).join(', ');
            const fullReason = [chipText, text].filter(Boolean).join(' — ');

            const isDelegating = !!delegateeId;
            const now = new Date().toISOString();

            // Logs
            const logEntry = {
                user_id: rejectorId,
                user_name: rejectorName,
                at: now,
                reason_chips: chips,
                reason_text: text,
                delegated_to: delegateeId || null,
                delegated_to_name: delegateeName || null
            };

            const updatedBriefingData = {
                ...(demand?.briefing_data || {}),
                // Update history
                delegation_log: [...(demand?.briefing_data?.delegation_log || []), logEntry],
                // Store last action specifically too
                rejection_log: !isDelegating ? logEntry : (demand?.briefing_data?.rejection_log || null)
            };

            const updatePayload = {
                status: isDelegating ? 'pending_acceptance' : 'rejected',
                assigned_to: delegateeId || null,
                briefing_data: updatedBriefingData,
            };

            const { error } = await supabase
                .from('demands')
                .update(updatePayload)
                .eq('id', demandId);

            if (error) throw error;

            // --- Notifications ---
            let creatorId = demand?.briefing_data?.created_by;

            // Fallback: If no creatorId is found in briefing_data, use the client's account manager
            if (!creatorId && demand.clients?.account_manager_id) {
                creatorId = demand.clients.account_manager_id;
            }
            const notifications = [];

            if (isDelegating) {
                // 1. Notify New Assignee
                notifications.push(supabase.rpc('notify_user_safely', {
                    p_user_id: delegateeId,
                    p_type: 'DEMAND_DELEGATED',
                    p_related_entity_id: demandId,
                    p_content: {
                        title: `${rejectorName} delegou uma demanda para você`,
                        message: `Motivo: ${fullReason || 'Não especificado'}`,
                        icon_type: 'ArrowRight',
                        action_url: '/dashboard/briefings',
                    },
                }));

                // 2. Notify Creator (FYI)
                if (creatorId && creatorId !== rejectorId) {
                    notifications.push(supabase.rpc('notify_user_safely', {
                        p_user_id: creatorId,
                        p_type: 'DEMAND_DELEGATION_FYI',
                        p_related_entity_id: demandId,
                        p_content: {
                            title: `Demanda reatribuída por ${rejectorName}`,
                            message: `A demanda "${demand.title}" foi passada para ${delegateeName}.`,
                            icon_type: 'Users',
                            action_url: '/dashboard/briefings',
                        },
                    }));
                }
            } else {
                // Just Rejected - Notify Creator
                if (creatorId) {
                    notifications.push(supabase.rpc('notify_user_safely', {
                        p_user_id: creatorId,
                        p_type: 'DEMAND_REJECTED',
                        p_related_entity_id: demandId,
                        p_content: {
                            title: `Demanda recusada por ${rejectorName}`,
                            message: `A demanda "${demand.title}" foi devolvida para você. Motivo: ${fullReason || 'Não especificado'}`,
                            icon_type: 'XCircle',
                            action_url: '/dashboard/briefings',
                        },
                    }));
                } else {
                    console.warn('[REJECT] Creator ID not found in briefing_data', demand.briefing_data);
                }
            }

            if (notifications.length > 0) {
                await Promise.allSettled(notifications);
            }
        },

        update: async (id, fields) => {
            const { data, error } = await supabase
                .from('demands')
                .update(fields)
                .eq('id', id)
                .select();
            if (error) throw error;
            return data[0];
        },
        fullUpdate: async ({ demandId, updates, editorId, editorName }) => {
            // 1. Get current demand state to compare
            const { data: current, error: fetchErr } = await supabase
                .from('demands')
                .select('*, assignee:team_members!assigned_to(id, name)')
                .eq('id', demandId)
                .single();

            if (fetchErr) throw fetchErr;

            const oldAssigneeId = current.assigned_to;
            const newAssigneeId = updates.assigned_to;
            const isReassigning = oldAssigneeId !== newAssigneeId;

            // 2. Prepare the update payload
            const finalUpdates = { ...updates };

            // If reassigning, we reset acceptance status
            if (isReassigning) {
                finalUpdates.briefing_data = {
                    ...(updates.briefing_data || current.briefing_data || {}),
                    is_accepted: false,
                    reassigned_from: oldAssigneeId,
                    reassigned_at: new Date().toISOString()
                };
                finalUpdates.status = 'TODO'; // Reverts to backlog if someone else needs to accept
            }

            // 3. Perform the update
            const { data: updated, error: updateErr } = await supabase
                .from('demands')
                .update(finalUpdates)
                .eq('id', demandId)
                .select()
                .single();

            if (updateErr) throw updateErr;

            // 4. Handle Notifications for Reassignment
            if (isReassigning) {
                const notifications = [];

                // Notify OLD assignee if they were removed
                if (oldAssigneeId) {
                    notifications.push({
                        user_id: oldAssigneeId,
                        type: 'DEMAND_UPDATE',
                        content: {
                            title: 'Demanda Reatribuída',
                            message: `A demanda "${updated.title}" foi transferida para outro profissional por ${editorName}.`,
                            action_url: `/dashboard/briefings`
                        }
                    });
                }

                // Notify NEW assignee if someone was added
                if (newAssigneeId) {
                    notifications.push({
                        user_id: newAssigneeId,
                        type: 'NEW_DEMAND',
                        content: {
                            title: 'Nova Demanda Atribuída',
                            message: `${editorName} atribuiu a demanda "${updated.title}" a você.`,
                            action_url: `/dashboard/briefings`
                        }
                    });
                }

                if (notifications.length > 0) {
                    await supabase.from('notifications').insert(notifications);
                }
            }

            return updated;
        },
        updateStatus: async (id, status) => {
            const { error } = await supabase
                .from('demands')
                .update({ status })
                .eq('id', id);
            if (error) throw error;
        }
    },
    team: {
        getAll: async () => {
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .order('name');
            if (error) throw error;
            return data;
        },
        create: async (member) => {
            const { data, error } = await supabase
                .from('team_members')
                .insert([member])
                .select();
            if (error) throw error;
            return data[0];
        },
        update: async (id, updates) => {
            const { data, error } = await supabase
                .from('team_members')
                .update(updates)
                .eq('id', id)
                .select();
            if (error) throw error;
            return data[0];
        },
        updateStatus: async (id, status) => {
            const { error } = await supabase
                .from('team_members')
                .update({ status })
                .eq('id', id);
            if (error) throw error;
        },
        delete: async (id) => {
            const { error } = await supabase
                .from('team_members')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        getByEmail: async (email) => {
            if (!email) return null;
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .eq('email', email)
                .maybeSingle();
            if (error) throw error;
            return data;
        },
        getAccountManagers: async () => {
            const { data, error } = await supabase
                .from('team_members')
                .select('id, name, avatar_url, email, system_role, area')
                .or('area.eq.ACCOUNTS,system_role.eq.account_manager,role.ilike.%Gerente%')
                .order('name');
            if (error) throw error;
            return data;
        },
    },
    // Alias for consistency
    teamMembers: {
        getAll: async () => dataService.team.getAll(),
        getByEmail: async (email) => dataService.team.getByEmail(email),
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
    },
    productionRecords: {
        getByMember: async (teamMemberId) => {
            const { data, error } = await supabase
                .from('production_records')
                .select('*')
                .eq('team_member_id', teamMemberId)
                .order('month_year', { ascending: false });
            if (error) throw error;
            return data;
        },
        upsert: async (record) => {
            // Upsert by team_member_id + month_year (unique pair)
            const { data, error } = await supabase
                .from('production_records')
                .upsert(record, { onConflict: 'team_member_id,month_year' })
                .select();
            if (error) throw error;
            return data?.[0];
        }
    },
    dashboard: {
        getKPIs: async () => {
            const now = new Date();
            const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

            const [
                { count: totalDemands },
                { count: activeDemands },
                { count: doneDemands },
                { count: activeClients },
                { data: teamData },
                { data: productionThisMonth },
                { data: clientsData },
                { data: monthDemands },
            ] = await Promise.all([
                supabase.from('demands').select('*', { count: 'exact', head: true }),
                supabase.from('demands').select('*', { count: 'exact', head: true })
                    .not('status', 'eq', 'DONE').not('status', 'eq', 'CANCELLED'),
                supabase.from('demands').select('*', { count: 'exact', head: true })
                    .eq('status', 'DONE').gte('created_at', monthStart).lte('created_at', monthEnd),
                supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'Ativo'),
                supabase.from('team_members').select('status'),
                supabase.from('production_records').select('file_count').eq('month_year', monthYear),
                supabase.from('clients').select('monthly_value').eq('status', 'Ativo'),
                supabase.from('demands').select('status, area, briefing_data')
                    .gte('created_at', monthStart).lte('created_at', monthEnd),
            ]);

            const availableTeam = (teamData || []).filter(m => m.status === 'Available').length;
            const totalTeam = (teamData || []).length;
            const totalArtes = (productionThisMonth || []).reduce((s, r) => s + (r.file_count || 0), 0);
            const monthlyRevenue = (clientsData || []).reduce((s, c) => s + (c.monthly_value || 0), 0);

            // ── Area KPI breakdown ────────────────────────────────────────────
            const all = monthDemands || [];
            const vm = all.filter(d => d.area === 'VIDEOMAKER');
            const ds = all.filter(d => d.area === 'DESIGN');
            const tf = all.filter(d => d.area === 'TRAFFIC');

            // Platform frequency for Design
            const platformCounts = {};
            ds.forEach(d => {
                const p = d.briefing_data?.platform;
                if (p) platformCounts[p] = (platformCounts[p] || 0) + 1;
            });
            const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

            const videomaker = {
                totalMonth: vm.filter(d => d.status === 'DONE').length,
                mediaDays: vm.filter(d => d.status === 'DONE' && d.briefing_data?.production_type === 'MEDIA_DAY').length,
                gravacoes: vm.filter(d => d.status === 'DONE' && d.briefing_data?.production_type === 'GRAVACAO').length,
                edicoes: vm.filter(d => d.status === 'DONE' && d.briefing_data?.production_type === 'EDICAO').length,
                inProgress: vm.filter(d => d.status === 'DOING').length,
                todo: vm.filter(d => d.status === 'TODO').length,
            };

            const design = {
                artesMonth: totalArtes,
                done: ds.filter(d => d.status === 'DONE').length,
                review: ds.filter(d => d.status === 'REVIEW').length,
                inProgress: ds.filter(d => d.status === 'DOING').length,
                topPlatform,
            };

            const traffic = {
                active: tf.filter(d => d.status === 'DOING').length,
                done: tf.filter(d => d.status === 'DONE').length,
                todo: tf.filter(d => d.status === 'TODO').length,
                totalBudget: tf.reduce((s, d) => s + (parseFloat(d.briefing_data?.budget) || 0), 0),
            };

            return {
                totalDemands: totalDemands || 0,
                activeDemands: activeDemands || 0,
                doneDemands: doneDemands || 0,
                activeClients: activeClients || 0,
                availableTeam,
                totalTeam,
                totalArtes,
                monthlyRevenue,
                videomaker,
                design,
                traffic,
            };
        },
        getDemandsPerMonth: async () => {
            const months = [];
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const label = d.toLocaleString('pt-BR', { month: 'short' });
                const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
                const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();
                months.push({ label, start, end });
            }
            const results = await Promise.all(months.map(async m => {
                const { count } = await supabase.from('demands')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', m.start).lte('created_at', m.end);
                return { name: m.label, value: count || 0 };
            }));
            return results;
        }
    }
};

