import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { api, setToken } from '../api/client';
import type { AuthResponse, AuthUser, UserProfile } from '../api/types';

export interface AuthContextValue {
  user: AuthUser | null;
  locations: { id: string; name: string; timezone: string }[] | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [locations, setLocations] = useState<{ id: string; name: string; timezone: string }[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await api.get<UserProfile>('/users/me/profile');
      setUser({
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        organizationId: profile.organization_id,
        profilePhotoUrl: profile.profile_photo_url,
      });
      setLocations(profile.locations ?? null);
    } catch {
      setToken(null);
      setUser(null);
      setLocations(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('shiftsync-token');
    if (token) {
      fetchProfile().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<AuthResponse>('/auth/login', { email, password });
      setToken(res.token);
      setUser(res.user);
      // Fetch full profile for locations
      await fetchProfile();
    },
    [fetchProfile],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setLocations(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, locations, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
