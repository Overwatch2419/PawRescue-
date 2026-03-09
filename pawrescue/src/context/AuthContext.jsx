import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const API = "http://localhost:5000/api/auth";

export function AuthProvider({ children }) {
    const [volunteer, setVolunteer] = useState(() => {
        const saved = localStorage.getItem("pawrescue_volunteer");
        return saved ? JSON.parse(saved) : null;
    });

    const login = async (email, password) => {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        const user = { token: data.token, id: data.id, name: data.name, email: data.email };
        setVolunteer(user);
        localStorage.setItem("pawrescue_volunteer", JSON.stringify(user));
        return user;
    };

    const register = async (name, email, password) => {
        const res = await fetch(`${API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        const user = { token: data.token, id: data.id, name: data.name, email: data.email };
        setVolunteer(user);
        localStorage.setItem("pawrescue_volunteer", JSON.stringify(user));
        return user;
    };

    const logout = () => {
        setVolunteer(null);
        localStorage.removeItem("pawrescue_volunteer");
    };

    return (
        <AuthContext.Provider value={{ volunteer, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
