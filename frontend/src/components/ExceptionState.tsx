import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  UploadCloudIcon,
  CameraIcon,
  ArrowRightIcon,
  SendIcon,
  BanIcon,
  EyeIcon,
  ShieldAlertIcon,
  FileWarningIcon,
  ZapOffIcon,
  LockIcon,
  FileXIcon,
  FileQuestionIcon,
  PenToolIcon,
  ImageOffIcon,
  SunIcon,
  ScissorsIcon,
  CheckCircle2Icon } from
'lucide-react';
type IssueSeverity = 'recoverable' | 'partial' | 'unrecoverable';
interface DocumentIssue {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  severity: IssueSeverity;
  region?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}
const ISSUES: DocumentIssue[] = [
{
  id: 'i1',
  icon: ImageOffIcon,
  title: 'Blurred region detected',
  description:
  'The bottom-left area of the document is out of focus. Text in this region could not be reliably extracted.',
  severity: 'recoverable',
  region: {
    x: 5,
    y: 70,
    w: 40,
    h: 20
  }
},
{
  id: 'i2',
  icon: SunIcon,
  title: 'Glare on key fields',
  description:
  'Reflected light obscures the invoice total and tax fields. These values have very low confidence.',
  severity: 'recoverable',
  region: {
    x: 55,
    y: 65,
    w: 40,
    h: 15
  }
},
{
  id: 'i3',
  icon: ScissorsIcon,
  title: 'Partial capture',
  description:
  'The right edge of the document appears to be cut off. Some column data may be missing.',
  severity: 'partial',
  region: {
    x: 90,
    y: 10,
    w: 10,
    h: 80
  }
},
{
  id: 'i4',
  icon: PenToolIcon,
  title: 'Unreadable handwriting',
  description:
  'Handwritten annotations on page 2 could not be parsed. These regions have been flagged for manual review.',
  severity: 'partial'
}];

