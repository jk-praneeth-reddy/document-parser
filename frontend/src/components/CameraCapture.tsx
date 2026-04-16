import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  ZapIcon,
  ZapOffIcon,
  ImageIcon,
  CheckCircle2Icon,
  RotateCcwIcon,
  PlusIcon,
  ScanLineIcon,
  EyeIcon,
  SunIcon,
  MaximizeIcon,
  AlignCenterIcon } from
'lucide-react';
type CaptureScreen = 'live' | 'capturing' | 'confirmation';
type QualityLevel = 'good' | 'warning' | 'poor';
interface QualityIndicator {
  label: string;
  icon: React.ElementType;
  status: QualityLevel;
  text: string;
}
const DOC_TYPES = [
{
  id: 'pan',
  label: 'PAN Card',
  aspect: 'aspect-[1.6/1]'
},
{
  id: 'aadhaar',
  label: 'Aadhaar',
  aspect: 'aspect-[1.6/1]'
},
{
  id: 'passport',
  label: 'Passport',
  aspect: 'aspect-[1/1.4]'
},
{
  id: 'license',
  label: 'License',
  aspect: 'aspect-[1.6/1]'
},
{
  id: 'invoice',
  label: 'Invoice',
  aspect: 'aspect-[1/1.4]'
}] as
const;
const HELPER_TEXTS = [
'Place the document within the frame',
'Hold steady...',
'Avoid glare and shadows',
'Looking good! Tap to capture'];

const QUALITY_STATES: QualityIndicator[][] = [
[
{
  label: 'Blur',
  icon: EyeIcon,
  status: 'warning',
  text: 'Stabilizing...'
},
{
  label: 'Glare',
  icon: SunIcon,
  status: 'good',
  text: 'Clear'
},
{
  label: 'Edges',
  icon: MaximizeIcon,
  status: 'poor',
  text: 'Detecting...'
},
{
  label: 'Alignment',
  icon: AlignCenterIcon,
  status: 'warning',
  text: 'Adjusting'
}],

[
{
  label: 'Blur',
  icon: EyeIcon,
  status: 'good',
  text: 'Sharp'
},
{
  label: 'Glare',
  icon: SunIcon,
  status: 'warning',
  text: 'Minor glare'
},
{
  label: 'Edges',
  icon: MaximizeIcon,
  status: 'warning',
  text: 'Partial'
},
{
  label: 'Alignment',
  icon: AlignCenterIcon,
  status: 'good',
  text: 'Aligned'
}],

[
{
  label: 'Blur',
  icon: EyeIcon,
  status: 'good',
  text: 'Sharp'
},
{
  label: 'Glare',
  icon: SunIcon,
  status: 'good',
  text: 'Clear'
},
{
  label: 'Edges',
  icon: MaximizeIcon,
  status: 'good',
  text: 'Detected'
},
{
  label: 'Alignment',
  icon: AlignCenterIcon,
  status: 'warning',
  text: 'Adjusting'
}],

[
{
  label: 'Blur',
  icon: EyeIcon,
  status: 'good',
  text: 'Sharp'
},
{
  label: 'Glare',
  icon: SunIcon,
  status: 'good',
  text: 'Clear'
},
{
  label: 'Edges',
  icon: MaximizeIcon,
  status: 'good',
  text: 'Detected'
},
{
  label: 'Alignment',
  icon: AlignCenterIcon,
  status: 'good',
  text: 'Aligned'
}]];


