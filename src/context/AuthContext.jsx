import { createContext, useContext, useEffect, useState } from "react";
import { users } from "../data/dummyData";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(() => {
    const stored = localStorage.getItem("school_demo_user_id");
    return stored ? Number(stored) : null;
  });

  useEffect(() => {
    if (userId) localStorage.setItem("school_demo_user_id", String(userId));
    else localStorage.removeItem("school_demo_user_id");
  }, [userId]);

  const currentUser = users.find((u) => u.id === userId) || null;

  const loginAs = (id) => setUserId(id);
  const logout = () => setUserId(null);

  return (
    <AuthContext.Provider value={{ currentUser, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
