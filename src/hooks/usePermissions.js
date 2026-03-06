/**
 * usePermissions — Controle de acesso baseado em papel (RBAC)
 *
 * Papéis disponíveis:
 *   admin          → acesso total (gestão completa)
 *   account_manager → gerencia clientes, conteúdo e relatórios
 *   designer       → visualiza pautas e agenda
 *   videomaker     → visualiza demandas e agenda
 *
 * Uso:
 *   const { can } = usePermissions();
 *   if (can("edit_team")) { ... }
 */

import { useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";

// ── Matriz de permissões por papel ───────────────────────────────────────────
const PERMISSIONS = {
    admin: [
        "edit_team",
        "add_team",
        "change_team_status",
        "manage_clients",
        "delete_demand",
        "approve_content",
        "view_reports",
        "manage_settings",
        "export_data",
        "view_finance",
        "edit_kanban",
        "create_demands",
    ],
    account_manager: [
        "manage_clients",
        "approve_content",
        "view_reports",
        "export_data",
        "change_team_status",
        "edit_kanban",
        "create_demands",
    ],
    designer: [
        "approve_content",
        "move_own_demands",
    ],
    videomaker: [
        "move_own_demands",
    ],
};

// ── Hook ─────────────────────────────────────────────────────────────────────
export function usePermissions() {
    const { role } = useAuth();
    const allowed = PERMISSIONS[role] || [];

    const can = useCallback((permission) => allowed.includes(permission), [allowed]);
    const canAll = useCallback((permissions) => permissions.every(p => allowed.includes(p)), [allowed]);
    const canAny = useCallback((permissions) => permissions.some(p => allowed.includes(p)), [allowed]);

    return useMemo(() => ({
        can, canAll, canAny, role
    }), [can, canAll, canAny, role]);
}
