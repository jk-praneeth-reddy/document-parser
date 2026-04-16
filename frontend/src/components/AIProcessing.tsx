import React, { useCallback, useEffect, useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  TagIcon,
  ScanLineIcon,
  LayoutListIcon,
  CheckCircle2Icon,
  Loader2Icon,
  FileTextIcon,
  GlobeIcon,
  TableIcon,
  AlertTriangleIcon,
  HashIcon,
  PenToolIcon,
  ArrowRightIcon,
  SparklesIcon } from
'lucide-react';
// Types
type StageId =
'quality' |
'classification' |
'extraction' |
'structuring' |
'validation';
type StageStatus = 'pending' | 'active' | 'done';
interface Stage {
  id: StageId;
  label: string;
  icon: React.ElementType;
}
interface ActivityItem {
  id: number;
  icon: React.ElementType;
  text: string;
  type: 'info' | 'success' | 'warning' | 'detail';
  stageId: StageId;
}
interface BoundingBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
  delay: number;
}
interface ExtractedFieldItem {
  label: string;
  value: string;
  revealAt: number;
}
// Constants
const STAGES: Stage[] = [
{
  id: 'quality',
  label: 'Quality Check',
  icon: ShieldCheckIcon
},
{
  id: 'classification',
  label: 'Classification',
  icon: TagIcon
},
{
  id: 'extraction',
  label: 'OCR Extraction',
  icon: ScanLineIcon
},
{
  id: 'structuring',
  label: 'Structuring',
  icon: LayoutListIcon
},
{
  id: 'validation',
  label: 'Validation',
  icon: CheckCircle2Icon
}];

const ACTIVITY_FEED: ActivityItem[] = [
{
  id: 1,
  icon: ShieldCheckIcon,
  text: 'Image quality verified — resolution sufficient',
  type: 'success',
  stageId: 'quality'
},
{
  id: 2,
  icon: ScanLineIcon,
  text: 'No blur or glare detected',
  type: 'success',
  stageId: 'quality'
},
{
  id: 3,
  icon: TagIcon,
  text: 'Document classified as Invoice',
  type: 'info',
  stageId: 'classification'
},
{
  id: 4,
  icon: GlobeIcon,
  text: 'Language detected: English + Hindi',
  type: 'detail',
  stageId: 'classification'
},
{
  id: 5,
  icon: FileTextIcon,
  text: 'Multi-page document: 3 pages detected',
  type: 'detail',
  stageId: 'classification'
},
{
  id: 6,
  icon: ScanLineIcon,
  text: 'Running OCR engine on page 1...',
  type: 'info',
  stageId: 'extraction'
},
{
  id: 7,
  icon: HashIcon,
  text: '17 text fields identified',
  type: 'info',
  stageId: 'extraction'
},
{
  id: 8,
  icon: TableIcon,
  text: 'Table structure detected — 8 rows, 5 columns',
  type: 'info',
  stageId: 'extraction'
},
{
  id: 9,
  icon: PenToolIcon,
  text: 'Handwritten annotation found on page 2',
  type: 'detail',
  stageId: 'extraction'
},
{
  id: 10,
  icon: LayoutListIcon,
  text: 'Mapping fields to invoice schema...',
  type: 'info',
  stageId: 'structuring'
},
{
  id: 11,
  icon: CheckCircle2Icon,
  text: 'Vendor name: Acme Corp Pvt Ltd',
  type: 'success',
  stageId: 'structuring'
},
{
  id: 12,
  icon: CheckCircle2Icon,
  text: 'Invoice total: ₹1,24,500.00',
  type: 'success',
  stageId: 'structuring'
},
{
  id: 13,
  icon: AlertTriangleIcon,
  text: '3 low-confidence fields flagged for review',
  type: 'warning',
  stageId: 'structuring'
},
{
  id: 14,
  icon: CheckCircle2Icon,
  text: 'Total amount cross-check completed',
  type: 'success',
  stageId: 'validation'
},
{
  id: 15,
  icon: CheckCircle2Icon,
  text: 'GST number format validated',
  type: 'success',
  stageId: 'validation'
},
{
  id: 16,
  icon: SparklesIcon,
  text: 'Processing complete — 94% overall confidence',
  type: 'success',
  stageId: 'validation'
}];

