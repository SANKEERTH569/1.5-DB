import React, { createContext, useState, useContext, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPhoneNumber, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  PhoneAuthProvider,
  RecaptchaVerifier
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

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

// User roles
export type UserRole = 'user' | 'admin' | 'delivery' | null;

// Auth context type
type AuthContextType = {
  user: FirebaseUser | null;
  userRole: UserRole;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<void>;
  confirmPhoneCode: (code: string) => Promise<void>;
  logout: () => Promise<void>;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    let unsubscribe = () => {};
    
    try {
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        
        if (currentUser) {
          // Check user role in Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              setUserRole(userDoc.data().role as UserRole);
            } else {
              // If no role is found, default to user
              setUserRole('user');
            }
          } catch (error) {
            console.error('Error fetching user role:', error);
            setUserRole(null);
          }
        } else {
          setUserRole(null);
        }
        
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Auth state change error:", error);
      setIsLoading(false);
    }

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
          setUser({ uid: 'admin-uid', email } as any);
          setUserRole('admin');
        } else if (password === '123456boy') {
          // Mock delivery login
          setUser({ uid: 'delivery-uid', email } as any);
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
  const signInWithPhone = async (phoneNumber: string) => {
    try {
      setIsLoading(true);
      
      // For demo purposes, we'll just simulate phone auth
      setVerificationId('mock-verification-id');
      
      // In a real app, this would use Firebase
      if (Platform.OS === 'web') {
        try {
          // Web implementation
          const newRecaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
          });
          setRecaptchaVerifier(newRecaptchaVerifier);
          
          const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, newRecaptchaVerifier);
          setVerificationId(confirmationResult.verificationId);
        } catch (error) {
          console.error('Firebase phone sign in error:', error);
          // Continue with mock for demo
        }
      }
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
      setUser({ uid: 'user-uid', phoneNumber: '+1234567890' } as any);
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

  // Sign out
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // For demo purposes
      setUser(null);
      setUserRole(null);
      
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
        userRole,
        isLoading,
        signInWithEmail,
        signInWithPhone,
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