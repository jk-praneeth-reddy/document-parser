import React, { Children } from 'react';
import { motion } from 'framer-motion';
import {
  ReceiptTextIcon,
  CreditCardIcon,
  FingerprintIcon,
  BookOpenIcon,
  CarIcon,
  LandmarkIcon,
  BarChart3Icon,
  PenToolIcon,
  FilesIcon } from
'lucide-react';
const documentTypes = [
{
  label: 'Invoice',
  icon: ReceiptTextIcon
},
{
  label: 'PAN Card',
  icon: CreditCardIcon
},
{
  label: 'Aadhaar',
  icon: FingerprintIcon
},
{
  label: 'Passport',
  icon: BookOpenIcon
},
{
  label: 'Driving License',
  icon: CarIcon
},
{
  label: 'Bank Statement',
  icon: LandmarkIcon
},
{
  label: 'Financial Statement',
  icon: BarChart3Icon
},
{
  label: 'Handwritten Notes',
  icon: PenToolIcon
},
{
  label: 'Multi-page PDF',
  icon: FilesIcon
}];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.6
    }
  }
};
const chip = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.95
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: 'easeOut'
    }
  }
};
export function DocumentTypeChips() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-wrap justify-center gap-2 mt-5">
      
      {documentTypes.map((doc) => {
        const IconComp = doc.icon;
        return (
          <motion.span
            key={doc.label}
            variants={chip}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 bg-gray-100 border border-gray-150 select-none">
            
            <IconComp className="w-3.5 h-3.5 text-gray-400" />
            {doc.label}
          </motion.span>);

      })}
    </motion.div>);

}