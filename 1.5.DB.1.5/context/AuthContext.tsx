import React, { createContext, useState, useContext, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPhoneNumber, 
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  PhoneAuthProvider,
  RecaptchaVerifier
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { Pool } from 'pg';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Provide fallback for demo purposes
  app = {} as any;
}

const auth = getAuth(app);
const db = getFirestore(app);

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.EXPO_PUBLIC_DB_USER,
  host: process.env.EXPO_PUBLIC_DB_HOST,
  database: process.env.EXPO_PUBLIC_DB_NAME,
  password: process.env.EXPO_PUBLIC_DB_PASSWORD,
  port: Number(process.env.EXPO_PUBLIC_DB_PORT),
  ssl: {
    rejectUnauthorized: false
  }
});

// User roles
export type UserRole = 'user' | 'admin' | 'delivery' | null;

// User interface
interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  // Add other fields from registration_items table
}

// Registration item interface
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

// Auth context type
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  signInWithPhone: (phone: string, password: string) => Promise<void>;
  createAccount: (name: string, phone: string, password: string) => Promise<void>;
  fetchUserData: (phone: string) => Promise<User | null>;
  fetchRegistrationItems: (registrationId: string) => Promise<RegistrationItem[]>;
  registrationItems: RegistrationItem[];
  isLoading: boolean;
  // ... other auth related methods
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [registrationItems, setRegistrationItems] = useState<RegistrationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userData = await fetchUserData(currentUser.phoneNumber || '');
        setUser(userData);
        setUserRole(userData?.role as UserRole);
        if (userData) {
          const items = await fetchRegistrationItems(userData.id);
          setRegistrationItems(items);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setRegistrationItems([]);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // For demo purposes, we'll use hardcoded credentials
      if (email === 'shanmukvarada@gmail.com') {
        if (password === '123456admin') {
          // Mock admin login
          setUser({ id: 'admin-uid', name: 'Admin', phone: '1234567890', role: 'admin' });
          setUserRole('admin');
        } else if (password === '123456boy') {
          // Mock delivery login
          setUser({ id: 'delivery-uid', name: 'Delivery', phone: '1234567890', role: 'delivery' });
          setUserRole('delivery');
        } else {
          throw new Error('Invalid credentials');
        }
      } else {
        // In a real app, this would use Firebase
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
          console.error('Firebase email sign in error:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with phone number
  const signInWithPhone = async (phone: string, password: string) => {
    try {
      setIsLoading(true);
      
      const query = {
        text: 'SELECT * FROM registration WHERE phone = $1 AND password = $2',
        values: [phone, password],
      };

      const result = await pool.query(query);

      if (result.rows.length === 0) {
        throw new Error('Invalid credentials');
      }

      const userData = result.rows[0];
      setUser({
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        role: userData.role || 'user',
      });
      setUserRole(userData.role || 'user');

      // Fetch registration items
      const items = await fetchRegistrationItems(userData.id);
      setRegistrationItems(items);

    } catch (error) {
      console.error('Error signing in with phone:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm phone verification code
  const confirmPhoneCode = async (code: string) => {
    try {
      setIsLoading(true);
      
      // For demo purposes, we'll just simulate successful verification
      setUser({ id: 'user-uid', name: 'User', phone: '+1234567890', role: 'user' });
      setUserRole('user');
      
      // Reset verification state
      setVerificationId(null);
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        setRecaptchaVerifier(null);
      }
    } catch (error) {
      console.error('Error confirming code:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new user account
  const createAccount = async (name: string, phone: string, password: string) => {
    try {
      setIsLoading(true);
      
      const query = {
        text: `INSERT INTO registration (name, phone, password, role, created_at) 
               VALUES ($1, $2, $3, $4, NOW()) 
               RETURNING *`,
        values: [name, phone, password, 'user'],
      };

      const result = await pool.query(query);
      const newUser = result.rows[0];

      setUser({
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        role: 'user',
      });
      setUserRole('user');

    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user data
  const fetchUserData = async (phone: string): Promise<User | null> => {
    try {
      const query = {
        text: 'SELECT * FROM registration WHERE phone = $1',
        values: [phone],
      };

      const result = await pool.query(query);

      if (result.rows.length === 0) {
        return null;
      }

      const userData = result.rows[0];
      return {
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        role: userData.role || 'user',
        // Add other fields as needed
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Fetch registration items
  const fetchRegistrationItems = async (registrationId: string): Promise<RegistrationItem[]> => {
    try {
      const query = {
        text: 'SELECT * FROM registration_items WHERE registration_id = $1',
        values: [registrationId],
      };

      const result = await pool.query(query);

      return result.rows.map((row: any) => ({
        id: row.id,
        registration_id: row.registration_id,
        item_id: row.item_id,
        name: row.name,
        price: row.price,
        unit: row.unit,
        quantity: row.quantity,
        is_manual: row.is_manual,
      }));
    } catch (error) {
      console.error('Error fetching registration items:', error);
      return [];
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // For demo purposes
      setUser(null);
      setUserRole(null);
      setRegistrationItems([]);
      
      // In a real app, this would use Firebase
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Firebase sign out error:', error);
        // Continue with mock for demo
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        signInWithPhone,
        createAccount,
        fetchUserData,
        fetchRegistrationItems,
        registrationItems,
        isLoading,
        signInWithEmail,
        confirmPhoneCode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;