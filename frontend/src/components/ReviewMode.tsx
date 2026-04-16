import React, { useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  XCircleIcon,
  PencilIcon,
  EyeOffIcon,
  SkipForwardIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListIcon,
  CrosshairIcon,
  FilterIcon,
  MessageSquareIcon,
  RefreshCwIcon,
  TagIcon,
  BanIcon,
  KeyboardIcon,
  CheckIcon,
  XIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  FileTextIcon } from
'lucide-react';
// Types
type FieldStatus =
'flagged' |
'accepted' |
'edited' |
'missing' |
'unreadable' |
'skipped';
type Severity =
'low-confidence' |
'validation-mismatch' |
'unreadable' |
'missing';
type ReviewViewMode = 'guided' | 'full';
type SortBy = 'severity' | 'confidence' | 'field-order';
interface ReviewField {
  id: string;
  label: string;
  extractedValue: string | null;
  correctedValue?: string;
  confidence: number;
  severity: Severity;
  status: FieldStatus;
  sourceRegion: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  note?: string;
}
// Sample flagged fields
const INITIAL_FIELDS: ReviewField[] = [
{
  id: 'f1',
  label: "Father's Name",
  extractedValue: 'MOHAN LAL SHRMA',
  confidence: 42,
  severity: 'low-confidence',
  status: 'flagged',
  sourceRegion: {
    x: 35,
    y: 52,
    w: 55,
    h: 7
  }
},
{
  id: 'f2',
  label: 'Date of Birth',
  extractedValue: '12/O5/1985',
  confidence: 58,
  severity: 'low-confidence',
  status: 'flagged',
  sourceRegion: {
    x: 35,
    y: 62,
    w: 30,
    h: 7
  }
},
{
  id: 'f3',
  label: 'Issue Date',
  extractedValue: '15/O3/2O18',
  confidence: 38,
  severity: 'low-confidence',
  status: 'flagged',
  sourceRegion: {
    x: 10,
    y: 88,
    w: 30,
    h: 6
  }
},
{
  id: 'f4',
  label: 'Address',
  extractedValue: null,
  confidence: 0,
  severity: 'missing',
  status: 'flagged',
  sourceRegion: {
    x: 10,
    y: 30,
    w: 80,
    h: 15
  }
},
{
  id: 'f5',
  label: 'GSTIN (Buyer)',
  extractedValue: '29AADCB223OM1ZP',
  confidence: 65,
  severity: 'validation-mismatch',
  status: 'flagged',
  sourceRegion: {
    x: 55,
    y: 20,
    w: 35,
    h: 4
  }
},
{
  id: 'f6',
  label: 'Line Item 4 Description',
  extractedValue: 'Dta Bckup Srvce — Prmium',
  confidence: 48,
  severity: 'low-confidence',
  status: 'flagged',
  sourceRegion: {
    x: 5,
    y: 55,
    w: 50,
    h: 4
  }
},
{
  id: 'f7',
  label: 'Signature Region',
  extractedValue: '[unreadable]',
  confidence: 15,
  severity: 'unreadable',
  status: 'flagged',
  sourceRegion: {
    x: 60,
    y: 85,
    w: 30,
    h: 10
  }
},
{
  id: 'f8',
  label: 'Tax Rate (Line 3)',
  extractedValue: '12%',
  confidence: 72,
  severity: 'validation-mismatch',
  status: 'flagged',
  sourceRegion: {
    x: 65,
    y: 48,
    w: 10,
    h: 4
  }
}];

