import { motion, AnimatePresence } from 'motion/react';
import { Flame, Zap, Droplets, Play, Plus, Utensils, Dumbbell, Search, Loader2 } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { UserProfile } from '../../types';
import { cn } from '../../lib/utils';
import { useState } from 'react';
import { getNutritionInfo, NutritionData } from '../../services/nutrition';

import Logo from '../ui/Logo';

interface HomeProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
}

export default function Home({ user, setUser }: HomeProps) {
  const [foodQuery, setFoodQuery] = useState('');
  const [nutrition, setNutrition] = useState<NutritionData | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const addWater = () => {
    setUser({ ...user, waterIntake: Math.min(user.waterIntake + 250, user.waterGoal) });
  };

  const handleNutritionSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodQuery.trim()) return;

    setIsSearching(true);
    const data = await getNutritionInfo(foodQuery);
    setNutrition(data);
    setIsSearching(false);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Logo size={40} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Hey {user.name} 👋
            </h1>
            <p className="text-white/50 text-sm">Ready to crush your goals?</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <Flame size={16} className="text-orange-500 fill-orange-500" />
            <span className="text-sm font-bold">{user.streak}</span>
          </div>
          <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <Zap size={16} className="text-neon-blue fill-neon-blue" />
            <span className="text-sm font-bold">Lvl {user.level}</span>
          </div>
        </div>
      </header>

      {/* XP Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-white/40">
          <span>XP Progress</span>
          <span>{user.xp} / 3000</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(user.xp / 3000) * 100}%` }}
            className="h-full bg-neon-blue shadow-[0_0_10px_#00f2ff]"
          />
        </div>
      </div>

      {/* Main Cards */}
      <div className="grid gap-4">
        <GlassCard className="relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Dumbbell size={80} />
          </div>
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest font-bold text-neon-blue">Today's Workout</span>
              <span className="text-[10px] bg-neon-blue/20 text-neon-blue px-2 py-0.5 rounded-full font-bold">Chest & Triceps</span>
            </div>
            <h2 className="text-xl font-bold">Hypertrophy Session</h2>
            <p className="text-sm text-white/60">45 mins • 6 exercises • 320 kcal</p>
            <button className="w-full bg-neon-blue text-black font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95">
              <Play size={18} fill="black" />
              START WORKOUT
            </button>
          </div>
        </GlassCard>

        {/* Nutrition Search */}
        <GlassCard className="space-y-4">
          <div className="flex items-center gap-2 text-neon-blue">
            <Utensils size={18} />
            <h3 className="font-bold text-sm uppercase tracking-widest">Nutrition Scanner</h3>
          </div>
          
          <form onSubmit={handleNutritionSearch} className="relative">
            <input 
              type="text"
              value={foodQuery}
              onChange={(e) => setFoodQuery(e.target.value)}
              placeholder="Search food (e.g. 1 large apple)"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-neon-blue/50 transition-all"
            />
            <button 
              type="submit"
              disabled={isSearching}
              className="absolute right-2 top-2 bottom-2 w-8 bg-neon-blue text-black rounded-lg flex items-center justify-center disabled:opacity-50"
            >
              {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
          </form>

          <AnimatePresence>
            {nutrition && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-2 border-t border-white/5"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Total Energy</p>
                    <p className="text-2xl font-black text-white">{nutrition.calories} <span className="text-xs font-normal text-white/40">kcal</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Weight</p>
                    <p className="text-sm font-bold">{Math.round(nutrition.totalWeight)}g</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
                    <p className="text-[8px] text-white/40 uppercase font-bold mb-1">Protein</p>
                    <p className="text-xs font-bold text-orange-400">{Math.round(nutrition.totalNutrients.PROCNT?.quantity || 0)}g</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
                    <p className="text-[8px] text-white/40 uppercase font-bold mb-1">Carbs</p>
                    <p className="text-xs font-bold text-neon-blue">{Math.round(nutrition.totalNutrients.CHOCDF?.quantity || 0)}g</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
                    <p className="text-[8px] text-white/40 uppercase font-bold mb-1">Fat</p>
                    <p className="text-xs font-bold text-pink-400">{Math.round(nutrition.totalNutrients.FAT?.quantity || 0)}g</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        <div className="grid grid-cols-2 gap-4">
          <GlassCard className="space-y-3">
            <div className="flex items-center gap-2 text-orange-400">
              <Utensils size={16} />
              <span className="text-[10px] uppercase tracking-widest font-bold">Diet Plan</span>
            </div>
            <h3 className="font-bold">Lunch</h3>
            <p className="text-xs text-white/50">Roti + Dal + Sabzi</p>
            <div className="pt-2 border-t border-white/5 flex justify-between items-center">
              <span className="text-[10px] font-bold text-white/40">15g Protein</span>
              <Plus size={14} className="text-white/40" />
            </div>
          </GlassCard>

          <GlassCard className="space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
              <Droplets size={16} />
              <span className="text-[10px] uppercase tracking-widest font-bold">Hydration</span>
            </div>
            <h3 className="font-bold">{user.waterIntake}ml</h3>
            <p className="text-xs text-white/50">Goal: {user.waterGoal}ml</p>
            <button 
              onClick={addWater}
              className="w-full bg-white/5 hover:bg-white/10 py-2 rounded-xl flex items-center justify-center transition-colors"
            >
              <Plus size={16} />
            </button>
          </GlassCard>
        </div>

        <GlassCard className="bg-gradient-to-br from-neon-blue/10 to-transparent border-neon-blue/20">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-full bg-neon-blue/20 flex items-center justify-center">
              <Zap size={24} className="text-neon-blue" />
            </div>
            <div>
              <h3 className="font-bold">AI Suggestion</h3>
              <p className="text-xs text-white/60 italic">"You've crushed 5 days in a row! Focus on recovery today with some light stretching."</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
