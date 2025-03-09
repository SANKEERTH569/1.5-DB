import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

export type UserRole = 'user' | 'admin' | 'delivery' | null;

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  hotel_id?: string;
  shop_name?: string;
  owner_name?: string;
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

interface RegistrationData {
  hotelId: string;
  shopName: string;
  businessType: string;
  emailAddress?: string;
  alternatePhoneNumber?: string;
  googleMapsLocation?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  signInWithPhone: (phone: string, password: string) => Promise<User>;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  createAccount: (name: string, phone: string, password: string, registrationData: RegistrationData) => Promise<void>;
  fetchUserData: (phone: string) => Promise<User | null>;
  fetchRegistrationItems: (registrationId: string) => Promise<RegistrationItem[]>;
  registrationItems: RegistrationItem[];
  isLoading: boolean;
  logout: () => Promise<void>;
  confirmPhoneCode: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_BASE_URL = 'http://localhost:3000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [registrationItems, setRegistrationItems] = useState<RegistrationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkExistingSession = async () => {
      try {
        console.log('Checking for existing session...');
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          console.log('Found stored user:', storedUser);
          const parsedUser = JSON.parse(storedUser);
          
          // Fetch fresh user data
          const response = await axios.get(`${API_BASE_URL}/registrations/${parsedUser.id}`);
          console.log('Fresh user data:', response.data);
          
          if (response.data) {
            const userData = response.data;
            const updatedUser: User = {
              id: userData.hotel_id || parsedUser.id,
              hotel_id: userData.hotel_id || parsedUser.id,
              name: userData.shop_name || userData.owner_name || parsedUser.name,
              shop_name: userData.shop_name || parsedUser.name,
              owner_name: userData.owner_name || parsedUser.name,
              phone: userData.phone_number || parsedUser.phone,
              email: userData.email_address || parsedUser.email,
              role: parsedUser.role || 'user'
            };
            console.log('Setting updated user:', updatedUser);
            setUser(updatedUser);
          } else {
            console.log('No user data found, clearing session');
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          console.log('No stored user found');
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  // Phone login
  const signInWithPhone = async (phone: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);
      console.log('Attempting login with phone:', phone);
      
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        phone,
        password
      });
      
      console.log('Login response:', response.data);
      
      if (!response.data) {
        throw new Error('Invalid credentials');
      }
      
      const userData = response.data;
      
      // Set user in state with proper type casting
      const user: User = {
        id: userData.id,
        hotel_id: userData.id, // Use id as hotel_id
        name: userData.name,
        shop_name: userData.name, // Use name as shop_name
        owner_name: userData.name, // Use name as owner_name initially
        phone: userData.phone,
        email: userData.email,
        role: userData.role || 'user'
      };
      
      console.log('Created user object:', user);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
      
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
      
      // Return user data for redirection
      return user;
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

  const createAccount = async (name: string, phone: string, password: string, registrationData: RegistrationData) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          hotelId: registrationData.hotelId,
          shopName: registrationData.shopName,
          ownerName: name,
          businessType: registrationData.businessType,
          emailAddress: registrationData.emailAddress,
          phoneNumber: phone,
          alternatePhoneNumber: registrationData.alternatePhoneNumber,
          googleMapsLocation: registrationData.googleMapsLocation,
          password
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const userData = await response.json();
      
      // Set user in state with proper type casting
      const user: User = {
        id: userData.hotel_id,
        name: userData.shop_name || userData.owner_name,
        phone: userData.phone_number,
        email: userData.email_address,
        role: 'user' as UserRole,
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
      setIsLoading(true);
      console.log('Logging out...');
      
      // Even if the server call fails, we want to clear local state
      try {
        await axios.post(`${API_BASE_URL}/api/logout`);
      } catch (error) {
        console.warn('Logout API call failed, clearing local state anyway');
      }
      
      localStorage.removeItem('user');
      setUser(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;