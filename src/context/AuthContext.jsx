import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null); // 'admin', 'videomaker', 'traffic_manager'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage on mount
        const storedUser = localStorage.getItem("avaloon_user");
        const storedRole = localStorage.getItem("avaloon_role");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        if (storedRole) {
            setRole(storedRole);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await api.auth.login(email, password);
        setUser(response.user);
        localStorage.setItem("avaloon_user", JSON.stringify(response.user));
        // Reset role on new login
        setRole(null);
        localStorage.removeItem("avaloon_role");
        return response.user;
    };

    const selectRole = (newRole) => {
        setRole(newRole);
        localStorage.setItem("avaloon_role", newRole);
    };

    const logout = () => {
        setUser(null);
        setRole(null);
        localStorage.removeItem("avaloon_user");
        localStorage.removeItem("avaloon_role");
    };

    return (
        <AuthContext.Provider value={{ user, role, login, logout, selectRole, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
