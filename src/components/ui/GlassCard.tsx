import { ReactNode, Key } from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  key?: Key;
}

export default function GlassCard({ children, className, onClick }: GlassCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "glass-card p-5 transition-all duration-300 hover:border-white/20 active:scale-[0.98]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
