'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface AIDoctorAvatarProps {
  size?: 'small' | 'medium' | 'large';
  showPulse?: boolean;
  className?: string;
}

export default function AIDoctorAvatar({
  size = 'medium',
  showPulse = true,
  className = ''
}: AIDoctorAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);

  // Natural blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const sizeConfig = {
    small: {
      container: 'w-32 h-32',
      avatar: 'w-28 h-28',
      icon: 'w-12 h-12',
      badge: 'text-xs px-2 py-1',
    },
    medium: {
      container: 'w-48 h-48',
      avatar: 'w-40 h-40',
      icon: 'w-16 h-16',
      badge: 'text-sm px-3 py-1.5',
    },
    large: {
      container: 'w-64 h-64',
      avatar: 'w-56 h-56',
      icon: 'w-24 h-24',
      badge: 'text-base px-4 py-2',
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Outer glow effect */}
      {showPulse && (
        <motion.div
          className={`absolute ${config.container} rounded-full bg-gradient-to-br from-blue-400/20 to-teal-400/20 blur-2xl`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Main avatar container */}
      <motion.div
        className={`relative ${config.container} flex items-center justify-center`}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Background circle with gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 shadow-2xl" />

        {/* Inner glow ring */}
        <motion.div
          className={`absolute ${config.avatar} rounded-full bg-gradient-to-br from-blue-400/30 to-teal-400/30`}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Doctor illustration */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Head */}
          <motion.div
            className="relative mb-2"
            animate={{
              rotate: [-2, 2, -2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Face circle */}
            <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 shadow-lg">
              {/* Eyes */}
              <div className="absolute top-6 left-4 flex gap-4">
                <motion.div
                  className="h-2 w-2 rounded-full bg-slate-800"
                  animate={{
                    scaleY: isBlinking ? 0.1 : 1,
                  }}
                  transition={{ duration: 0.1 }}
                />
                <motion.div
                  className="h-2 w-2 rounded-full bg-slate-800"
                  animate={{
                    scaleY: isBlinking ? 0.1 : 1,
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* Smile */}
              <svg
                className="absolute bottom-4 left-1/2 -translate-x-1/2"
                width="24"
                height="12"
                viewBox="0 0 24 12"
                fill="none"
              >
                <path
                  d="M2 2C6 8 18 8 22 2"
                  stroke="#1e293b"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              {/* Medical headband */}
              <div className="absolute -top-2 left-1/2 h-3 w-16 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-400 to-teal-400 shadow-md">
                <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          </motion.div>

          {/* Body - Medical coat */}
          <div className="relative">
            {/* Lab coat */}
            <div className="h-16 w-24 rounded-b-2xl bg-gradient-to-b from-white to-blue-50 shadow-lg">
              {/* Coat buttons */}
              <div className="absolute left-1/2 top-2 flex -translate-x-1/2 flex-col gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              </div>

              {/* Collar */}
              <div className="absolute -top-1 left-0 h-4 w-6 rounded-br-lg bg-white shadow-sm" />
              <div className="absolute -top-1 right-0 h-4 w-6 rounded-bl-lg bg-white shadow-sm" />
            </div>

            {/* Stethoscope */}
            <svg
              className="absolute -bottom-2 left-1/2 -translate-x-1/2"
              width="40"
              height="24"
              viewBox="0 0 40 24"
              fill="none"
            >
              <path
                d="M12 4C12 4 15 12 20 12C25 12 28 4 28 4"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="20" cy="16" r="4" fill="#3b82f6" />
              <circle cx="20" cy="16" r="2" fill="#60a5fa" />
            </svg>
          </div>
        </div>

        {/* Medical cross badge */}
        <motion.div
          className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-500 shadow-lg"
          animate={{
            rotate: [0, 10, 0, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Status badge */}
      <motion.div
        className={`mt-4 flex items-center gap-2 rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-md ${config.badge}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="h-2 w-2 rounded-full bg-emerald-500"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
        <span className="font-medium text-emerald-700">AI Doctor Online</span>
      </motion.div>

      {/* Floating particles */}
      {showPulse && (
        <>
          <motion.div
            className="absolute left-4 top-8 h-1 w-1 rounded-full bg-blue-300"
            animate={{
              y: [-10, -30, -10],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute right-8 top-12 h-1.5 w-1.5 rounded-full bg-teal-300"
            animate={{
              y: [-10, -35, -10],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
          />
          <motion.div
            className="absolute bottom-16 right-4 h-1 w-1 rounded-full bg-cyan-300"
            animate={{
              y: [-10, -25, -10],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
        </>
      )}
    </div>
  );
}
