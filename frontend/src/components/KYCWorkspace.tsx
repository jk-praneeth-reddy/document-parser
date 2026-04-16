import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  RotateCwIcon,
  RefreshCwIcon,
  EyeOffIcon,
  ZoomInIcon,
  ZoomOutIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  XCircleIcon,
  PencilIcon,
  LinkIcon,
  ChevronRightIcon,
  DownloadIcon,
  CreditCardIcon,
  UserIcon,
  ShieldCheckIcon,
  ScanFaceIcon,
  CopyIcon,
  CameraIcon } from
'lucide-react';
// Types
type Confidence = 'high' | 'medium' | 'low' | 'missing';
type DocSide = 'front' | 'back';
type VerificationStatus = 'passed' | 'warning' | 'failed' | 'pending';
interface KYCField {
  id: string;
  label: string;
  value: string | null;
  confidence: Confidence;
  required: boolean;
  side: DocSide;
  sourceRegion?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}
interface VerificationCheck {
  id: string;
  label: string;
  status: VerificationStatus;
  detail: string;
}
interface PageThumb {
  id: DocSide;
  label: string;
  status: 'verified' | 'review' | 'pending';
}
// Data — PAN Card
const PAGES: PageThumb[] = [
{
  id: 'front',
  label: 'Front',
  status: 'verified'
},
{
  id: 'back',
  label: 'Back',
  status: 'review'
}];

const IDENTITY_FIELDS: KYCField[] = [
{
  id: 'doc-type',
  label: 'Document Type',
  value: 'PAN Card',
  confidence: 'high',
  required: true,
  side: 'front',
  sourceRegion: {
    x: 10,
    y: 6,
    w: 45,
    h: 8
  }
},
{
  id: 'full-name',
  label: 'Full Name',
  value: 'RAJESH KUMAR SHARMA',
  confidence: 'high',
  required: true,
  side: 'front',
  sourceRegion: {
    x: 35,
    y: 42,
    w: 55,
    h: 7
  }
},
{
  id: 'father-name',
  label: "Father's Name",
  value: 'MOHAN LAL SHARMA',
  confidence: 'medium',
  required: true,
  side: 'front',
  sourceRegion: {
    x: 35,
    y: 52,
    w: 55,
    h: 7
  }
},
{
  id: 'dob',
  label: 'Date of Birth',
  value: '12/05/1985',
  confidence: 'high',
  required: true,
  side: 'front',
  sourceRegion: {
    x: 35,
    y: 62,
    w: 30,
    h: 7
  }
},
{
  id: 'gender',
  label: 'Gender',
  value: 'Male',
  confidence: 'high',
  required: false,
  side: 'front'
},
{
  id: 'pan-number',
  label: 'PAN Number',
  value: 'ABCPS1234F',
  confidence: 'high',
  required: true,
  side: 'front',
  sourceRegion: {
    x: 20,
    y: 75,
    w: 50,
    h: 10
  }
},
{
  id: 'address',
  label: 'Address',
  value: null,
  confidence: 'missing',
  required: false,
  side: 'back'
},
{
  id: 'issue-date',
  label: 'Issue Date',
  value: '15/03/2018',
  confidence: 'low',
  required: false,
  side: 'front',
  sourceRegion: {
    x: 10,
    y: 88,
    w: 30,
    h: 6
  }
},
{
  id: 'expiry-date',
  label: 'Expiry Date',
  value: 'N/A (Lifetime validity)',
  confidence: 'high',
  required: false,
  side: 'front'
}];

const VERIFICATION_CHECKS: VerificationCheck[] = [
{
  id: 'v1',
  label: 'Front & back paired',
  status: 'passed',
  detail: 'Both sides detected and linked'
},
{
  id: 'v2',
  label: 'PAN format valid',
  status: 'passed',
  detail: 'ABCPS1234F matches AAAAA9999A pattern'
},
{
  id: 'v3',
  label: 'Face region detected',
  status: 'passed',
  detail: 'Photo region identified on front side'
},
{
  id: 'v4',
  label: "Father's name confidence",
  status: 'warning',
  detail: 'OCR confidence 76% — manual review suggested'
},
{
  id: 'v5',
  label: 'Issue date legibility',
  status: 'warning',
  detail: 'Date partially obscured, low confidence extraction'
},
{
  id: 'v6',
  label: 'Signature region detected',
  status: 'passed',
  detail: 'Signature area identified on front side'
}];