function severityConfig(s: IssueSeverity) {
  switch (s) {
    case 'recoverable':
      return {
        label: 'Recoverable',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-700',
        dot: 'bg-amber-400'
      };
    case 'partial':
      return {
        label: 'Partial',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        badge: 'bg-orange-100 text-orange-700',
        dot: 'bg-orange-400'
      };
    case 'unrecoverable':
      return {
        label: 'Unrecoverable',
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-600',
        badge: 'bg-red-100 text-red-600',
        dot: 'bg-red-500'
      };
  }
}
interface ExceptionStateProps {
  onBack: () => void;
  onRetake: () => void;
  onReupload: () => void;
}
export function ExceptionState({
  onBack,
  onRetake,
  onReupload
}: ExceptionStateProps) {
  const [hoveredIssue, setHoveredIssue] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const activeIssues = ISSUES.filter((i) => !dismissed.has(i.id));
  const recoverableCount = activeIssues.filter(
    (i) => i.severity === 'recoverable'
  ).length;
  const partialCount = activeIssues.filter(
    (i) => i.severity === 'partial'
  ).length;
  const hoveredRegion =
  ISSUES.find((i) => i.id === hoveredIssue)?.region || null;
  const overallSeverity: IssueSeverity = activeIssues.some(
    (i) => i.severity === 'unrecoverable'
  ) ?
  'unrecoverable' :
  activeIssues.some((i) => i.severity === 'partial') ?
  'partial' :
  'recoverable';
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
      className="w-full h-screen bg-[#FAFAFA] flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            
            <ArrowLeftIcon className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <ShieldAlertIcon className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">
                Processing Exception
              </h1>
              <p className="text-[11px] text-gray-500">
                corrupted_file.xyz · {activeIssues.length} issues detected
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(() => {
            const sc = severityConfig(overallSeverity);
            return (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${sc.badge}`}>
                
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                {overallSeverity === 'recoverable' ?
                'Most data recoverable' :
                overallSeverity === 'partial' ?
                'Partial extraction possible' :
                'Cannot process'}
              </span>);

          })()}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left — Document preview */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-100">
          <div className="flex-1 overflow-auto flex items-center justify-center p-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden w-full max-w-xl">
              <div className="aspect-[1/1.35] relative p-6">
                {/* Simulated problematic document */}
                <div className="w-full h-full flex flex-col opacity-60">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <div className="h-3 w-28 bg-gray-700 rounded mb-2" />
                      <div className="h-2 w-20 bg-gray-300 rounded" />
                    </div>
                    <div className="text-right">
                      <div className="h-2.5 w-16 bg-gray-600 rounded mb-1.5 ml-auto" />
                      <div className="h-2 w-24 bg-gray-300 rounded ml-auto" />
                    </div>
                  </div>
                  <div className="flex gap-6 mb-4">
                    <div className="flex-1 space-y-1.5">
                      <div className="h-1.5 w-10 bg-gray-400 rounded" />
                      <div className="h-2 w-28 bg-gray-300 rounded" />
                      <div className="h-2 w-24 bg-gray-300 rounded" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-1.5 w-8 bg-gray-400 rounded" />
                      <div className="h-2 w-24 bg-gray-300 rounded" />
                      <div className="h-2 w-28 bg-gray-300 rounded" />
                    </div>
                  </div>
                  <div className="flex gap-3 pb-2 border-b-2 border-gray-200 mb-1">
                    {[6, 36, 8, 14, 8, 14].map((w, i) =>
                    <div
                      key={i}
                      className="h-1.5 bg-gray-400 rounded"
                      style={{
                        width: `${w}%`
                      }} />

                    )}
                  </div>
                  {Array.from({
                    length: 10
                  }).map((_, i) =>
                  <div
                    key={i}
                    className="flex gap-3 py-1.5 border-b border-gray-50">
                    
                      <div className="h-1 w-[4%] bg-gray-200 rounded" />
                      <div
                      className="h-1 bg-gray-200 rounded"
                      style={{
                        width: `${18 + i * 3}%`
                      }} />
                    
                      <div className="h-1 w-[6%] bg-gray-200 rounded" />
                      <div className="h-1 w-[10%] bg-gray-200 rounded" />
                      <div className="h-1 w-[6%] bg-gray-200 rounded" />
                      <div className="h-1 w-[10%] bg-gray-200 rounded" />
                    </div>
                  )}
                  <div className="mt-auto flex justify-end">
                    <div className="w-40 space-y-1.5">
                      <div className="flex justify-between">
                        <div className="h-1.5 w-12 bg-gray-300 rounded" />
                        <div className="h-1.5 w-18 bg-gray-300 rounded" />
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-200">
                        <div className="h-2 w-10 bg-gray-600 rounded" />
                        <div className="h-2 w-20 bg-gray-600 rounded" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Problem region overlays */}
                {ISSUES.filter((i) => i.region).map((issue) => {
                  const isHovered = hoveredIssue === issue.id;
                  const isDismissed = dismissed.has(issue.id);
                  if (isDismissed) return null;
                  const sc = severityConfig(issue.severity);
                  return (
                    <motion.div
                      key={issue.id}
                      initial={{
                        opacity: 0
                      }}
                      animate={{
                        opacity: isHovered ? 1 : 0.5
                      }}
                      className="absolute rounded-lg border-2 border-dashed z-10 pointer-events-none transition-all"
                      style={{
                        left: `${issue.region!.x}%`,
                        top: `${issue.region!.y}%`,
                        width: `${issue.region!.w}%`,
                        height: `${issue.region!.h}%`,
                        borderColor:
                        issue.severity === 'recoverable' ?
                        'rgba(245, 158, 11, 0.6)' :
                        issue.severity === 'partial' ?
                        'rgba(249, 115, 22, 0.6)' :
                        'rgba(239, 68, 68, 0.6)',
                        backgroundColor: isHovered ?
                        issue.severity === 'recoverable' ?
                        'rgba(245, 158, 11, 0.1)' :
                        issue.severity === 'partial' ?
                        'rgba(249, 115, 22, 0.1)' :
                        'rgba(239, 68, 68, 0.1)' :
                        'transparent'
                      }}>
                      
                      {isHovered &&
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -4
                        }}
                        animate={{
                          opacity: 1,
                          y: 0
                        }}
                        className={`absolute -top-6 left-1 text-[8px] font-bold text-white px-2 py-0.5 rounded whitespace-nowrap ${issue.severity === 'recoverable' ? 'bg-amber-500' : issue.severity === 'partial' ? 'bg-orange-500' : 'bg-red-500'}`}>
                        
                          {issue.title}
                        </motion.div>
                      }
                    </motion.div>);

                })}

                {/* Diagonal warning stripe overlay */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.03]"
                  style={{
                    backgroundImage:
                    'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 21px)'
                  }} />
                
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-[400px] lg:w-[440px] flex-shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
          {/* Exception summary card */}
          <div className="p-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangleIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-amber-900">
                  Document has processing issues
                </h2>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  We found {activeIssues.length} issues that may affect
                  extraction quality.
                  {recoverableCount > 0 &&
                  ` ${recoverableCount} can be resolved by retaking the photo.`}
                  {partialCount > 0 &&
                  ` ${partialCount} allow partial extraction.`}
                </p>
              </div>
            </div>
          </div>

          {/* Issue list */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Detected Issues
            </p>
            <div className="space-y-2.5">
              <AnimatePresence>
                {activeIssues.map((issue, i) => {
                  const sc = severityConfig(issue.severity);
                  const IIcon = issue.icon;
                  return (
                    <motion.div
                      key={issue.id}
                      initial={{
                        opacity: 0,
                        y: 8
                      }}
                      animate={{
                        opacity: 1,
                        y: 0
                      }}
                      exit={{
                        opacity: 0,
                        x: -20,
                        height: 0
                      }}
                      transition={{
                        duration: 0.25,
                        delay: i * 0.05
                      }}
                      onMouseEnter={() => setHoveredIssue(issue.id)}
                      onMouseLeave={() => setHoveredIssue(null)}
                      className={`p-4 rounded-xl border transition-all ${sc.bg} ${sc.border} ${hoveredIssue === issue.id ? 'shadow-md ring-1 ring-opacity-20' : ''}`}
                      style={
                      hoveredIssue === issue.id ?
                      {
                        ringColor: sc.dot
                      } :
                      {}
                      }>
                      
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${sc.bg}`}>
                          
                          <IIcon className={`w-4 h-4 ${sc.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`text-xs font-semibold ${sc.text}`}>
                              {issue.title}
                            </p>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sc.badge}`}>
                              
                              {sc.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 leading-relaxed">
                            {issue.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>);

                })}
              </AnimatePresence>

              {activeIssues.length === 0 &&
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95
                }}
                animate={{
                  opacity: 1,
                  scale: 1
                }}
                className="text-center py-8">
                
                  <CheckCircle2Icon className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">
                    All issues resolved
                  </p>
                </motion.div>
              }
            </div>

            {/* Common causes */}
            <div className="mt-6">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Common Causes
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                {
                  icon: ImageOffIcon,
                  label: 'Blurred image'
                },
                {
                  icon: SunIcon,
                  label: 'Glare on fields'
                },
                {
                  icon: ScissorsIcon,
                  label: 'Partial capture'
                },
                {
                  icon: FileQuestionIcon,
                  label: 'Missing page'
                },
                {
                  icon: FileXIcon,
                  label: 'Unsupported layout'
                },
                {
                  icon: PenToolIcon,
                  label: 'Unreadable writing'
                },
                {
                  icon: LockIcon,
                  label: 'Encrypted PDF'
                },
                {
                  icon: ZapOffIcon,
                  label: 'Corrupted file'
                }].
                map((cause) =>
                <div
                  key={cause.label}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                  
                    <cause.icon className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] font-medium text-gray-500">
                      {cause.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-100 flex-shrink-0 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={onRetake}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                
                <CameraIcon className="w-3.5 h-3.5" />
                Retake Photo
              </button>
              <button
                onClick={onReupload}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                
                <UploadCloudIcon className="w-3.5 h-3.5" />
                Reupload File
              </button>
            </div>
            <button className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors">
              <ArrowRightIcon className="w-3.5 h-3.5" />
              Continue with Partial Extraction
            </button>
            <div className="flex gap-2">
              <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-gray-600 text-[11px] font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <SendIcon className="w-3 h-3" />
                Send for Manual Review
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-red-600 text-[11px] font-medium rounded-xl border border-red-200 hover:bg-red-50 transition-colors">
                <BanIcon className="w-3 h-3" />
                Mark Unsupported
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>);

}