function statusColor(s: QualityLevel) {
  if (s === 'good')
  return {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400'
  };
  if (s === 'warning')
  return {
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    dot: 'bg-amber-400'
  };
  return {
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    dot: 'bg-red-400'
  };
}
interface CameraCaptureProps {
  onClose: () => void;
  onCapture: () => void;
}
export function CameraCapture({ onClose, onCapture }: CameraCaptureProps) {
  const [screen, setScreen] = useState<CaptureScreen>('live');
  const [selectedDoc, setSelectedDoc] = useState('pan');
  const [flashOn, setFlashOn] = useState(false);
  const [qualityIndex, setQualityIndex] = useState(0);
  const [helperIndex, setHelperIndex] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const allGood = qualityIndex === QUALITY_STATES.length - 1;
  const currentDocType =
  DOC_TYPES.find((d) => d.id === selectedDoc) || DOC_TYPES[0];
  // Cycle quality indicators
  useEffect(() => {
    if (screen !== 'live') return;
    const interval = setInterval(() => {
      setQualityIndex((prev) => {
        if (prev >= QUALITY_STATES.length - 1) return prev;
        return prev + 1;
      });
    }, 2200);
    return () => clearInterval(interval);
  }, [screen]);
  // Cycle helper text
  useEffect(() => {
    if (screen !== 'live') return;
    const interval = setInterval(() => {
      setHelperIndex((prev) => (prev + 1) % HELPER_TEXTS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [screen]);
  const handleCapture = useCallback(() => {
    setScreen('capturing');
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);
    setTimeout(() => setScreen('confirmation'), 500);
  }, []);
  const handleRetake = useCallback(() => {
    setScreen('live');
    setQualityIndex(0);
    setHelperIndex(0);
  }, []);
  const handleConfirm = useCallback(() => {
    onCapture();
  }, [onCapture]);
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.98
      }}
      animate={{
        opacity: 1,
        scale: 1
      }}
      exit={{
        opacity: 0,
        scale: 0.98
      }}
      transition={{
        duration: 0.35,
        ease: 'easeOut'
      }}
      className="fixed inset-0 z-50 bg-[#0A0A0F] flex flex-col overflow-hidden">
      
      {/* Flash overlay */}
      <AnimatePresence>
        {showFlash &&
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 0.85
          }}
          exit={{
            opacity: 0
          }}
          transition={{
            duration: 0.15
          }}
          className="absolute inset-0 bg-white z-50 pointer-events-none" />

        }
      </AnimatePresence>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-6 pt-4 pb-3 relative z-10">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/12 transition-colors"
          aria-label="Go back">
          
          <ArrowLeftIcon className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <ScanLineIcon className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-white tracking-tight">
            Document Capture
          </span>
        </div>
        <div className="w-10" />
      </div>

      {/* Document type selector */}
      <div className="px-4 md:px-6 pb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar justify-center">
          {DOC_TYPES.map((doc) =>
          <button
            key={doc.id}
            onClick={() => setSelectedDoc(doc.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedDoc === doc.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/8 text-gray-400 border border-white/8 hover:bg-white/12 hover:text-gray-300'}`}>
            
              {doc.label}
            </button>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 relative">
        <AnimatePresence mode="wait">
          {screen !== 'confirmation' ?
          <motion.div
            key="viewfinder"
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0,
              y: -20
            }}
            transition={{
              duration: 0.3
            }}
            className="w-full max-w-lg flex flex-col items-center">
            
              {/* Quality indicators */}
              <div className="flex gap-2 mb-4 flex-wrap justify-center">
                {QUALITY_STATES[qualityIndex].map((q) => {
                const colors = statusColor(q.status);
                const IconComp = q.icon;
                return (
                  <motion.div
                    key={q.label}
                    layout
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${colors.bg} border border-white/5`}>
                    
                      <IconComp className={`w-3 h-3 ${colors.text}`} />
                      <span className="text-[11px] font-medium text-gray-400">
                        {q.label}
                      </span>
                      <motion.div
                      key={q.status}
                      initial={{
                        scale: 0.8,
                        opacity: 0
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1
                      }}
                      className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                    
                      <span
                      className={`text-[11px] font-medium ${colors.text}`}>
                      
                        {q.text}
                      </span>
                    </motion.div>);

              })}
              </div>

              {/* Camera preview */}
              <div className="w-full relative rounded-2xl overflow-hidden bg-gray-900 border border-white/10">
                <div
                className={`w-full ${currentDocType.id === 'passport' || currentDocType.id === 'invoice' ? 'aspect-[3/4]' : 'aspect-[4/3]'} relative`}>
                
                  {/* Simulated camera feed background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                    {/* Subtle grid pattern */}
                    <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage:
                      'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                      backgroundSize: '24px 24px'
                    }} />
                  
                    {/* Scanning line */}
                    <motion.div
                    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent"
                    animate={{
                      top: ['5%', '95%', '5%']
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'linear'
                    }} />
                  
                  </div>

                  {/* Document framing guide */}
                  <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10">
                    <motion.div
                    className={`relative ${currentDocType.aspect} w-full max-w-[85%]`}
                    style={{
                      maxHeight: '80%'
                    }}>
                    
                      {/* Corner brackets */}
                      {[
                    {
                      pos: 'top-0 left-0',
                      border: 'border-t-2 border-l-2 rounded-tl-lg'
                    },
                    {
                      pos: 'top-0 right-0',
                      border: 'border-t-2 border-r-2 rounded-tr-lg'
                    },
                    {
                      pos: 'bottom-0 left-0',
                      border: 'border-b-2 border-l-2 rounded-bl-lg'
                    },
                    {
                      pos: 'bottom-0 right-0',
                      border: 'border-b-2 border-r-2 rounded-br-lg'
                    }].
                    map((corner, i) =>
                    <motion.div
                      key={i}
                      className={`absolute ${corner.pos} w-8 h-8 md:w-10 md:h-10 ${corner.border}`}
                      animate={{
                        borderColor: allGood ?
                        '#4F46E5' :
                        'rgba(255,255,255,0.5)',
                        opacity: allGood ? [1, 0.7, 1] : [0.5, 0.3, 0.5]
                      }}
                      transition={{
                        borderColor: {
                          duration: 0.4
                        },
                        opacity: {
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }
                      }} />

                    )}

                      {/* Simulated edge detection lines when aligned */}
                      <AnimatePresence>
                        {allGood &&
                      <>
                            {['top', 'bottom', 'left', 'right'].map((edge) =>
                        <motion.div
                          key={edge}
                          initial={{
                            opacity: 0,
                            scale: 0.9
                          }}
                          animate={{
                            opacity: 0.4,
                            scale: 1
                          }}
                          exit={{
                            opacity: 0
                          }}
                          transition={{
                            duration: 0.5
                          }}
                          className={`absolute ${edge === 'top' ? 'top-0 left-8 right-8 h-px md:left-10 md:right-10' : edge === 'bottom' ? 'bottom-0 left-8 right-8 h-px md:left-10 md:right-10' : edge === 'left' ? 'left-0 top-8 bottom-8 w-px md:top-10 md:bottom-10' : 'right-0 top-8 bottom-8 w-px md:top-10 md:bottom-10'} bg-indigo-400`} />

                        )}
                          </>
                      }
                      </AnimatePresence>

                      {/* Glow effect when aligned */}
                      <AnimatePresence>
                        {allGood &&
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
                        className="absolute inset-0 rounded-lg"
                        style={{
                          boxShadow:
                          '0 0 40px rgba(79, 70, 229, 0.12) inset'
                        }} />

                      }
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Helper text */}
              <div className="h-10 flex items-center justify-center mt-4">
                <AnimatePresence mode="wait">
                  <motion.p
                  key={helperIndex}
                  initial={{
                    opacity: 0,
                    y: 6
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  exit={{
                    opacity: 0,
                    y: -6
                  }}
                  transition={{
                    duration: 0.25
                  }}
                  className={`text-sm font-medium ${allGood ? 'text-indigo-400' : 'text-gray-500'}`}>
                  
                    {allGood ?
                  'Looking good! Tap to capture' :
                  HELPER_TEXTS[helperIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div> /* Confirmation state */ :

          <motion.div
            key="confirmation"
            initial={{
              opacity: 0,
              y: 24
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0
            }}
            transition={{
              duration: 0.4,
              ease: 'easeOut'
            }}
            className="w-full max-w-lg flex flex-col items-center">
            
              {/* Captured image preview */}
              <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-gray-900 relative">
                <div
                className={`w-full ${currentDocType.id === 'passport' || currentDocType.id === 'invoice' ? 'aspect-[3/4]' : 'aspect-[4/3]'} relative`}>
                
                  {/* Simulated captured document */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-8">
                    <div className="w-full h-full rounded-xl bg-white shadow-lg border border-gray-200 p-5 md:p-6 flex flex-col">
                      {/* Simulated document content */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <ScanLineIcon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="h-2.5 w-28 bg-gray-800 rounded" />
                          <div className="h-2 w-20 bg-gray-300 rounded mt-1.5" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2.5">
                        <div className="h-2 w-full bg-gray-200 rounded" />
                        <div className="h-2 w-4/5 bg-gray-200 rounded" />
                        <div className="h-2 w-full bg-gray-200 rounded" />
                        <div className="h-2 w-3/5 bg-gray-200 rounded" />
                        <div className="mt-4 flex gap-3">
                          <div className="h-8 w-20 bg-gray-100 rounded-md border border-gray-200" />
                          <div className="h-8 w-24 bg-gray-100 rounded-md border border-gray-200" />
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded mt-3" />
                        <div className="h-2 w-2/3 bg-gray-200 rounded" />
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <div className="h-2 w-16 bg-gray-300 rounded" />
                        <div className="h-2 w-24 bg-gray-300 rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Checkmark overlay */}
                  <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.5
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1
                  }}
                  transition={{
                    delay: 0.2,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20
                  }}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  
                    <CheckCircle2Icon className="w-5 h-5 text-white" />
                  </motion.div>
                </div>
              </div>

              {/* Quality summary */}
              <motion.div
              initial={{
                opacity: 0,
                y: 8
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: 0.3
              }}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              
                <CheckCircle2Icon className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">
                  Image quality: Excellent
                </span>
              </motion.div>

              {/* Action buttons */}
              <motion.div
              initial={{
                opacity: 0,
                y: 12
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: 0.4
              }}
              className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
              
                <button
                onClick={handleConfirm}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-lg shadow-indigo-500/20">
                
                  <CheckCircle2Icon className="w-4 h-4" />
                  Looks Good
                </button>
                <button
                onClick={handleRetake}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/8 text-white text-sm font-medium rounded-xl border border-white/10 hover:bg-white/12 transition-colors">
                
                  <RotateCcwIcon className="w-4 h-4" />
                  Retake
                </button>
              </motion.div>
              <button className="mt-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors font-medium">
                <PlusIcon className="w-4 h-4" />
                Add Another Page
              </button>
            </motion.div>
          }
        </AnimatePresence>
      </div>

      {/* Bottom controls — only show during live/capturing */}
      <AnimatePresence>
        {screen !== 'confirmation' &&
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: 20
          }}
          transition={{
            duration: 0.3
          }}
          className="px-6 pb-6 pt-4 flex items-center justify-center gap-8 relative z-10">
          
            {/* Gallery button */}
            <button
            className="w-12 h-12 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/12 transition-colors"
            aria-label="Upload from gallery">
            
              <ImageIcon className="w-5 h-5 text-gray-400" />
            </button>

            {/* Capture button */}
            <button
            onClick={handleCapture}
            className="relative group"
            aria-label="Capture document">
            
              <motion.div
              className="w-[72px] h-[72px] rounded-full border-[3px] border-white/30 flex items-center justify-center"
              animate={
              allGood ?
              {
                borderColor: [
                'rgba(255,255,255,0.3)',
                'rgba(79,70,229,0.6)',
                'rgba(255,255,255,0.3)']

              } :
              {}
              }
              transition={
              allGood ?
              {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              } :
              {}
              }>
              
                <motion.div
                className="w-[58px] h-[58px] rounded-full bg-indigo-600"
                whileHover={{
                  scale: 1.05
                }}
                whileTap={{
                  scale: 0.92
                }}
                animate={
                allGood ?
                {
                  boxShadow: [
                  '0 0 0 0 rgba(79,70,229,0)',
                  '0 0 0 8px rgba(79,70,229,0.15)',
                  '0 0 0 0 rgba(79,70,229,0)']

                } :
                {}
                }
                transition={
                allGood ?
                {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                } :
                {}
                } />
              
              </motion.div>
            </button>

            {/* Flash toggle */}
            <button
            onClick={() => setFlashOn(!flashOn)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors border ${flashOn ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-white/8 border-white/10 text-gray-400 hover:bg-white/12'}`}
            aria-label={flashOn ? 'Turn off flash' : 'Turn on flash'}>
            
              {flashOn ?
            <ZapIcon className="w-5 h-5" /> :

            <ZapOffIcon className="w-5 h-5" />
            }
            </button>
          </motion.div>
        }
      </AnimatePresence>
    </motion.div>);

}