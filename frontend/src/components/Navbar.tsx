import React from 'react';
import { motion } from 'framer-motion';
import { ScanLineIcon } from 'lucide-react';
export function Navbar() {
  return (
    <motion.nav
      initial={{
        opacity: 0,
        y: -8
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.5,
        ease: 'easeOut'
      }}
      className="w-full px-6 md:px-10 py-4 flex items-center justify-between border-b border-gray-100 bg-white/60 backdrop-blur-md sticky top-0 z-50">
      
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <ScanLineIcon className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-semibold text-gray-900 tracking-tight">
          DocuParse <span className="text-indigo-600">AI</span>
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <a
          href="#"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
          
          Documentation
        </a>
        <a
          href="#"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
          
          API
        </a>
        <a
          href="#"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
          
          Pricing
        </a>
      </div>

      <button className="text-sm font-medium text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
        Sign In
      </button>
    </motion.nav>);

}