const BOUNDING_BOXES: BoundingBox[] = [
{
  id: 'header',
  x: 5,
  y: 4,
  w: 40,
  h: 8,
  label: 'Header',
  color: 'rgba(79, 70, 229, 0.25)',
  delay: 3.5
},
{
  id: 'vendor',
  x: 5,
  y: 14,
  w: 35,
  h: 5,
  label: 'Vendor',
  color: 'rgba(16, 185, 129, 0.25)',
  delay: 4.2
},
{
  id: 'invoice-no',
  x: 60,
  y: 4,
  w: 35,
  h: 5,
  label: 'Invoice #',
  color: 'rgba(245, 158, 11, 0.25)',
  delay: 4.8
},
{
  id: 'date',
  x: 60,
  y: 11,
  w: 25,
  h: 5,
  label: 'Date',
  color: 'rgba(245, 158, 11, 0.25)',
  delay: 5.2
},
{
  id: 'table',
  x: 5,
  y: 32,
  w: 90,
  h: 35,
  label: 'Line Items',
  color: 'rgba(79, 70, 229, 0.2)',
  delay: 5.8
},
{
  id: 'total',
  x: 55,
  y: 72,
  w: 40,
  h: 8,
  label: 'Total',
  color: 'rgba(16, 185, 129, 0.3)',
  delay: 7.0
},
{
  id: 'gst',
  x: 5,
  y: 82,
  w: 35,
  h: 5,
  label: 'GST Info',
  color: 'rgba(139, 92, 246, 0.25)',
  delay: 7.5
},
{
  id: 'signature',
  x: 60,
  y: 85,
  w: 30,
  h: 10,
  label: 'Signature',
  color: 'rgba(236, 72, 153, 0.2)',
  delay: 8.5
}];

const EXTRACTED_FIELDS: ExtractedFieldItem[] = [
{
  label: 'Invoice Number',
  value: 'INV-2024-0847',
  revealAt: 6.5
},
{
  label: 'Vendor Name',
  value: 'Acme Corp Pvt Ltd',
  revealAt: 7.2
},
{
  label: 'Invoice Date',
  value: '15 Mar 2024',
  revealAt: 7.8
},
{
  label: 'Due Date',
  value: '14 Apr 2024',
  revealAt: 8.2
},
{
  label: 'Total Amount',
  value: '₹1,24,500.00',
  revealAt: 8.8
},
{
  label: 'GST Number',
  value: '27AABCU9603R1ZM',
  revealAt: 9.5
},
{
  label: 'Line Items',
  value: '8 items detected',
  revealAt: 10.0
}];

