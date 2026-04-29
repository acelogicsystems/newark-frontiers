import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Start as null
    const [loading, setLoading] = useState(true);

    // 🚀 Update global state and local storage
    const updateUserInfo = (newData) => {
        if (!newData) return;
        setUser(newData);
        localStorage.setItem('user', JSON.stringify(newData));
    }; 

    useEffect(() => {
        // This is your "initialization" logic
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && storedUser !== "undefined" && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Auth initialization failed:", error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        // 🔍 FIX: Check for userData.token because your backend 
        // sends { token, _id, name, email, role }
        if (!userData || !userData.token) return;

        localStorage.setItem('token', userData.token);
        
        // Destructure to separate token from user info
        const { token, ...userInfo } = userData; 
        
        localStorage.setItem('user', JSON.stringify(userInfo));
        setUser(userInfo); // This updates the state so the Dashboard can open
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateUserInfo }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};