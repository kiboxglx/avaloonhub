import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";

// Pages
import Login from "@/pages/Login";
import RoleSelection from "@/pages/RoleSelection";
import Calendar from "@/pages/Calendar";
import TeamDirectory from "@/pages/TeamDirectory";
import Reports from "@/pages/Reports";
import Briefings from "@/pages/Briefings";
import Profile from "@/pages/Profile";
import Finance from "@/pages/Finance";
import Clients from "@/pages/Clients";
import Settings from "@/pages/Settings";
import ContentPlanning from "@/pages/ContentPlanning";
import ActivityLog from "@/pages/ActivityLog"; // Import Activity Log

import DashboardHome from "@/pages/DashboardHome";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Role Selection Screen */}
                    <Route path="/roles" element={<RoleSelection />} />

                    {/* Default redirect to login or roles based on auth state (handled by ProtectedRoute logic usually, but here simple redirect) */}
                    <Route path="/" element={<Navigate to="/roles" replace />} />

                    <Route element={<ProtectedRoute />}>
                        {/* Dashboard Routes */}
                        <Route path="/dashboard" element={<DashboardLayout />}>
                            <Route index element={<DashboardHome />} />
                            <Route path="calendar" element={<Calendar />} />
                            <Route path="team" element={<TeamDirectory />} />
                            <Route path="reports" element={<Reports />} />
                            <Route path="clients" element={<Clients />} />
                            <Route path="finance" element={<Finance />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="briefings" element={<Briefings />} />
                            <Route path="profile" element={<Profile />} />
                            <Route path="planning" element={<ContentPlanning />} />
                            <Route path="activity" element={<ActivityLog />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
