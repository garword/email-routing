"use client";

import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  rememberMe: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  toggleRememberMe: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Check login status on mount
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const savedUsername = localStorage.getItem('username');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    
    setIsLoggedIn(loggedIn);
    setUsername(savedUsername);
    setRememberMe(savedRememberMe);
  }, []);

  const login = async (username: string, password: string, rememberMeFlag: boolean = false): Promise<boolean> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username === "windaa" && password === "cantik") {
          // Update localStorage first
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', username);
          localStorage.setItem('rememberMe', rememberMeFlag.toString());
          
          // If remember me is checked, also save session timestamp
          if (rememberMeFlag) {
            localStorage.setItem('loginTimestamp', new Date().toISOString());
          }
          
          // Update state immediately
          setIsLoggedIn(true);
          setUsername(username);
          setRememberMe(rememberMeFlag);
          
          // Force a small delay to ensure state is updated
          setTimeout(() => {
            resolve(true);
          }, 100);
        } else {
          resolve(false);
        }
      }, 500); // Reduced delay for better UX
    });
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('loginTimestamp');
    setIsLoggedIn(false);
    setUsername(null);
    setRememberMe(false);
  };

  const toggleRememberMe = () => {
    const newRememberMe = !rememberMe;
    setRememberMe(newRememberMe);
    localStorage.setItem('rememberMe', newRememberMe.toString());
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, rememberMe, login, logout, toggleRememberMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}