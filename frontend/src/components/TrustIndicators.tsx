import React, { Children } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, AlertCircleIcon, FileCheckIcon } from 'lucide-react';
const indicators = [
{
  icon: AlertCircleIcon,
  text: 'Low-confidence fields highlighted for review',
  color: 'text-amber-600',
  bg: 'bg-amber-50'
},
{
  icon: FileCheckIcon,
  text: 'Supports PDF, JPG, PNG, scanned documents',
  color: 'text-indigo-600',
  bg: 'bg-indigo-50'
},
{
  icon: ShieldCheckIcon,
  text: 'Bank-grade encryption',
  color: 'text-emerald-600',
  bg: 'bg-emerald-50'
}];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.9
    }
  }
};
const item = {
  hidden: {
    opacity: 0,
    y: 10
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.42, 0, 0.58, 1] as const
    }
  }
};
export function TrustIndicators() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8">
      
      {indicators.map((ind) => {
        const IconComp = ind.icon;
        return (
          <motion.div
            key={ind.text}
            variants={item}
            className="flex items-center gap-2.5">
            
            <div
              className={`w-7 h-7 rounded-lg ${ind.bg} flex items-center justify-center flex-shrink-0`}>
              
              <IconComp className={`w-3.5 h-3.5 ${ind.color}`} />
            </div>
            <span className="text-sm text-gray-500">{ind.text}</span>
          </motion.div>);

      })}
    </motion.div>);

}