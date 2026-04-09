import { useState, useEffect } from 'react';
import { 
  Settings, 
  Award, 
  History, 
  ShieldCheck, 
  LogOut, 
  ChevronRight, 
  Palette, 
  Loader2, 
  Image as ImageIcon,
  Trophy,
  Lock,
  Eye,
  Bell,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, orderBy, limit, getDocs, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import GlassCard from '../ui/GlassCard';
import { UserProfile } from '../../types';
import { cn } from '../../lib/utils';
import { generateUIScreen } from '../../services/gemini';

interface ProfileProps {
  user: UserProfile;
  onLogout: () => void;
}

type SubView = 'main' | 'history' | 'privacy' | 'leaderboard';

export default function Profile({ user, onLogout }: ProfileProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [subView, setSubView] = useState<SubView>('main');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [history, setHistory] = useState<any[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    if (subView === 'history') {
      fetchHistory();
    } else if (subView === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [subView]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, 'workouts'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(docs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'workouts');
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const q = query(
        collection(db, 'profiles'),
        orderBy('xp', 'desc'),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map((doc, index) => ({ 
        rank: index + 1, 
        ...doc.data(),
        isUser: doc.id === user.uid
      }));
      setLeaderboardData(docs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'profiles');
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const achievements = [
    { name: 'Early Bird', icon: '🌅', desc: '5 workouts before 8 AM' },
    { name: 'Streak Master', icon: '🔥', desc: 'Maintain a 7-day streak' },
    { name: 'Hydration Pro', icon: '💧', desc: 'Hit water goal 3 days in a row' },
  ];

  const workoutHistory = [
    { date: 'Today', type: 'Chest & Triceps', duration: '45 min', xp: '+250 XP' },
    { date: 'Yesterday', type: 'Back & Biceps', duration: '50 min', xp: '+300 XP' },
    { date: 'Apr 7', type: 'Leg Day', duration: '60 min', xp: '+400 XP' },
    { date: 'Apr 6', type: 'Shoulders', duration: '40 min', xp: '+200 XP' },
  ];

  const leaderboard = [
    { rank: 1, name: 'Rahul S.', xp: '12,450', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' },
    { rank: 2, name: 'Priya K.', xp: '10,200', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
    { rank: 3, name: 'Amit M.', xp: '9,850', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit' },
    { rank: 4, name: 'You', xp: '4,800', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`, isUser: true },
    { rank: 5, name: 'Sneha P.', xp: '4,200', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha' },
  ];

  const handleGenerateDesign = async () => {
    setIsGenerating(true);
    const img = await generateUIScreen("Dashboard screen with workout stats and progress charts");
    if (img) setGeneratedImage(img);
    setIsGenerating(false);
  };

  const renderHistory = () => (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <button onClick={() => setSubView('main')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">Workout History</h2>
      </header>
      
      {loadingHistory ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-neon-blue" size={32} />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-10 text-white/40">
          <p>No workouts recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, i) => (
            <GlassCard key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{item.type}</h4>
                  <p className="text-[10px] text-white/40 uppercase font-bold">
                    {new Date(item.timestamp).toLocaleDateString()} • {item.duration}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-neon-blue">+{item.xp} XP</span>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );

  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: user.privacy?.publicProfile ?? true,
    twoFactor: user.privacy?.twoFactor ?? false,
    activityAlerts: user.privacy?.activityAlerts ?? true
  });

  const togglePrivacy = async (key: keyof typeof privacySettings) => {
    const newVal = !privacySettings[key];
    setPrivacySettings(prev => ({ ...prev, [key]: newVal }));
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        [`privacy.${key}`]: newVal
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const renderPrivacy = () => (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <button onClick={() => setSubView('main')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">Privacy & Security</h2>
      </header>
      <div className="space-y-4">
        {[
          { id: 'publicProfile', icon: Eye, label: 'Public Profile', desc: 'Allow others to see your progress' },
          { id: 'twoFactor', icon: Lock, label: 'Two-Factor Auth', desc: 'Secure your account with 2FA' },
          { id: 'activityAlerts', icon: Bell, label: 'Activity Alerts', desc: 'Get notified of unusual logins' },
        ].map((item) => {
          const isActive = (privacySettings as any)[item.id];
          return (
            <GlassCard key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                  <item.icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{item.label}</h4>
                  <p className="text-[10px] text-white/40">{item.desc}</p>
                </div>
              </div>
              <div 
                onClick={() => togglePrivacy(item.id as any)}
                className={cn(
                  "w-10 h-5 rounded-full relative transition-colors cursor-pointer",
                  isActive ? "bg-neon-blue" : "bg-white/10"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                  isActive ? "right-1" : "left-1"
                )} />
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <button onClick={() => setSubView('main')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">Leaderboard</h2>
      </header>
      
      {loadingLeaderboard ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-neon-blue" size={32} />
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboardData.map((item) => (
            <GlassCard 
              key={item.uid} 
              className={cn(
                "flex items-center justify-between",
                item.isUser && "border-neon-blue/40 bg-neon-blue/5"
              )}
            >
              <div className="flex items-center gap-4">
                <span className={cn(
                  "text-sm font-black w-6",
                  item.rank === 1 ? "text-yellow-400" : 
                  item.rank === 2 ? "text-gray-400" : 
                  item.rank === 3 ? "text-orange-400" : "text-white/20"
                )}>
                  {item.rank}
                </span>
                <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full border border-white/10" />
                <div>
                  <h4 className="font-bold text-sm">{item.name}</h4>
                  <p className="text-[10px] text-white/40 uppercase font-bold">{item.xp} XP</p>
                </div>
              </div>
              {item.rank <= 3 && <Trophy size={16} className={cn(
                item.rank === 1 ? "text-yellow-400" : 
                item.rank === 2 ? "text-gray-400" : "text-orange-400"
              )} />}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-8 min-h-full pb-24">
      <AnimatePresence mode="wait">
        {subView === 'main' ? (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <header className="flex justify-between items-start">
              <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
              <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Settings size={20} className="text-white/60" />
              </button>
            </header>

            {/* Profile Info */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-neon-blue to-purple-600 p-1">
                  <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center overflow-hidden border-4 border-dark-bg">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-neon-blue text-black text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                  LVL {user.level}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Elite Athlete</p>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold">{user.totalWorkouts}</h4>
                <p className="text-[10px] text-white/40 uppercase font-bold">Workouts</p>
              </div>
              <div className="text-center space-y-1 border-x border-white/10">
                <h4 className="text-lg font-bold">{user.streak}</h4>
                <p className="text-[10px] text-white/40 uppercase font-bold">Streak</p>
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold">4.8k</h4>
                <p className="text-[10px] text-white/40 uppercase font-bold">XP</p>
              </div>
            </div>

            {/* Menu Options */}
            <div className="space-y-2">
              {[
                { icon: History, label: 'Workout History', color: 'text-blue-400', action: () => setSubView('history') },
                { icon: ShieldCheck, label: 'Privacy & Security', color: 'text-green-400', action: () => setSubView('privacy') },
                { icon: Award, label: 'Leaderboard', color: 'text-yellow-400', action: () => setSubView('leaderboard') },
                { icon: LogOut, label: 'Logout', color: 'text-red-400', action: () => setShowLogoutConfirm(true) },
              ].map((item) => (
                <GlassCard 
                  key={item.label} 
                  onClick={item.action}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center", item.color)}>
                      <item.icon size={20} />
                    </div>
                    <span className="font-bold text-sm">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-white/20" />
                </GlassCard>
              ))}
            </div>

            {/* Design Lab Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-white/40">Design Lab</h3>
                <span className="text-[10px] text-neon-blue font-bold uppercase tracking-widest">AI Concepts</span>
              </div>
              <GlassCard className="bg-neon-blue/5 border-neon-blue/20 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neon-blue/20 flex items-center justify-center">
                    <Palette size={20} className="text-neon-blue" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Generate UI Concepts</h4>
                    <p className="text-[10px] text-white/40">See AI-generated design inspirations</p>
                  </div>
                </div>
                
                {generatedImage && (
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[9/16] bg-black/40">
                    <img 
                      src={generatedImage} 
                      alt="AI Generated UI" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button 
                      onClick={() => setGeneratedImage(null)}
                      className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white/60 hover:text-white"
                    >
                      <ChevronRight size={16} className="rotate-90" />
                    </button>
                  </div>
                )}

                <button 
                  onClick={handleGenerateDesign}
                  disabled={isGenerating}
                  className="w-full bg-neon-blue text-black font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      GENERATING...
                    </>
                  ) : (
                    <>
                      <ImageIcon size={18} />
                      GENERATE NEW CONCEPT
                    </>
                  )}
                </button>
              </GlassCard>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={subView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {subView === 'history' && renderHistory()}
            {subView === 'privacy' && renderPrivacy()}
            {subView === 'leaderboard' && renderLeaderboard()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <GlassCard className="max-w-xs w-full space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-500">
                  <LogOut size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Logout?</h3>
                  <p className="text-sm text-white/40 mt-2">Are you sure you want to sign out of your account?</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 py-3 rounded-xl bg-white/5 font-bold text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={onLogout}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  >
                    Logout
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
