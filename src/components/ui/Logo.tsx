import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className, size = 80 }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative"
        style={{ width: size, height: size }}
      >
        {/* App Icon Background */}
        <div className="absolute inset-0 bg-black rounded-[22%] border border-white/5 shadow-2xl overflow-hidden">
          {/* Subtle Gradient Glow */}
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-neon-blue/10 blur-[40px] rounded-full" />
        </div>

        {/* Monogram SVG */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full p-[22%]"
        >
          {/* Stylized 'F' */}
          <motion.path
            d="M20 25H55V35H32V50H50V60H32V85H20V25Z"
            fill="white"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          />
          
          {/* Stylized 'T' */}
          <motion.path
            d="M60 25H95V35H82V85H70V35H60V25Z"
            fill="white"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          />

          {/* Neon Blue AI Accent - Vertical Line between F and T */}
          <motion.rect
            x="56"
            y="25"
            width="2"
            height="60"
            fill="#00f2ff"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.6, duration: 1, ease: "circOut" }}
            className="drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]"
          />

          {/* Futuristic AI Dot at the bottom of the accent */}
          <motion.circle
            cx="57"
            cy="85"
            r="2.5"
            fill="#00f2ff"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2, type: "spring" }}
            className="drop-shadow-[0_0_10px_#00f2ff]"
          />
        </svg>
      </motion.div>
    </div>
  );
}
