import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Camera, TrendingUp, ChevronRight } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { UserStats } from '../../types';
import { cn } from '../../lib/utils';

interface ProgressProps {
  stats: UserStats;
}

export default function Progress({ stats }: ProgressProps) {
  const chartData = stats.dates.map((date, i) => ({
    name: date,
    weight: stats.weight[i],
    chest: stats.chest[i],
    arms: stats.arms[i],
  }));

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
          <p className="text-white/50 text-sm">Tracking your transformation</p>
        </div>
        <button className="w-12 h-12 rounded-full bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue">
          <Camera size={24} />
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="space-y-1">
          <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">Current Weight</span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold">{stats.weight[stats.weight.length - 1]}</h3>
            <span className="text-xs text-white/40">kg</span>
          </div>
          <div className="flex items-center gap-1 text-green-400 text-[10px] font-bold">
            <TrendingUp size={12} className="rotate-180" />
            <span>-1.2kg this week</span>
          </div>
        </GlassCard>

        <GlassCard className="space-y-1">
          <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">Chest Size</span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold">{stats.chest[stats.chest.length - 1]}</h3>
            <span className="text-xs text-white/40">in</span>
          </div>
          <div className="flex items-center gap-1 text-neon-blue text-[10px] font-bold">
            <TrendingUp size={12} />
            <span>+0.4in this month</span>
          </div>
        </GlassCard>
      </div>

      {/* Weight Chart */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold text-sm uppercase tracking-widest">Weight Trend</h3>
          <span className="text-[10px] text-white/40">Last 7 Days</span>
        </div>
        <div className="h-48 w-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#ffffff40', fontSize: 10 }} 
              />
              <YAxis 
                hide 
                domain={['dataMin - 1', 'dataMax + 1']} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#141414', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                itemStyle={{ color: '#00f2ff' }}
              />
              <Area 
                type="monotone" 
                dataKey="weight" 
                stroke="#00f2ff" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorWeight)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Measurements List */}
      <div className="space-y-3">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-white/40 px-1">All Measurements</h3>
        <div className="space-y-2">
          {[
            { label: 'Arms', value: stats.arms[stats.arms.length - 1], unit: 'in', trend: '+0.2' },
            { label: 'Waist', value: stats.waist[stats.waist.length - 1], unit: 'in', trend: '-0.5' },
            { label: 'Shoulders', value: stats.shoulders[stats.shoulders.length - 1], unit: 'in', trend: '+0.8' },
          ].map((m) => (
            <GlassCard key={m.label} className="flex items-center justify-between py-4">
              <span className="font-bold text-sm">{m.label}</span>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="font-bold">{m.value}</span>
                  <span className="text-[10px] text-white/40 ml-1">{m.unit}</span>
                </div>
                <div className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-lg",
                  m.trend.startsWith('+') ? "bg-neon-blue/10 text-neon-blue" : "bg-green-400/10 text-green-400"
                )}>
                  {m.trend}
                </div>
                <ChevronRight size={16} className="text-white/20" />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
