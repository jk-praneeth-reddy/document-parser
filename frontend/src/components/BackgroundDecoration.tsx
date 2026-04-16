import React from 'react';
import { motion } from 'framer-motion';
export function BackgroundDecoration() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true">
      
      {/* Top-right document shape */}
      <motion.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 0.04
        }}
        transition={{
          duration: 2,
          delay: 0.5
        }}
        className="absolute -top-10 -right-16 w-72 h-96 rounded-2xl border border-gray-300 rotate-12"
        style={{
          background: 'linear-gradient(135deg, #E5E7EB 0%, transparent 100%)'
        }}>
        
        <div className="p-6 space-y-3">
          <div className="h-2 w-24 bg-gray-300 rounded" />
          <div className="h-2 w-32 bg-gray-300 rounded" />
          <div className="h-2 w-20 bg-gray-300 rounded" />
          <div className="mt-6 h-2 w-full bg-gray-300 rounded" />
          <div className="h-2 w-full bg-gray-300 rounded" />
          <div className="h-2 w-3/4 bg-gray-300 rounded" />
        </div>
      </motion.div>

      {/* Bottom-left document shape */}
      <motion.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 0.03
        }}
        transition={{
          duration: 2,
          delay: 0.8
        }}
        className="absolute -bottom-20 -left-12 w-64 h-80 rounded-2xl border border-gray-300 -rotate-6"
        style={{
          background: 'linear-gradient(225deg, #E5E7EB 0%, transparent 100%)'
        }}>
        
        <div className="p-6 space-y-3">
          <div className="h-16 w-16 bg-gray-300 rounded-lg" />
          <div className="h-2 w-28 bg-gray-300 rounded" />
          <div className="h-2 w-20 bg-gray-300 rounded" />
          <div className="mt-4 h-2 w-full bg-gray-300 rounded" />
          <div className="h-2 w-full bg-gray-300 rounded" />
        </div>
      </motion.div>

      {/* Mid-right small card */}
      <motion.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 0.025
        }}
        transition={{
          duration: 2,
          delay: 1.2
        }}
        className="absolute top-1/2 -right-8 w-48 h-64 rounded-xl border border-gray-300 rotate-6">
        
        <div className="p-4 space-y-2">
          <div className="h-2 w-16 bg-gray-300 rounded" />
          <div className="h-2 w-24 bg-gray-300 rounded" />
          <div className="mt-3 h-2 w-full bg-gray-300 rounded" />
          <div className="h-2 w-full bg-gray-300 rounded" />
          <div className="h-2 w-2/3 bg-gray-300 rounded" />
        </div>
      </motion.div>
    </div>);

}