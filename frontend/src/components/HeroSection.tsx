import React from 'react';
import { motion } from 'framer-motion';
export function HeroSection() {
  return (
    <div className="text-center max-w-3xl mx-auto px-6">
      <motion.h1
        initial={{
          opacity: 0,
          y: 16
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.6,
          delay: 0.1,
          ease: 'easeOut'
        }}
        className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-gray-900 tracking-tight leading-[1.15]">
        
        Extract structured data
        <br />
        from any document
      </motion.h1>
      <motion.p
        initial={{
          opacity: 0,
          y: 12
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.6,
          delay: 0.25,
          ease: 'easeOut'
        }}
        className="mt-5 text-base md:text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
        
        Invoice extraction, KYC document parsing, financial statement analysis,
        handwritten note recognition — with multilingual OCR for English, Hindi,
        and regional languages.
      </motion.p>
    </div>);

}