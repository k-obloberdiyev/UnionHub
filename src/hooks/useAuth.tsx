import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

interface LocalUser {
  id: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for JWT token in localStorage
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return { user, loading, signOut };
}
