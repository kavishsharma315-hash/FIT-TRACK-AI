import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, CheckCircle2, Timer, Play, Info, Dumbbell, Loader2, X } from 'lucide-react';
import { doc, updateDoc, addDoc, collection, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import GlassCard from '../ui/GlassCard';
import { EXERCISES } from '../../constants';
import { MuscleGroup, Exercise, UserProfile } from '../../types';
import { cn } from '../../lib/utils';
import { generateExerciseDemo } from '../../services/gemini';

interface WorkoutProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
}

export default function Workout({ user, setUser }: WorkoutProps) {
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | null>(null);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [timer, setTimer] = useState<number | null>(null);
  const [demoImage, setDemoImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const muscleGroups: MuscleGroup[] = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'];

  const toggleExercise = async (id: string) => {
    if (completedExercises.includes(id)) {
      setCompletedExercises(completedExercises.filter(e => e !== id));
    } else {
      setCompletedExercises([...completedExercises, id]);
      
      try {
        // Update user stats in Firestore
        const userRef = doc(db, 'users', user.uid);
        const profileRef = doc(db, 'profiles', user.uid);
        
        await updateDoc(userRef, {
          xp: increment(50),
          totalWorkouts: increment(1)
        });

        await updateDoc(profileRef, {
          xp: increment(50)
        });

        // Save workout session
        await addDoc(collection(db, 'workouts'), {
          userId: user.uid,
          type: selectedGroup,
          duration: '10-15 min', // Estimated
          xp: 50,
          timestamp: new Date().toISOString()
        });

        // Start rest timer
        startTimer(60);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'workouts');
      }
    }
  };

  const handleShowDemo = async (ex: Exercise) => {
    setActiveExercise(ex);
    setIsGenerating(true);
    setDemoImage(null);
    const img = await generateExerciseDemo(ex.name);
    setDemoImage(img);
    setIsGenerating(false);
  };

  const startTimer = (seconds: number) => {
    setTimer(seconds);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workout</h1>
          <p className="text-white/50 text-xs font-mono uppercase tracking-widest">Mission Control</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-white/30 uppercase font-bold tracking-tighter block">Session XP</span>
          <span className="text-xl font-mono text-neon-blue neon-text-glow">+{completedExercises.length * 50}</span>
        </div>
      </header>

      {!selectedGroup ? (
        <div className="grid grid-cols-2 gap-px bg-white/10 rounded-3xl overflow-hidden border border-white/10">
          {muscleGroups.map((group, i) => (
            <motion.button 
              key={group}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ backgroundColor: 'rgba(0, 242, 255, 0.05)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedGroup(group)}
              className="flex flex-col items-center justify-center py-10 gap-4 bg-dark-bg transition-colors relative group"
            >
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-neon-blue/30 transition-colors">
                <Dumbbell size={24} className="text-neon-blue group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-mono font-bold tracking-[0.2em] uppercase text-[10px] text-white/60 group-hover:text-neon-blue transition-colors">{group}</span>
              
              {/* Corner Accents */}
              <div className="absolute top-2 left-2 w-1 h-1 bg-white/10 rounded-full" />
              <div className="absolute bottom-2 right-2 w-1 h-1 bg-white/10 rounded-full" />
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <motion.button 
              whileHover={{ x: -5 }}
              onClick={() => setSelectedGroup(null)}
              className="text-neon-blue text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 bg-neon-blue/5 px-4 py-2 rounded-full border border-neon-blue/20"
            >
              <ChevronRight className="rotate-180" size={14} />
              Back
            </motion.button>
            <div className="h-px flex-1 mx-4 bg-white/10" />
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
              {completedExercises.length}/{EXERCISES[selectedGroup].length} Complete
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tighter uppercase italic">
              {selectedGroup}
            </h2>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={cn("w-1 h-4 rounded-full", i <= completedExercises.length ? "bg-neon-blue" : "bg-white/10")} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {EXERCISES[selectedGroup].map((ex, i) => {
              const isDone = completedExercises.includes(ex.id);
              return (
                <motion.div
                  key={ex.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassCard 
                    className={cn(
                      "flex items-center justify-between transition-all p-5 group",
                      isDone ? "opacity-40 border-neon-blue/20" : "hover:border-neon-blue/40"
                    )}
                  >
                    <div 
                      className="flex items-center gap-5 cursor-pointer flex-1"
                      onClick={() => handleShowDemo(ex)}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                        isDone ? "bg-neon-blue/10 border-neon-blue/30" : "bg-white/5 border-white/10 group-hover:border-neon-blue/40"
                      )}>
                        {isDone ? <CheckCircle2 className="text-neon-blue" size={24} /> : <Play size={20} className="text-white/40 group-hover:text-neon-blue" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-base tracking-tight">{ex.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{ex.sets} Sets</span>
                          <div className="w-1 h-1 bg-white/20 rounded-full" />
                          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{ex.reps} Reps</span>
                        </div>
                      </div>
                    </div>
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleExercise(ex.id)}
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                        isDone ? "bg-white/5 text-white/20" : "bg-neon-blue text-black shadow-[0_0_15px_rgba(0,242,255,0.3)]"
                      )}
                    >
                      {isDone ? <CheckCircle2 size={20} /> : <Play size={20} fill="currentColor" />}
                    </motion.button>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Exercise Demo Modal */}
      <AnimatePresence>
        {activeExercise && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-neon-blue">{activeExercise.name}</h3>
                <p className="text-xs text-white/40 uppercase tracking-widest font-bold">AI Trainer Demo</p>
              </div>
              <button 
                onClick={() => setActiveExercise(null)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 size={40} className="text-neon-blue animate-spin" />
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40">Generating Perfect Form...</p>
                </div>
              ) : demoImage ? (
                <img 
                  src={demoImage} 
                  alt={activeExercise.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <p className="text-xs text-white/40">Failed to generate demo. Please try again.</p>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 block mb-1">Target</span>
                  <span className="text-sm font-bold">{selectedGroup}</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 block mb-1">Intensity</span>
                  <span className="text-sm font-bold">Moderate</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  toggleExercise(activeExercise.id);
                  setActiveExercise(null);
                }}
                className="w-full bg-neon-blue text-black font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(0,242,255,0.3)]"
              >
                START EXERCISE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {timer !== null && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-6 right-6 z-40"
          >
            <GlassCard className="bg-neon-blue text-black border-none py-4 flex items-center justify-between px-6 shadow-[0_0_30px_rgba(0,242,255,0.4)]">
              <div className="flex items-center gap-3">
                <Timer size={24} />
                <span className="font-bold tracking-widest uppercase text-xs">Rest Timer</span>
              </div>
              <span className="text-2xl font-black tabular-nums">{timer}s</span>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
