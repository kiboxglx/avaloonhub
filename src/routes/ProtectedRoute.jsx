import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ allowedRoles = [] }) {
    const { user, role, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background text-white">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If user is logged in but hasn't selected a role, force them to select one
    // UNLESS they are already on the role selection page (handled by router config)
    if (!role && window.location.pathname !== "/role-selection") {
        return <Navigate to="/role-selection" replace />;
    }

    // If roles are specified, check if user has one of them
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        // User doesn't have permission
        return <Navigate to="/dashboard" replace />; // or 403 page
    }

    return <Outlet />;
}
