import React, { createContext, useState, useContext, useEffect } from 'react';

export type UserRole = 'user' | 'admin' | 'delivery' | null;

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  // Add other fields from registration_items table
}

interface RegistrationItem {
  id: number;
  registration_id: string;
  item_id: number | null;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  is_manual: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  signInWithPhone: (phone: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  createAccount: (name: string, phone: string, password: string) => Promise<void>;
  fetchUserData: (phone: string) => Promise<User | null>;
  fetchRegistrationItems: (registrationId: string) => Promise<RegistrationItem[]>;
  registrationItems: RegistrationItem[];
  isLoading: boolean;
  logout: () => Promise<void>;
  confirmPhoneCode: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL - adjust this to match your backend
const API_BASE_URL = 'http://localhost:3000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [registrationItems, setRegistrationItems] = useState<RegistrationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for existing session/token when app loads
    const checkExistingSession = async () => {
      try {
        // Try to get stored user data from localStorage or AsyncStorage
        // This is simplified - you may need to adjust based on your storage method
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      }
    };

    checkExistingSession();
  }, []);

  // Phone login
  const signInWithPhone = async (phone: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid credentials');
      }
      
      const userData = await response.json();
      
      // Set user in state
      const user = {
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        role: userData.role || 'user',
      };
      
      setUser(user);
      
      // Save to localStorage or AsyncStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Email login
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid credentials');
      }
      
      const userData = await response.json();
      
      // Set user in state
      const user = {
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        role: userData.role || 'user',
      };
      
      setUser(user);
      
      // Save to localStorage or AsyncStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPhoneCode = async (code: string) => {
    // This is a placeholder - with PostgreSQL auth, you might not need phone verification
    // If you implement SMS verification, you'd add the logic here
    console.log('Phone code confirmation not implemented in PostgreSQL version');
  };

  const createAccount = async (name: string, phone: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name,
          phone, 
          password,
          role: 'user' // Default role
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const userData = await response.json();
      
      // Set user in state
      const user = {
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        role: userData.role || 'user',
      };
      
      setUser(user);
      
      // Save to localStorage or AsyncStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      
    } catch (error) {
      console.error('Account creation error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async (phone: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/users/${phone}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return null;
      }
      
      const userData = await response.json();
      
      return {
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        role: userData.role || 'user',
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch registration items
  const fetchRegistrationItems = async (registrationId: string): Promise<RegistrationItem[]> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/registrations/${registrationId}/items`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return [];
      }
      
      const items = await response.json();
      setRegistrationItems(items);
      return items;
    } catch (error) {
      console.error('Error fetching registration items:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setUser(null);
      setRegistrationItems([]);
      
      // Remove from storage
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        signInWithPhone,
        signInWithEmail,
        createAccount,
        fetchUserData,
        fetchRegistrationItems,
        registrationItems,
        isLoading,
        logout,
        confirmPhoneCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};