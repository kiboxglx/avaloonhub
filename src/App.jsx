import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import { PageSkeleton, CalendarSkeleton } from "@/components/ui/Skeleton";

// ─── Auth pages (small, kept eager) ─────────────────────────────────────────
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RoleSelection from "@/pages/RoleSelection";

// ─── App pages (Lazy Loaded — only downloaded when the user navigates there) ─
// Heaviest first
const Calendar = lazy(() => import("@/pages/Calendar"));
const Reports = lazy(() => import("@/pages/Reports"));
const Finance = lazy(() => import("@/pages/Finance"));
const Briefings = lazy(() => import("@/pages/Briefings"));
const ContentPlanning = lazy(() => import("@/pages/ContentPlanning"));
const DesignProductivity = lazy(() => import("@/pages/DesignProductivity"));
const ActivityLog = lazy(() => import("@/pages/ActivityLog"));

// Lighter pages
const TeamDirectory = lazy(() => import("@/pages/TeamDirectory"));
const Clients = lazy(() => import("@/pages/Clients"));
const Settings = lazy(() => import("@/pages/Settings"));
const Profile = lazy(() => import("@/pages/Profile"));
const InviteUser = lazy(() => import("@/pages/InviteUser"));
const DashboardHome = lazy(() => import("@/pages/DashboardHome"));

// ─── Shared loading fallback ──────────────────────────────────────────────────
function PageLoader() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-[#ec5b13] border-t-transparent rounded-full animate-spin" />
            <p className="text-muted text-sm animate-pulse">Carregando...</p>
        </div>
    );
}

// ─── Suspense wrapper helper ──────────────────────────────────────────────────
// Pass a custom fallback per route for content-aware loading skeletons
const S = ({ children, fallback }) => (
    <Suspense fallback={fallback ?? <PageSkeleton />}>{children}</Suspense>
);

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/roles" element={<RoleSelection />} />
                        <Route path="/" element={<Navigate to="/login" replace />} />

                        {/* Protected routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/dashboard" element={<DashboardLayout />}>
                                <Route index element={<S><DashboardHome /></S>} />
                                <Route path="calendar" element={<S fallback={<CalendarSkeleton />}><Calendar /></S>} />
                                <Route path="team" element={<S><TeamDirectory /></S>} />
                                <Route path="reports" element={<S><Reports /></S>} />
                                <Route path="clients" element={<S><Clients /></S>} />
                                <Route path="finance" element={<S><Finance /></S>} />
                                <Route path="settings" element={<S><Settings /></S>} />
                                <Route path="briefings" element={<S><Briefings /></S>} />
                                <Route path="profile" element={<S><Profile /></S>} />
                                <Route path="planning" element={<S><ContentPlanning /></S>} />
                                <Route path="activity" element={<S><ActivityLog /></S>} />
                                <Route path="productivity" element={<S><DesignProductivity /></S>} />
                                <Route path="users" element={<S><InviteUser /></S>} />
                            </Route>
                        </Route>

                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
