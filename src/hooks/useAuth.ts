import { useState, useEffect } from 'react';
import { authService, User } from '@/services/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    checkAuth();

    // Слушаем изменения в localStorage (для обработки выхода в других вкладках)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsLoading(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return { user, isLoading, isAuthenticated: !!user, logout };
};