// Helpers
function confidenceConfig(c: Confidence) {
  switch (c) {
    case 'high':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-700',
        label: '97%',
        icon: CheckCircle2Icon
      };
    case 'medium':
      return {
        bg: 'bg-amber-50/60',
        text: 'text-amber-700',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-700',
        label: '76%',
        icon: AlertTriangleIcon
      };
    case 'low':
      return {
        bg: 'bg-red-50/60',
        text: 'text-red-600',
        border: 'border-red-200',
        badge: 'bg-red-100 text-red-600',
        label: '38%',
        icon: AlertTriangleIcon
      };
    case 'missing':
      return {
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-300',
        badge: 'bg-red-100 text-red-600',
        label: 'Missing',
        icon: XCircleIcon
      };
  }
}
function verificationConfig(s: VerificationStatus) {
  switch (s) {
    case 'passed':
      return {
        icon: CheckCircle2Icon,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        textColor: 'text-emerald-800'
      };
    case 'warning':
      return {
        icon: AlertTriangleIcon,
        color: 'text-amber-500',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        textColor: 'text-amber-800'
      };
    case 'failed':
      return {
        icon: XCircleIcon,
        color: 'text-red-500',
        bg: 'bg-red-50',
        border: 'border-red-100',
        textColor: 'text-red-800'
      };
    case 'pending':
      return {
        icon: AlertTriangleIcon,
        color: 'text-gray-400',
        bg: 'bg-gray-50',
        border: 'border-gray-100',
        textColor: 'text-gray-600'
      };
  }
}
// Sub-components
function KYCFieldCard({
  field,
  isActive,
  onSelect




}: {field: KYCField;isActive: boolean;onSelect: (id: string) => void;}) {
  const config = confidenceConfig(field.confidence);
  const ConfIcon = config.icon;
  return (
    <motion.button
      onClick={() => onSelect(field.id)}
      className={`w-full text-left p-3.5 rounded-xl border transition-all ${isActive ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-100' : `${config.bg} ${config.border} hover:shadow-sm`}`}
      whileTap={{
        scale: 0.995
      }}>
      
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              {field.label}
            </span>
            {field.required &&
            <span className="text-[9px] text-red-400 font-bold">*</span>
            }
            <span className="text-[9px] text-gray-300 font-medium uppercase">
              {field.side}
            </span>
          </div>
          {field.value ?
          <p className="text-sm font-bold text-gray-900 tracking-wide">
              {field.value}
            </p> :

          <p className="text-sm italic text-red-400">Not found on document</p>
          }
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${config.badge}`}>
            
            {config.label}
          </span>
          {field.sourceRegion &&
          <LinkIcon
            className={`w-3 h-3 ${isActive ? 'text-indigo-500' : 'text-gray-300'}`} />

          }
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="p-1 rounded hover:bg-white/80 transition-colors"
            aria-label={`Edit ${field.label}`}>
            
            <PencilIcon className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </div>
    </motion.button>);

}
function CollapsibleSection({
  title,
  icon: Icon,
  count,
  defaultOpen,
  children






}: {title: string;icon: React.ElementType;count?: number;defaultOpen?: boolean;children: React.ReactNode;}) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
        
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              rotate: open ? 90 : 0
            }}
            transition={{
              duration: 0.15
            }}>
            
            <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400" />
          </motion.div>
          <Icon className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider">
            {title}
          </span>
          {count !== undefined &&
          <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              {count}
            </span>
          }
        </div>
      </button>
      <AnimatePresence>
        {open &&
        <motion.div
          initial={{
            height: 0,
            opacity: 0
          }}
          animate={{
            height: 'auto',
            opacity: 1
          }}
          exit={{
            height: 0,
            opacity: 0
          }}
          transition={{
            duration: 0.2
          }}
          className="overflow-hidden">
          
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}
// PAN Card front preview
function PANCardFront({
  activeRegion,
  selectedField,
  fields




}: {activeRegion: KYCField['sourceRegion'] | null;selectedField: string | null;fields: KYCField[];}) {
  return (
    <div
      className="w-full aspect-[1.6/1] rounded-xl overflow-hidden relative"
      style={{
        background:
        'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
      }}>
      
      {/* PAN Card layout */}
      <div className="absolute inset-0 p-5 flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-500/30 border border-amber-400/50 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-amber-400/60" />
            </div>
            <div>
              <div className="text-[8px] font-bold tracking-[0.2em] text-amber-300/80 uppercase">
                Income Tax Department
              </div>
              <div className="text-[7px] text-gray-400 tracking-wider">
                Govt. of India
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-bold tracking-[0.15em] text-amber-300">
              PERMANENT ACCOUNT NUMBER
            </div>
            <div className="text-[7px] text-gray-400">आयकर विभाग</div>
          </div>
        </div>

        {/* Photo + Details */}
        <div className="flex gap-4 mt-3 flex-1">
          {/* Photo */}
          <div className="w-20 h-24 rounded-lg bg-gray-600/40 border border-gray-500/30 flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-8 h-8 text-gray-400/60" />
          </div>

          {/* Fields */}
          <div className="flex-1 flex flex-col justify-center space-y-2">
            <div>
              <div className="text-[7px] text-gray-400 uppercase tracking-wider">
                Name / नाम
              </div>
              <div className="text-[11px] font-bold tracking-wide text-white/90">
                RAJESH KUMAR SHARMA
              </div>
            </div>
            <div>
              <div className="text-[7px] text-gray-400 uppercase tracking-wider">
                Father's Name / पिता का नाम
              </div>
              <div className="text-[11px] font-bold tracking-wide text-white/80">
                MOHAN LAL SHARMA
              </div>
            </div>
            <div>
              <div className="text-[7px] text-gray-400 uppercase tracking-wider">
                Date of Birth / जन्म तिथि
              </div>
              <div className="text-[11px] font-bold tracking-wide text-white/90">
                12/05/1985
              </div>
            </div>
          </div>
        </div>

        {/* PAN Number */}
        <div className="mt-2 flex items-end justify-between">
          <div>
            <div className="text-[18px] font-black tracking-[0.25em] text-amber-300">
              ABCPS1234F
            </div>
          </div>
          <div className="w-14 h-8 rounded bg-gray-600/30 border border-gray-500/20 flex items-center justify-center">
            <div className="text-[6px] text-gray-500 text-center leading-tight">
              Signature /<br />
              हस्ताक्षर
            </div>
          </div>
        </div>
        <div className="text-[7px] text-gray-500 mt-1">
          Date of Issue: 15/03/2018
        </div>
      </div>

      {/* Source highlight overlay */}
      <AnimatePresence>
        {activeRegion &&
        <motion.div
          key={selectedField}
          initial={{
            opacity: 0,
            scale: 0.96
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          exit={{
            opacity: 0
          }}
          transition={{
            duration: 0.2
          }}
          className="absolute rounded-md border-2 border-indigo-400 z-10 pointer-events-none"
          style={{
            left: `${activeRegion.x}%`,
            top: `${activeRegion.y}%`,
            width: `${activeRegion.w}%`,
            height: `${activeRegion.h}%`,
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            boxShadow:
            '0 0 0 3px rgba(99, 102, 241, 0.1), 0 0 16px rgba(99, 102, 241, 0.15)'
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
            className="absolute -top-5 left-0 text-[8px] font-bold text-white bg-indigo-500 px-1.5 py-0.5 rounded whitespace-nowrap">
            
              {fields.find((f) => f.id === selectedField)?.label}
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}
// PAN Card back preview
function PANCardBack() {
  return (
    <div
      className="w-full aspect-[1.6/1] rounded-xl overflow-hidden relative"
      style={{
        background:
        'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
      }}>
      
      <div className="absolute inset-0 p-5 flex flex-col text-white">
        <div className="text-[8px] font-bold tracking-[0.15em] text-amber-300/80 uppercase mb-3">
          Permanent Account Number Card
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-3">
          <div>
            <div className="text-[7px] text-gray-400 uppercase tracking-wider mb-1">
              Address / पता
            </div>
            <div className="space-y-0.5">
              <div className="h-1.5 w-3/4 bg-gray-600/40 rounded" />
              <div className="h-1.5 w-2/3 bg-gray-600/40 rounded" />
              <div className="h-1.5 w-1/2 bg-gray-600/40 rounded" />
            </div>
            <div className="mt-1 text-[8px] text-amber-400/60 italic">
              Address not clearly legible
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* QR Code placeholder */}
            <div className="w-16 h-16 rounded-md bg-gray-600/30 border border-gray-500/20 flex items-center justify-center">
              <div className="grid grid-cols-4 gap-0.5 w-10 h-10">
                {Array.from({
                  length: 16
                }).map((_, i) =>
                <div
                  key={i}
                  className={`rounded-sm ${Math.random() > 0.4 ? 'bg-gray-400/40' : 'bg-transparent'}`} />

                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[7px] text-gray-400 uppercase tracking-wider">
                Helpline
              </div>
              <div className="text-[9px] text-gray-300">1800-180-1961</div>
              <div className="text-[7px] text-gray-500 mt-1">
                www.incometax.gov.in
              </div>
            </div>
          </div>
        </div>

        <div className="text-[6px] text-gray-600 text-center">
          This card is the property of Income Tax Department, Govt. of India
        </div>
      </div>
    </div>);

}
// Face detection placeholder
function FaceDetectionPanel() {
  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <ScanFaceIcon className="w-4 h-4 text-indigo-500" />
        <span className="text-xs font-semibold text-gray-800">
          Face Detection
        </span>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
          Detected
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-16 h-20 rounded-lg bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
          <UserIcon className="w-6 h-6 text-gray-400" />
          <div className="absolute inset-0 border-2 border-emerald-400 rounded-lg" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs text-gray-600">
              Face region identified
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs text-gray-600">
              Quality sufficient for matching
            </span>
          </div>
          <button className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors mt-1">
            <CameraIcon className="w-3 h-3" />
            Upload selfie for face match
          </button>
        </div>
      </div>
    </div>);

}
// Main component
interface KYCWorkspaceProps {
  onBack: () => void;
}
export function KYCWorkspace({ onBack }: KYCWorkspaceProps) {
  const [selectedField, setSelectedField] = useState<string | null>(
    'pan-number'
  );
  const [activeSide, setActiveSide] = useState<DocSide>('front');
  const [zoom, setZoom] = useState(100);
  const activeField = IDENTITY_FIELDS.find((f) => f.id === selectedField);
  const activeRegion =
  activeField?.side === activeSide ? activeField?.sourceRegion || null : null;
  const handleFieldSelect = useCallback((id: string) => {
    setSelectedField((prev) => prev === id ? null : id);
    const field = IDENTITY_FIELDS.find((f) => f.id === id);
    if (field?.sourceRegion) {
      setActiveSide(field.side);
    }
  }, []);
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
      
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white px-4 md:px-5 py-2.5 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Back to queue">
            
            <ArrowLeftIcon className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
              <CreditCardIcon className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">
                pan_card_scan.jpg
              </h1>
              <p className="text-[11px] text-gray-500">
                PAN Card · Front & Back · 89% confidence
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <CopyIcon className="w-3.5 h-3.5" />
            Copy JSON
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <DownloadIcon className="w-3.5 h-3.5" />
            Export
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <CheckCircle2Icon className="w-3.5 h-3.5" />
            Verify & Approve
          </button>
        </div>
      </div>

      {/* 3-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL — Document navigator */}
        <div className="w-[180px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Document
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Front & Back linked
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {PAGES.map((page) =>
            <button
              key={page.id}
              onClick={() => setActiveSide(page.id)}
              className={`w-full rounded-xl border overflow-hidden transition-all ${activeSide === page.id ? 'border-indigo-300 ring-2 ring-indigo-100 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
              
                <div className="aspect-[1.6/1] bg-gradient-to-br from-gray-800 to-gray-900 relative p-2">
                  {/* Mini card preview */}
                  <div className="w-full h-full rounded bg-gray-700/50 flex items-center justify-center">
                    <CreditCardIcon className="w-5 h-5 text-gray-500" />
                  </div>
                  {/* Status */}
                  <div
                  className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${page.status === 'verified' ? 'bg-emerald-400' : page.status === 'review' ? 'bg-amber-400' : 'bg-gray-400'}`} />
                
                </div>
                <div className="px-2 py-1.5 text-center border-t border-gray-100 bg-white">
                  <span
                  className={`text-[10px] font-semibold ${activeSide === page.id ? 'text-indigo-700' : 'text-gray-600'}`}>
                  
                    {page.label}
                  </span>
                  <span
                  className={`block text-[9px] ${page.status === 'verified' ? 'text-emerald-600' : page.status === 'review' ? 'text-amber-600' : 'text-gray-400'}`}>
                  
                    {page.status === 'verified' ?
                  'Verified' :
                  page.status === 'review' ?
                  'Needs Review' :
                  'Pending'}
                  </span>
                </div>
              </button>
            )}

            {/* Linked indicator */}
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                <LinkIcon className="w-3 h-3 text-indigo-500" />
                <span className="text-[9px] font-semibold text-indigo-600">
                  Linked pair
                </span>
              </div>
            </div>
          </div>

          {/* Tools */}
          <div className="p-3 border-t border-gray-100 space-y-1">
            {[
            {
              icon: RotateCwIcon,
              label: 'Rotate'
            },
            {
              icon: RefreshCwIcon,
              label: 'Reclassify'
            },
            {
              icon: EyeOffIcon,
              label: 'Mark Unreadable'
            }].
            map((tool) =>
            <button
              key={tool.label}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-medium text-gray-500 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors">
              
                <tool.icon className="w-3.5 h-3.5" />
                {tool.label}
              </button>
            )}
          </div>
        </div>

        {/* CENTER PANEL — ID Preview */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-100">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700 capitalize">
                {activeSide} Side
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${activeSide === 'front' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                
                {activeSide === 'front' ? 'Verified' : 'Needs Review'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 25))}
                className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                
                <ZoomOutIcon className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <span className="text-[11px] font-medium text-gray-500 tabular-nums min-w-[36px] text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                
                <ZoomInIcon className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Preview area */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSide}
                initial={{
                  opacity: 0,
                  scale: 0.97
                }}
                animate={{
                  opacity: 1,
                  scale: 1
                }}
                exit={{
                  opacity: 0,
                  scale: 0.97
                }}
                transition={{
                  duration: 0.25
                }}
                className="w-full max-w-lg"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'center'
                }}>
                
                <div className="shadow-xl rounded-xl overflow-hidden">
                  {activeSide === 'front' ?
                  <PANCardFront
                    activeRegion={activeRegion}
                    selectedField={selectedField}
                    fields={IDENTITY_FIELDS} /> :


                  <PANCardBack />
                  }
                </div>

                {/* Side toggle */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  {PAGES.map((page) =>
                  <button
                    key={page.id}
                    onClick={() => setActiveSide(page.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${activeSide === page.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    
                      {page.label}
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT PANEL — Extracted KYC data */}
        <div className="w-[340px] lg:w-[380px] flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
          {/* Identity Details */}
          <CollapsibleSection
            title="Identity Details"
            icon={UserIcon}
            count={IDENTITY_FIELDS.length}
            defaultOpen>
            
            <div className="space-y-2">
              {IDENTITY_FIELDS.map((field) =>
              <KYCFieldCard
                key={field.id}
                field={field}
                isActive={selectedField === field.id}
                onSelect={handleFieldSelect} />

              )}
            </div>
          </CollapsibleSection>

          {/* Face Detection */}
          <CollapsibleSection
            title="Biometric Detection"
            icon={ScanFaceIcon}
            defaultOpen>
            
            <FaceDetectionPanel />
          </CollapsibleSection>

          {/* Verification Checks */}
          <CollapsibleSection
            title="Verification Checks"
            icon={ShieldCheckIcon}
            count={VERIFICATION_CHECKS.length}
            defaultOpen>
            
            <div className="space-y-2">
              {VERIFICATION_CHECKS.map((check) => {
                const vConfig = verificationConfig(check.status);
                const VIcon = vConfig.icon;
                return (
                  <div
                    key={check.id}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border ${vConfig.bg} ${vConfig.border}`}>
                    
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${vConfig.bg}`}>
                      
                      <VIcon className={`w-3.5 h-3.5 ${vConfig.color}`} />
                    </div>
                    <div>
                      <p
                        className={`text-xs font-semibold ${vConfig.textColor}`}>
                        
                        {check.label}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {check.detail}
                      </p>
                    </div>
                  </div>);

              })}
            </div>
          </CollapsibleSection>

          {/* Actions */}
          <div className="p-4 border-t border-gray-100">
            <button className="w-full px-4 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
              Verify & Approve KYC
            </button>
            <button className="w-full mt-2 px-4 py-2.5 text-gray-600 text-xs font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              Flag for Manual Review
            </button>
          </div>
        </div>
      </div>
    </motion.div>);

}