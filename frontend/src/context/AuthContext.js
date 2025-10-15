import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null); // null if logged out, user object if logged in
    const navigate = useNavigate();

    // Call this function when a user successfully logs in
    const login = (userData) => {
        setCurrentUser(userData);
    };

    // Call this function to log the user out
    const logout = () => {
        setCurrentUser(null);
        navigate('/'); // Redirect to homepage on logout
    };

    const value = {
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily use the auth context in other components
export const useAuth = () => {
    return useContext(AuthContext);
};