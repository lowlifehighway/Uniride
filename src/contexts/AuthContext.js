import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChange, getCurrentUserData } from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (authUser) => {
      if (authUser) {
        setUser(authUser);

        // Fetch user data from Firestore
        const result = await getCurrentUserData(authUser.uid);
        if (result.success) {
          setUserData(result.data);
          setUserRole(result.data.role); // Extract role for navigation
          console.log('auth context uupdated');
        } else {
          setUserData(null);
          setUserRole(null);
        }
      } else {
        setUser(null);
        setUserData(null);
        setUserRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userData,
    userRole,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
