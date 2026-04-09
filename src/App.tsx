/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home as HomeIcon, 
  Dumbbell, 
  MessageSquare, 
  TrendingUp, 
  User,
  Zap,
  Flame,
  Droplets,
  Loader2
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { cn } from './lib/utils';
import { UserProfile, UserStats } from './types';

// Screens
import HomeScreen from './components/screens/Home';
import WorkoutScreen from './components/screens/Workout';
import AICoachScreen from './components/screens/AICoach';
import ProgressScreen from './components/screens/Progress';
import ProfileScreen from './components/screens/Profile';
import AuthScreen from './components/AuthScreen';

import Logo from './components/ui/Logo';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'workout' | 'ai' | 'progress' | 'profile'>('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const [stats, setStats] = useState<UserStats>({
    weight: [70, 71, 70.5, 69.8, 69.5, 69.2, 68.8],
    chest: [38, 38.2, 38.5, 38.5, 38.8, 39, 39.2],
    arms: [13, 13.1, 13.2, 13.2, 13.4, 13.5, 13.6],
    waist: [32, 31.8, 31.5, 31.5, 31.2, 31, 30.8],
    shoulders: [44, 44.5, 45, 45.2, 45.5, 45.8, 46],
    dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setIsAuthReady(true);
      if (firebaseUser) {
        // Listen to user document in Firestore
        const path = `users/${firebaseUser.uid}`;
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data() as UserProfile);
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          setLoading(false);
        });
        return () => unsubDoc();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isAuthReady || (user === null && loading)) {
    return (
      <div className="h-screen bg-dark-bg flex items-center justify-center">
        <Logo size={80} />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const tabs = [
    { id: 'home', icon: HomeIcon, label: 'Home' },
    { id: 'workout', icon: Dumbbell, label: 'Workout' },
    { id: 'ai', icon: MessageSquare, label: 'AI Coach' },
    { id: 'progress', icon: TrendingUp, label: 'Progress' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  const handleLogout = () => signOut(auth);

  return (
    <div className="flex flex-col h-screen bg-dark-bg text-white overflow-hidden max-w-md mx-auto relative border-x border-white/5">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-full flex flex-col"
          >
            {activeTab === 'home' && <HomeScreen user={user} setUser={(u) => setUser(u as UserProfile)} />}
            {activeTab === 'workout' && <WorkoutScreen user={user} setUser={(u) => setUser(u as UserProfile)} />}
            {activeTab === 'ai' && <AICoachScreen user={user} />}
            {activeTab === 'progress' && <ProgressScreen stats={stats} />}
            {activeTab === 'profile' && <ProfileScreen user={user} onLogout={handleLogout} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-2xl border-t border-white/10 px-2 py-3 flex justify-around items-center z-50">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex flex-col items-center gap-1.5 py-2 px-4 rounded-xl transition-all duration-300 relative",
                isActive ? "text-neon-blue" : "text-white/40"
              )}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1.5"
              >
                <tab.icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={cn(isActive && "drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]")}
                />
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-widest transition-opacity",
                  isActive ? "opacity-100" : "opacity-60"
                )}>
                  {tab.label}
                </span>
              </motion.div>
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-1 w-1 h-1 bg-neon-blue rounded-full shadow-[0_0_10px_#00f2ff]"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

