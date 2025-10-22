import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('currentUser');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Error parsing user from localStorage", error);
            return null;
        }
    });
    const [loading, setLoading] = useState(false); 

    const login = (userData) => {
        setCurrentUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
    };

    const refreshCurrentUser = async () => {
        if (!currentUser?._id) {
            console.log("No user to refresh.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5555/api/donors`, {credentials: 'include'});
            if (!response.ok) {
                throw new Error('Could not fetch latest user data.');
            }
            const updatedUserData = await response.json();
            
            // --- FIX ---
            // The data from the API (updatedUserData) doesn't have the 'type' field.
            // We merge it with the existing currentUser to preserve the 'type' property.
            const finalUserData = { ...currentUser, ...updatedUserData };
            login(finalUserData);
            console.log("User profile has been refreshed.");

        } catch (error) {
            console.error("Failed to refresh user data:", error);
            alert("Could not refresh your profile. You may need to log in again.");
            logout();
        } finally {
            setLoading(false);
        }
    };

    const value = {
        currentUser,
        loading,
        isAuthenticated: !!currentUser,
        login,
        logout,
        refreshCurrentUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