// Stage timing (seconds from start)
const STAGE_TIMING: Record<
  StageId,
  {
    start: number;
    end: number;
  }> =
{
  quality: {
    start: 0,
    end: 2
  },
  classification: {
    start: 2,
    end: 4
  },
  extraction: {
    start: 4,
    end: 7.5
  },
  structuring: {
    start: 7.5,
    end: 10
  },
  validation: {
    start: 10,
    end: 12
  }
};
// Sub-components
function StageTracker({ currentTime }: {currentTime: number;}) {
  const getStatus = (stageId: StageId): StageStatus => {
    const timing = STAGE_TIMING[stageId];
    if (currentTime >= timing.end) return 'done';
    if (currentTime >= timing.start) return 'active';
    return 'pending';
  };
  return (
    <div className="flex items-center justify-center gap-1 md:gap-2">
      {STAGES.map((stage, i) => {
        const status = getStatus(stage.id);
        const IconComp = stage.icon;
        return (
          <Fragment key={stage.id}>
            <motion.div
              animate={{
                backgroundColor:
                status === 'done' ?
                '#ECFDF5' :
                status === 'active' ?
                '#EEF2FF' :
                '#F9FAFB',
                borderColor:
                status === 'done' ?
                '#A7F3D0' :
                status === 'active' ?
                '#C7D2FE' :
                '#E5E7EB'
              }}
              transition={{
                duration: 0.4
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border">
              
              {status === 'done' ?
              <motion.div
                initial={{
                  scale: 0
                }}
                animate={{
                  scale: 1
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 15
                }}>
                
                  <CheckCircle2Icon className="w-4 h-4 text-emerald-500" />
                </motion.div> :
              status === 'active' ?
              <motion.div
                animate={{
                  rotate: 360
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: 'linear'
                }}>
                
                  <Loader2Icon className="w-4 h-4 text-indigo-500" />
                </motion.div> :

              <IconComp className="w-4 h-4 text-gray-300" />
              }
              <span
                className={`text-xs font-semibold hidden sm:inline ${status === 'done' ? 'text-emerald-700' : status === 'active' ? 'text-indigo-700' : 'text-gray-400'}`}>
                
                {stage.label}
              </span>
            </motion.div>
            {i < STAGES.length - 1 &&
            <div className="w-4 md:w-8 h-px relative">
                <div className="absolute inset-0 bg-gray-200 rounded" />
                <motion.div
                className="absolute inset-y-0 left-0 bg-emerald-400 rounded"
                animate={{
                  width:
                  getStatus(STAGES[i + 1].id) !== 'pending' ?
                  '100%' :
                  status === 'done' ?
                  '100%' :
                  '0%'
                }}
                transition={{
                  duration: 0.5
                }} />
              
              </div>
            }
          </Fragment>);

      })}
    </div>);

}
function DocumentPreview({ currentTime }: {currentTime: number;}) {
  const visibleBoxes = BOUNDING_BOXES.filter((b) => currentTime >= b.delay);
  return (
    <div className="w-full h-full bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
      {/* Simulated document content */}
      <div className="absolute inset-0 p-6 md:p-8">
        {/* Company header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-3 w-32 bg-gray-800 rounded mb-2" />
            <div className="h-2 w-24 bg-gray-300 rounded" />
          </div>
          <div className="text-right">
            <div className="h-2.5 w-20 bg-gray-700 rounded mb-1.5 ml-auto" />
            <div className="h-2 w-28 bg-gray-300 rounded ml-auto" />
            <div className="h-2 w-16 bg-gray-300 rounded mt-1 ml-auto" />
          </div>
        </div>

        {/* Vendor info */}
        <div className="mb-6">
          <div className="h-2 w-12 bg-gray-400 rounded mb-2" />
          <div className="h-2 w-36 bg-gray-300 rounded mb-1" />
          <div className="h-2 w-28 bg-gray-300 rounded mb-1" />
          <div className="h-2 w-32 bg-gray-300 rounded" />
        </div>

        {/* Table header */}
        <div className="mb-1">
          <div className="flex gap-4 pb-2 border-b border-gray-200">
            <div className="h-2 w-8 bg-gray-500 rounded" />
            <div className="h-2 w-32 bg-gray-500 rounded" />
            <div className="h-2 w-12 bg-gray-500 rounded ml-auto" />
            <div className="h-2 w-14 bg-gray-500 rounded" />
            <div className="h-2 w-16 bg-gray-500 rounded" />
          </div>
        </div>

        {/* Table rows */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((row) =>
        <div key={row} className="flex gap-4 py-2 border-b border-gray-50">
            <div className="h-1.5 w-6 bg-gray-200 rounded" />
            <div
            className={`h-1.5 bg-gray-200 rounded`}
            style={{
              width: `${60 + Math.random() * 60}px`
            }} />
          
            <div className="h-1.5 w-10 bg-gray-200 rounded ml-auto" />
            <div className="h-1.5 w-12 bg-gray-200 rounded" />
            <div className="h-1.5 w-14 bg-gray-200 rounded" />
          </div>
        )}

        {/* Totals */}
        <div className="mt-4 flex justify-end">
          <div className="space-y-1.5">
            <div className="flex items-center gap-8">
              <div className="h-2 w-16 bg-gray-300 rounded" />
              <div className="h-2 w-20 bg-gray-300 rounded" />
            </div>
            <div className="flex items-center gap-8">
              <div className="h-2 w-12 bg-gray-300 rounded" />
              <div className="h-2 w-16 bg-gray-300 rounded" />
            </div>
            <div className="flex items-center gap-8 pt-1 border-t border-gray-200">
              <div className="h-2.5 w-14 bg-gray-700 rounded" />
              <div className="h-2.5 w-24 bg-gray-700 rounded" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-end justify-between">
          <div>
            <div className="h-2 w-20 bg-gray-300 rounded mb-1" />
            <div className="h-2 w-32 bg-gray-300 rounded" />
          </div>
          <div className="w-20 h-12 border border-gray-200 rounded-md flex items-center justify-center">
            <div className="w-14 h-6 bg-gray-100 rounded" />
          </div>
        </div>
      </div>

      {/* Scanning line */}
      {currentTime < 12 &&
      <motion.div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent z-10"
        animate={{
          top: ['0%', '100%']
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear'
        }} />

      }

      {/* Bounding boxes */}
      <AnimatePresence>
        {visibleBoxes.map((box) =>
        <motion.div
          key={box.id}
          initial={{
            opacity: 0,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          transition={{
            duration: 0.4,
            ease: 'easeOut'
          }}
          className="absolute z-20 rounded-md border-2 pointer-events-none"
          style={{
            left: `${box.x}%`,
            top: `${box.y}%`,
            width: `${box.w}%`,
            height: `${box.h}%`,
            backgroundColor: box.color,
            borderColor: box.color.replace(/[\d.]+\)$/, '0.6)')
          }}>
          
            <motion.span
            initial={{
              opacity: 0,
              y: -4
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.2
            }}
            className="absolute -top-5 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: box.color.replace(/[\d.]+\)$/, '0.9)'),
              color: '#fff'
            }}>
            
              {box.label}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion overlay */}
      <AnimatePresence>
        {currentTime >= 12 &&
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-30 flex items-center justify-center">
          
            <motion.div
            initial={{
              scale: 0.8,
              opacity: 0
            }}
            animate={{
              scale: 1,
              opacity: 1
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20
            }}
            className="flex flex-col items-center">
            
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                <CheckCircle2Icon className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">
                Processing Complete
              </p>
              <p className="text-xs text-gray-500 mt-1">
                94% overall confidence
              </p>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}
function ActivityFeed({ currentTime }: {currentTime: number;}) {
  const visibleItems = ACTIVITY_FEED.filter((item) => {
    const stageTiming = STAGE_TIMING[item.stageId];
    const stageItems = ACTIVITY_FEED.filter((a) => a.stageId === item.stageId);
    const indexInStage = stageItems.indexOf(item);
    const stageDuration = stageTiming.end - stageTiming.start;
    const itemTime =
    stageTiming.start +
    indexInStage / stageItems.length * stageDuration +
    0.3;
    return currentTime >= itemTime;
  });
  const iconColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return 'text-emerald-500 bg-emerald-50';
      case 'warning':
        return 'text-amber-500 bg-amber-50';
      case 'info':
        return 'text-indigo-500 bg-indigo-50';
      case 'detail':
        return 'text-gray-400 bg-gray-50';
    }
  };
  return (
    <div className="space-y-1.5">
      <AnimatePresence>
        {visibleItems.map((item) => {
          const IconComp = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{
                opacity: 0,
                x: 12,
                height: 0
              }}
              animate={{
                opacity: 1,
                x: 0,
                height: 'auto'
              }}
              transition={{
                duration: 0.3,
                ease: 'easeOut'
              }}
              className="flex items-start gap-2.5 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
              
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${iconColor(item.type)}`}>
                
                <IconComp className="w-3 h-3" />
              </div>
              <p
                className={`text-xs leading-relaxed ${item.type === 'warning' ? 'text-amber-700 font-medium' : 'text-gray-600'}`}>
                
                {item.text}
              </p>
            </motion.div>);

        })}
      </AnimatePresence>

      {/* Typing indicator when processing */}
      {currentTime < 12 &&
      <motion.div
        animate={{
          opacity: [0.4, 1, 0.4]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity
        }}
        className="flex items-center gap-1.5 py-2 px-3">
        
          <div className="flex gap-0.5">
            <div className="w-1 h-1 rounded-full bg-indigo-400" />
            <div className="w-1 h-1 rounded-full bg-indigo-300" />
            <div className="w-1 h-1 rounded-full bg-indigo-200" />
          </div>
          <span className="text-[11px] text-gray-400">Processing...</span>
        </motion.div>
      }
    </div>);

}
function ExtractedFieldsPanel({ currentTime }: {currentTime: number;}) {
  const visibleFields = EXTRACTED_FIELDS.filter(
    (f) => currentTime >= f.revealAt
  );
  const pendingCount = EXTRACTED_FIELDS.length - visibleFields.length;
  return (
    <div className="space-y-2">
      <AnimatePresence>
        {visibleFields.map((field) =>
        <motion.div
          key={field.label}
          initial={{
            opacity: 0,
            y: 6
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.3
          }}
          className="p-3 rounded-lg bg-gray-50 border border-gray-100">
          
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              {field.label}
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">
              {field.value}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skeleton placeholders for pending fields */}
      {pendingCount > 0 &&
      Array.from({
        length: Math.min(pendingCount, 3)
      }).map((_, i) =>
      <motion.div
        key={`skeleton-${i}`}
        className="p-3 rounded-lg bg-gray-50 border border-gray-100">
        
            <motion.div
          className="h-2 w-16 bg-gray-200 rounded mb-2"
          animate={{
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.15
          }} />
        
            <motion.div
          className="h-3 w-28 bg-gray-100 rounded"
          animate={{
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.15 + 0.1
          }} />
        
          </motion.div>
      )}
    </div>);

}
// Main component
interface AIProcessingProps {
  onComplete: () => void;
}
export function AIProcessing({ onComplete }: AIProcessingProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setCurrentTime(elapsed);
      if (elapsed >= 12.5 && !isComplete) {
        setIsComplete(true);
      }
      if (elapsed >= 30) {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isComplete]);
  const progressPercent = Math.min(currentTime / 12 * 100, 100);
  return (
    <motion.div
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      exit={{
        opacity: 0
      }}
      transition={{
        duration: 0.3
      }}
      className="w-full min-h-screen bg-[#FAFAFA] flex flex-col">
      
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white px-4 md:px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <SparklesIcon className="w-4.5 h-4.5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">
                AI Document Processing
              </h1>
              <p className="text-xs text-gray-500">
                invoice_march_2024.pdf · 3 pages
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-gray-600">
                {Math.round(progressPercent)}% complete
              </p>
              <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                  animate={{
                    width: `${progressPercent}%`
                  }}
                  transition={{
                    duration: 0.3
                  }} />
                
              </div>
            </div>
            <AnimatePresence>
              {isComplete &&
              <motion.button
                initial={{
                  opacity: 0,
                  scale: 0.9
                }}
                animate={{
                  opacity: 1,
                  scale: 1
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20
                }}
                onClick={onComplete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                
                  View Results
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </motion.button>
              }
            </AnimatePresence>
          </div>
        </div>

        {/* Stage tracker */}
        <StageTracker currentTime={currentTime} />
      </div>

      {/* Main content — 2 panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center — Document preview */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="w-full max-w-3xl mx-auto h-full min-h-[500px]">
              <DocumentPreview currentTime={currentTime} />
            </div>
          </div>
        </div>

        {/* Right panel — Activity + Extracted fields */}
        <div className="w-80 lg:w-96 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto hidden md:flex flex-col">
          {/* Activity feed */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Activity
                </h2>
                {!isComplete &&
                <motion.div
                  animate={{
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity
                  }}
                  className="flex items-center gap-1.5">
                  
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-medium text-indigo-600">
                      Live
                    </span>
                  </motion.div>
                }
              </div>
            </div>
            <div className="p-2">
              <ActivityFeed currentTime={currentTime} />
            </div>
          </div>

          {/* Extracted fields */}
          <div className="border-t border-gray-100">
            <div className="p-4 border-b border-gray-50">
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Extracted Fields
              </h2>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {
                EXTRACTED_FIELDS.filter((f) => currentTime >= f.revealAt).
                length
                }{' '}
                of {EXTRACTED_FIELDS.length} fields
              </p>
            </div>
            <div className="p-3 max-h-72 overflow-y-auto">
              <ExtractedFieldsPanel currentTime={currentTime} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>);

}