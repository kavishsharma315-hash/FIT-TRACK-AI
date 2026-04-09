import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { Mail, Lock, User, Loader2, Chrome } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import { motion } from 'motion/react';

import Logo from './ui/Logo';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  useEffect(() => {
    // If user is already authenticated but stuck here (missing doc), 
    // try to initialize the doc if we have the name
    const checkExistingAuth = async () => {
      if (auth.currentUser && !loading) {
        setLoading(true);
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (!userDoc.exists()) {
            // If we're here, it means the user is logged in but has no profile
            // We'll show the signup form to get their name if it's missing
            if (auth.currentUser.displayName) {
              const name = auth.currentUser.displayName;
              await setDoc(doc(db, 'users', auth.currentUser.uid), {
                uid: auth.currentUser.uid,
                name: name,
                email: auth.currentUser.email,
                level: 1,
                xp: 0,
                streak: 0,
                totalWorkouts: 0,
                waterIntake: 0,
                waterGoal: 4000
              });
              await setDoc(doc(db, 'profiles', auth.currentUser.uid), {
                uid: auth.currentUser.uid,
                name: name,
                xp: 0,
                level: 1,
                avatar: auth.currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
              });
            } else {
              setIsLogin(false); // Force signup view to get name
            }
          }
        } catch (err) {
          console.error("Error checking existing auth:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    checkExistingAuth();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    if (!isLogin && !name.trim()) {
      setError('Please enter your full name to continue.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });
        
        // Initialize user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: name,
          email: email,
          level: 1,
          xp: 0,
          streak: 0,
          totalWorkouts: 0,
          waterIntake: 0,
          waterGoal: 4000
        });

        // Initialize public profile
        await setDoc(doc(db, 'profiles', user.uid), {
          uid: user.uid,
          name: name,
          xp: 0,
          level: 1,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
        });
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try logging in.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with this email but using a different sign-in method (e.g. Google). Please use that method to log in.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const name = user.displayName || 'Athlete';
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: name,
          email: user.email,
          level: 1,
          xp: 0,
          streak: 0,
          totalWorkouts: 0,
          waterIntake: 0,
          waterGoal: 4000
        });

        // Initialize public profile
        await setDoc(doc(db, 'profiles', user.uid), {
          uid: user.uid,
          name: name,
          xp: 0,
          level: 1,
          avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
        });
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('The sign-in popup was closed. Please try again and complete the sign-in.');
      } else if (err.code === 'auth/blocked-popup') {
        setError('The sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setError(err.message || 'Google Sign-In failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-dark-bg">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-10"
      >
        <div className="flex flex-col items-center space-y-6">
          <Logo size={100} />
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black tracking-widest uppercase italic text-white">FITTRACK <span className="text-neon-blue">PRO AI</span></h1>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.4em] font-bold">
              {isLogin ? 'Elite Performance Access' : 'Begin Your Evolution'}
            </p>
          </div>
        </div>

        <GlassCard className="space-y-6 p-8">
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-neon-blue/50 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-neon-blue/50 transition-all"
                  placeholder="athlete@fittrack.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-white/40 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-neon-blue/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-bold text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                {error}
              </p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-neon-blue text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(0,242,255,0.3)]"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'LOGIN' : 'SIGN UP')}
            </button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-card-bg px-4 text-white/20">Or continue with</span></div>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <Chrome size={20} />
            GOOGLE
          </button>

          <p className="text-center text-xs text-white/40">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-neon-blue font-bold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>

          {auth.currentUser && (
            <div className="pt-4 border-t border-white/5 text-center">
              <p className="text-[10px] text-white/20 uppercase tracking-widest mb-2">Stuck? Try a different account</p>
              <button 
                onClick={() => signOut(auth)}
                className="text-red-400/60 text-xs font-bold hover:text-red-400 transition-colors"
              >
                SIGN OUT OF {auth.currentUser.email}
              </button>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