// Helpers
function severityConfig(s: Severity) {
  switch (s) {
    case 'low-confidence':
      return {
        label: 'Low Confidence',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        icon: AlertTriangleIcon,
        iconColor: 'text-amber-500'
      };
    case 'validation-mismatch':
      return {
        label: 'Validation Mismatch',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        icon: XCircleIcon,
        iconColor: 'text-orange-500'
      };
    case 'unreadable':
      return {
        label: 'Unreadable',
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: EyeOffIcon,
        iconColor: 'text-red-500'
      };
    case 'missing':
      return {
        label: 'Missing',
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-600',
        icon: XCircleIcon,
        iconColor: 'text-red-500'
      };
  }
}
function statusConfig(s: FieldStatus) {
  switch (s) {
    case 'flagged':
      return {
        label: 'Needs Review',
        bg: 'bg-amber-100',
        text: 'text-amber-700'
      };
    case 'accepted':
      return {
        label: 'Accepted',
        bg: 'bg-emerald-100',
        text: 'text-emerald-700'
      };
    case 'edited':
      return {
        label: 'Corrected',
        bg: 'bg-indigo-100',
        text: 'text-indigo-700'
      };
    case 'missing':
      return {
        label: 'Marked Missing',
        bg: 'bg-gray-100',
        text: 'text-gray-600'
      };
    case 'unreadable':
      return {
        label: 'Unreadable',
        bg: 'bg-red-100',
        text: 'text-red-600'
      };
    case 'skipped':
      return {
        label: 'Skipped',
        bg: 'bg-gray-100',
        text: 'text-gray-500'
      };
  }
}
function confidenceColor(c: number) {
  if (c >= 80) return 'text-emerald-600';
  if (c >= 50) return 'text-amber-600';
  return 'text-red-600';
}
// Main component
interface ReviewModeProps {
  onBack: () => void;
  onComplete: () => void;
}
export function ReviewMode({ onBack, onComplete }: ReviewModeProps) {
  const [fields, setFields] = useState<ReviewField[]>(INITIAL_FIELDS);
  const [viewMode, setViewMode] = useState<ReviewViewMode>('guided');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editValue, setEditValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('severity');
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const flaggedFields = fields.filter((f) => f.status === 'flagged');
  const resolvedFields = fields.filter((f) => f.status !== 'flagged');
  const totalFlagged = INITIAL_FIELDS.length;
  const remaining = flaggedFields.length;
  const resolved = totalFlagged - remaining;
  const currentField =
  viewMode === 'guided' ? flaggedFields[currentIndex] || null : null;
  const filteredFields = (
  filterSeverity === 'all' ?
  fields :
  fields.filter((f) => f.severity === filterSeverity)).
  sort((a, b) => {
    if (sortBy === 'confidence') return a.confidence - b.confidence;
    if (sortBy === 'severity') {
      const order: Record<Severity, number> = {
        unreadable: 0,
        missing: 1,
        'validation-mismatch': 2,
        'low-confidence': 3
      };
      return order[a.severity] - order[b.severity];
    }
    return 0;
  });
  // Sync edit value when current field changes
  useEffect(() => {
    if (currentField) {
      setEditValue(
        currentField.correctedValue || currentField.extractedValue || ''
      );
      setIsEditing(false);
    }
  }, [currentField]);
  const updateField = useCallback(
    (id: string, updates: Partial<ReviewField>) => {
      setFields((prev) =>
      prev.map((f) =>
      f.id === id ?
      {
        ...f,
        ...updates
      } :
      f
      )
      );
    },
    []
  );
  const handleAccept = useCallback(() => {
    if (!currentField) return;
    updateField(currentField.id, {
      status: 'accepted'
    });
    advanceToNext();
  }, [currentField]);
  const handleEdit = useCallback(() => {
    if (!currentField) return;
    if (isEditing) {
      updateField(currentField.id, {
        status: 'edited',
        correctedValue: editValue
      });
      setIsEditing(false);
      advanceToNext();
    } else {
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [currentField, isEditing, editValue]);
  const handleMarkMissing = useCallback(() => {
    if (!currentField) return;
    updateField(currentField.id, {
      status: 'missing'
    });
    advanceToNext();
  }, [currentField]);
  const handleMarkUnreadable = useCallback(() => {
    if (!currentField) return;
    updateField(currentField.id, {
      status: 'unreadable'
    });
    advanceToNext();
  }, [currentField]);
  const handleSkip = useCallback(() => {
    if (!currentField) return;
    updateField(currentField.id, {
      status: 'skipped'
    });
    advanceToNext();
  }, [currentField]);
  const advanceToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextFlagged = fields.filter(
        (f, i) =>
        f.status === 'flagged' &&
        fields.indexOf(f) !== fields.indexOf(flaggedFields[prev])
      );
      if (nextFlagged.length <= 1) return 0;
      return Math.min(prev, nextFlagged.length - 1);
    });
  }, [fields, flaggedFields]);
  const handleAddNote = useCallback(() => {
    if (!currentField || !noteText.trim()) return;
    updateField(currentField.id, {
      note: noteText.trim()
    });
    setNoteText('');
    setShowNotes(false);
  }, [currentField, noteText]);
  // Full mode: click field to select
  const [selectedFullField, setSelectedFullField] = useState<string | null>(
    null
  );
  const activeRegion =
  viewMode === 'guided' ?
  currentField?.sourceRegion || null :
  fields.find((f) => f.id === selectedFullField)?.sourceRegion || null;
  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (viewMode !== 'guided' || isEditing) return;
      if (e.key === 'a') handleAccept();
      if (e.key === 'e') handleEdit();
      if (e.key === 's') handleSkip();
      if (e.key === 'm') handleMarkMissing();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
  viewMode,
  isEditing,
  handleAccept,
  handleEdit,
  handleSkip,
  handleMarkMissing]
  );
  const allResolved = remaining === 0;
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
      
      {/* Review header */}
      <div className="border-b border-gray-200 bg-white px-4 md:px-5 py-3 flex-shrink-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              
              <ArrowLeftIcon className="w-4 h-4 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-gray-900">
                  Review Required
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {remaining} remaining
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                pan_card_scan.jpg · PAN Card
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mode toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('guided')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${viewMode === 'guided' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                
                <CrosshairIcon className="w-3.5 h-3.5" />
                Guided
              </button>
              <button
                onClick={() => setViewMode('full')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${viewMode === 'full' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                
                <ListIcon className="w-3.5 h-3.5" />
                Full List
              </button>
            </div>
            {allResolved ?
            <button
              onClick={onComplete}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
              
                <CheckCircle2Icon className="w-3.5 h-3.5" />
                Complete Review
              </button> :

            <button
              onClick={onComplete}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              
                Save & Exit
              </button>
            }
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 text-[11px]">
            <span className="flex items-center gap-1.5">
              <AlertTriangleIcon className="w-3 h-3 text-amber-500" />
              <span className="text-gray-500">Low confidence:</span>
              <span className="font-bold text-gray-800">
                {
                fields.filter(
                  (f) =>
                  f.severity === 'low-confidence' && f.status === 'flagged'
                ).length
                }
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <XCircleIcon className="w-3 h-3 text-orange-500" />
              <span className="text-gray-500">Validation:</span>
              <span className="font-bold text-gray-800">
                {
                fields.filter(
                  (f) =>
                  f.severity === 'validation-mismatch' &&
                  f.status === 'flagged'
                ).length
                }
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <EyeOffIcon className="w-3 h-3 text-red-500" />
              <span className="text-gray-500">Unreadable:</span>
              <span className="font-bold text-gray-800">
                {
                fields.filter(
                  (f) =>
                  (f.severity === 'unreadable' ||
                  f.severity === 'missing') &&
                  f.status === 'flagged'
                ).length
                }
              </span>
            </span>
          </div>
          <div className="flex-1" />
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-gray-500">
              {resolved}/{totalFlagged} resolved
            </span>
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${allResolved ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                animate={{
                  width: `${resolved / totalFlagged * 100}%`
                }}
                transition={{
                  duration: 0.3
                }} />
              
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document preview */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-100">
          <div className="flex-1 overflow-auto flex items-center justify-center p-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden w-full max-w-2xl">
              <div className="aspect-[1/1.3] relative p-8">
                {/* Simulated document */}
                <div className="w-full h-full flex flex-col">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <div className="h-3.5 w-32 bg-gray-800 rounded mb-2" />
                      <div className="h-2 w-24 bg-gray-300 rounded mb-1" />
                      <div className="h-2 w-28 bg-gray-300 rounded" />
                    </div>
                    <div className="text-right">
                      <div className="h-2.5 w-20 bg-gray-700 rounded mb-1.5 ml-auto" />
                      <div className="h-2 w-28 bg-gray-300 rounded ml-auto" />
                    </div>
                  </div>
                  <div className="flex gap-6 mb-5">
                    <div className="flex-1 space-y-1.5">
                      <div className="h-1.5 w-10 bg-gray-400 rounded" />
                      <div className="h-2 w-32 bg-gray-300 rounded" />
                      <div className="h-2 w-28 bg-gray-300 rounded" />
                      <div className="h-2 w-24 bg-gray-300 rounded" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-1.5 w-8 bg-gray-400 rounded" />
                      <div className="h-2 w-28 bg-gray-300 rounded" />
                      <div className="h-2 w-32 bg-gray-300 rounded" />
                    </div>
                  </div>
                  <div className="flex gap-3 pb-2 border-b-2 border-gray-300 mb-1">
                    {[6, 40, 8, 16, 8, 16].map((w, i) =>
                    <div
                      key={i}
                      className="h-2 bg-gray-500 rounded"
                      style={{
                        width: `${w}%`
                      }} />

                    )}
                  </div>
                  {Array.from({
                    length: 8
                  }).map((_, i) =>
                  <div
                    key={i}
                    className="flex gap-3 py-2 border-b border-gray-50">
                    
                      <div className="h-1.5 w-[4%] bg-gray-200 rounded" />
                      <div
                      className="h-1.5 bg-gray-200 rounded"
                      style={{
                        width: `${20 + i * 4}%`
                      }} />
                    
                      <div className="h-1.5 w-[6%] bg-gray-200 rounded" />
                      <div className="h-1.5 w-[12%] bg-gray-200 rounded" />
                      <div className="h-1.5 w-[6%] bg-gray-200 rounded" />
                      <div className="h-1.5 w-[12%] bg-gray-200 rounded" />
                    </div>
                  )}
                  <div className="mt-auto flex justify-end">
                    <div className="w-44 space-y-1.5">
                      <div className="flex justify-between">
                        <div className="h-2 w-14 bg-gray-300 rounded" />
                        <div className="h-2 w-20 bg-gray-300 rounded" />
                      </div>
                      <div className="flex justify-between">
                        <div className="h-2 w-10 bg-gray-300 rounded" />
                        <div className="h-2 w-16 bg-gray-300 rounded" />
                      </div>
                      <div className="flex justify-between pt-1.5 border-t-2 border-gray-300">
                        <div className="h-2.5 w-12 bg-gray-700 rounded" />
                        <div className="h-2.5 w-24 bg-gray-700 rounded" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-end">
                    <div className="space-y-1">
                      <div className="h-2 w-24 bg-gray-300 rounded" />
                      <div className="h-2 w-36 bg-gray-300 rounded" />
                    </div>
                    <div className="w-16 h-10 border border-gray-200 rounded flex items-center justify-center">
                      <div className="w-10 h-5 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>

                {/* Source highlight */}
                <AnimatePresence>
                  {activeRegion &&
                  <motion.div
                    key={
                    viewMode === 'guided' ?
                    currentField?.id :
                    selectedFullField
                    }
                    initial={{
                      opacity: 0,
                      scale: 0.94
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1
                    }}
                    exit={{
                      opacity: 0
                    }}
                    transition={{
                      duration: 0.25
                    }}
                    className="absolute rounded-lg border-2 z-10 pointer-events-none"
                    style={{
                      left: `${activeRegion.x}%`,
                      top: `${activeRegion.y}%`,
                      width: `${activeRegion.w}%`,
                      height: `${activeRegion.h}%`,
                      borderColor: 'rgba(245, 158, 11, 0.7)',
                      backgroundColor: 'rgba(245, 158, 11, 0.08)',
                      boxShadow:
                      '0 0 0 4px rgba(245, 158, 11, 0.12), 0 0 20px rgba(245, 158, 11, 0.1)'
                    }}>
                    
                      <motion.div
                      initial={{
                        opacity: 0,
                        y: -4
                      }}
                      animate={{
                        opacity: 1,
                        y: 0
                      }}
                      className="absolute -top-6 left-1 text-[9px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded whitespace-nowrap">
                      
                        {viewMode === 'guided' ?
                      currentField?.label :
                      fields.find((f) => f.id === selectedFullField)?.
                      label}
                      </motion.div>
                    </motion.div>
                  }
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-[380px] lg:w-[420px] flex-shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {viewMode === 'guided' ?
            <motion.div
              key="guided"
              initial={{
                opacity: 0,
                x: 8
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              exit={{
                opacity: 0,
                x: -8
              }}
              transition={{
                duration: 0.2
              }}
              className="flex flex-col h-full">
              
                {currentField ?
              <>
                    {/* Field navigation */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <button
                      onClick={() =>
                      setCurrentIndex(Math.max(0, currentIndex - 1))
                      }
                      disabled={currentIndex === 0}
                      className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-all">
                      
                          <ChevronLeftIcon className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <span className="text-xs font-medium text-gray-600 tabular-nums">
                          {currentIndex + 1} of {flaggedFields.length} flagged
                        </span>
                        <button
                      onClick={() =>
                      setCurrentIndex(
                        Math.min(
                          flaggedFields.length - 1,
                          currentIndex + 1
                        )
                      )
                      }
                      disabled={currentIndex >= flaggedFields.length - 1}
                      className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-all">
                      
                          <ChevronRightIcon className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <KeyboardIcon className="w-3 h-3 text-gray-400" />
                        <span className="text-[9px] text-gray-400">
                          A=Accept E=Edit S=Skip M=Missing
                        </span>
                      </div>
                    </div>

                    {/* Current field card */}
                    <div className="flex-1 overflow-y-auto p-4">
                      <AnimatePresence mode="wait">
                        <motion.div
                      key={currentField.id}
                      initial={{
                        opacity: 0,
                        y: 12
                      }}
                      animate={{
                        opacity: 1,
                        y: 0
                      }}
                      exit={{
                        opacity: 0,
                        y: -12
                      }}
                      transition={{
                        duration: 0.2
                      }}>
                      
                          {/* Severity badge */}
                          {(() => {
                        const sc = severityConfig(currentField.severity);
                        const SIcon = sc.icon;
                        return (
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${sc.bg} ${sc.border} border mb-4`}>
                            
                                <SIcon
                              className={`w-3.5 h-3.5 ${sc.iconColor}`} />
                            
                                <span
                              className={`text-[11px] font-semibold ${sc.text}`}>
                              
                                  {sc.label}
                                </span>
                              </div>);

                      })()}

                          {/* Field label */}
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {currentField.label}
                          </h3>
                          <div className="flex items-center gap-2 mb-5">
                            <span
                          className={`text-xs font-bold ${confidenceColor(currentField.confidence)}`}>
                          
                              {currentField.confidence}% confidence
                            </span>
                          </div>

                          {/* Extracted value */}
                          <div className="mb-4">
                            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                              Extracted Value
                            </label>
                            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                              <p
                            className={`text-sm font-mono ${currentField.extractedValue ? 'text-gray-900' : 'text-red-400 italic'}`}>
                            
                                {currentField.extractedValue || 'Not detected'}
                              </p>
                            </div>
                          </div>

                          {/* Editable input */}
                          <div className="mb-5">
                            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                              Corrected Value
                            </label>
                            <div className="relative">
                              <input
                            ref={inputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            disabled={!isEditing}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEdit();
                              if (e.key === 'Escape') setIsEditing(false);
                            }}
                            className={`w-full px-3 py-2.5 text-sm font-mono rounded-lg border transition-all ${isEditing ? 'border-indigo-300 ring-2 ring-indigo-100 bg-white' : 'border-gray-200 bg-gray-50'}`}
                            placeholder="Enter corrected value..." />
                          
                              {isEditing &&
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                  <button
                              onClick={handleEdit}
                              className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-700">
                              
                                    <CheckIcon className="w-3 h-3" />
                                  </button>
                                  <button
                              onClick={() => setIsEditing(false)}
                              className="p-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300">
                              
                                    <XIcon className="w-3 h-3" />
                                  </button>
                                </div>
                          }
                            </div>
                          </div>

                          {/* Note */}
                          {currentField.note &&
                      <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                              <div className="flex items-center gap-1.5 mb-1">
                                <MessageSquareIcon className="w-3 h-3 text-blue-500" />
                                <span className="text-[10px] font-semibold text-blue-700">
                                  Reviewer Note
                                </span>
                              </div>
                              <p className="text-xs text-blue-800">
                                {currentField.note}
                              </p>
                            </div>
                      }

                          {/* Add note */}
                          {showNotes ?
                      <div className="mb-4">
                              <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add a note for this field..."
                          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                          rows={2} />
                        
                              <div className="flex gap-2 mt-2">
                                <button
                            onClick={handleAddNote}
                            className="px-3 py-1 text-[11px] font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                            
                                  Save Note
                                </button>
                                <button
                            onClick={() => {
                              setShowNotes(false);
                              setNoteText('');
                            }}
                            className="px-3 py-1 text-[11px] font-medium text-gray-500 hover:text-gray-700">
                            
                                  Cancel
                                </button>
                              </div>
                            </div> :

                      <button
                        onClick={() => setShowNotes(true)}
                        className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-4">
                        
                              <MessageSquareIcon className="w-3 h-3" />
                              Add note
                            </button>
                      }
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Action buttons */}
                    <div className="p-4 border-t border-gray-100 flex-shrink-0 space-y-2">
                      <div className="flex gap-2">
                        <button
                      onClick={handleAccept}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                      
                          <CheckCircle2Icon className="w-3.5 h-3.5" />
                          Accept
                        </button>
                        <button
                      onClick={handleEdit}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                      
                          <PencilIcon className="w-3.5 h-3.5" />
                          {isEditing ? 'Save Edit' : 'Edit'}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                      onClick={handleMarkMissing}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-gray-600 text-[11px] font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      
                          <XCircleIcon className="w-3 h-3" />
                          Mark Missing
                        </button>
                        <button
                      onClick={handleMarkUnreadable}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-gray-600 text-[11px] font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      
                          <EyeOffIcon className="w-3 h-3" />
                          Unreadable
                        </button>
                        <button
                      onClick={handleSkip}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-gray-500 text-[11px] font-medium rounded-lg hover:bg-gray-50 transition-colors">
                      
                          <SkipForwardIcon className="w-3 h-3" />
                          Skip
                        </button>
                      </div>
                    </div>
                  </> /* All resolved */ :

              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
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
                  className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  
                      <CheckCircle2Icon className="w-8 h-8 text-emerald-600" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      All Fields Reviewed
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      {resolved} fields resolved
                    </p>
                    <button
                  onClick={onComplete}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                  
                      <CheckCircle2Icon className="w-4 h-4" />
                      Complete Review
                    </button>
                  </div>
              }
              </motion.div> /* Full list mode */ :

            <motion.div
              key="full"
              initial={{
                opacity: 0,
                x: 8
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              exit={{
                opacity: 0,
                x: -8
              }}
              transition={{
                duration: 0.2
              }}
              className="flex flex-col h-full">
              
                {/* Filters */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <FilterIcon className="w-3.5 h-3.5 text-gray-400" />
                    <select
                    value={filterSeverity}
                    onChange={(e) =>
                    setFilterSeverity(e.target.value as Severity | 'all')
                    }
                    className="text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md px-2 py-1 focus:outline-none">
                    
                      <option value="all">All types</option>
                      <option value="low-confidence">Low confidence</option>
                      <option value="validation-mismatch">Validation</option>
                      <option value="unreadable">Unreadable</option>
                      <option value="missing">Missing</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400">Sort:</span>
                    <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md px-2 py-1 focus:outline-none">
                    
                      <option value="severity">Severity</option>
                      <option value="confidence">Confidence</option>
                      <option value="field-order">Field order</option>
                    </select>
                  </div>
                </div>

                {/* Field list */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                  {filteredFields.map((field) => {
                  const sc = severityConfig(field.severity);
                  const stc = statusConfig(field.status);
                  const SIcon = sc.icon;
                  const isSelected = selectedFullField === field.id;
                  const isResolved = field.status !== 'flagged';
                  return (
                    <motion.button
                      key={field.id}
                      layout
                      onClick={() =>
                      setSelectedFullField(isSelected ? null : field.id)
                      }
                      className={`w-full text-left p-3 rounded-xl border transition-all ${isSelected ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-100' : isResolved ? 'bg-gray-50/50 border-gray-100 opacity-60' : `${sc.bg} ${sc.border}`} hover:shadow-sm`}>
                      
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 min-w-0">
                            <SIcon
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isResolved ? 'text-gray-400' : sc.iconColor}`} />
                          
                            <div className="min-w-0">
                              <p
                              className={`text-xs font-semibold ${isResolved ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                              
                                {field.label}
                              </p>
                              <p
                              className={`text-[11px] font-mono mt-0.5 truncate ${field.extractedValue ? 'text-gray-600' : 'text-red-400 italic'}`}>
                              
                                {field.correctedValue ||
                              field.extractedValue ||
                              'Not detected'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span
                            className={`text-[9px] font-bold ${confidenceColor(field.confidence)}`}>
                            
                              {field.confidence}%
                            </span>
                            <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${stc.bg} ${stc.text}`}>
                            
                              {stc.label}
                            </span>
                          </div>
                        </div>
                      </motion.button>);

                })}
                </div>

                {/* Reviewer tools */}
                <div className="p-3 border-t border-gray-100 flex-shrink-0 space-y-1.5">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <RefreshCwIcon className="w-3.5 h-3.5" />
                    Request Reprocessing
                  </button>
                  <div className="flex gap-1.5">
                    <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <TagIcon className="w-3.5 h-3.5" />
                      Reclassify
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium text-red-600 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
                      <BanIcon className="w-3.5 h-3.5" />
                      Unsupported
                    </button>
                  </div>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>
    </motion.div>);

}