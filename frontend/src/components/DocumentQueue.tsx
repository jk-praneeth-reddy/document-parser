import React, { useCallback, useEffect, useState, createElement } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  FileTextIcon,
  ReceiptTextIcon,
  CreditCardIcon,
  FingerprintIcon,
  BookOpenIcon,
  CarIcon,
  LandmarkIcon,
  SearchIcon,
  ZoomInIcon,
  ZoomOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  Loader2Icon,
  ClockIcon,
  UploadCloudIcon,
  XCircleIcon,
  PlusIcon,
  ArrowLeftIcon } from
'lucide-react';
// Types
type DocStatus =
'uploading' |
'queued' |
'processing' |
'needs-review' |
'done' |
'unsupported';
interface QueueDocument {
  id: string;
  name: string;
  type: string;
  detectedType: string;
  pages: number;
  size: string;
  timestamp: string;
  status: DocStatus;
  progress?: number;
  confidence?: number;
  extractedFields?: ExtractedField[];
  issues?: string[];
}
interface ExtractedField {
  label: string;
  value: string | null;
  confidence: number;
}
// Status config
const STATUS_CONFIG: Record<
  DocStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ElementType;
  }> =
{
  uploading: {
    label: 'Uploading',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: UploadCloudIcon
  },
  queued: {
    label: 'Queued',
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
    icon: ClockIcon
  },
  processing: {
    label: 'Processing',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: Loader2Icon
  },
  'needs-review': {
    label: 'Needs Review',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: AlertTriangleIcon
  },
  done: {
    label: 'Done',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2Icon
  },
  unsupported: {
    label: 'Unsupported',
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    icon: XCircleIcon
  }
};
const DOC_TYPE_ICONS: Record<string, React.ElementType> = {
  Invoice: ReceiptTextIcon,
  'PAN Card': CreditCardIcon,
  Aadhaar: FingerprintIcon,
  Passport: BookOpenIcon,
  'Driving License': CarIcon,
  'Bank Statement': LandmarkIcon,
  Unknown: FileTextIcon
};
// Sample data
const INITIAL_DOCUMENTS: QueueDocument[] = [
{
  id: '1',
  name: 'invoice_march_2024.pdf',
  type: 'application/pdf',
  detectedType: 'Invoice',
  pages: 3,
  size: '342 KB',
  timestamp: '2 min ago',
  status: 'done',
  confidence: 96,
  extractedFields: [
  {
    label: 'Invoice Number',
    value: 'INV-2024-0847',
    confidence: 99
  },
  {
    label: 'Vendor Name',
    value: 'Acme Corp Pvt Ltd',
    confidence: 97
  },
  {
    label: 'Invoice Date',
    value: '15 Mar 2024',
    confidence: 98
  },
  {
    label: 'Due Date',
    value: '14 Apr 2024',
    confidence: 95
  },
  {
    label: 'Total Amount',
    value: '₹1,24,500.00',
    confidence: 99
  },
  {
    label: 'GST Number',
    value: '27AABCU9603R1ZM',
    confidence: 94
  },
  {
    label: 'PO Number',
    value: 'PO-2024-1192',
    confidence: 91
  }]

},
{
  id: '2',
  name: 'pan_card_scan.jpg',
  type: 'image/jpeg',
  detectedType: 'PAN Card',
  pages: 1,
  size: '1.2 MB',
  timestamp: '2 min ago',
  status: 'needs-review',
  confidence: 78,
  extractedFields: [
  {
    label: 'PAN Number',
    value: 'ABCDE1234F',
    confidence: 95
  },
  {
    label: 'Full Name',
    value: 'RAJESH KUMAR',
    confidence: 88
  },
  {
    label: "Father's Name",
    value: null,
    confidence: 32
  },
  {
    label: 'Date of Birth',
    value: '12/05/1985',
    confidence: 72
  }],

  issues: [
  "Father's name could not be read clearly",
  'Date of birth has low confidence']

},
{
  id: '3',
  name: 'aadhaar_front_back.pdf',
  type: 'application/pdf',
  detectedType: 'Aadhaar',
  pages: 2,
  size: '890 KB',
  timestamp: '1 min ago',
  status: 'processing',
  progress: 65
},
{
  id: '4',
  name: 'bank_statement_q4.pdf',
  type: 'application/pdf',
  detectedType: 'Bank Statement',
  pages: 12,
  size: '2.1 MB',
  timestamp: '1 min ago',
  status: 'queued'
},
{
  id: '5',
  name: 'passport_scan.png',
  type: 'image/png',
  detectedType: 'Passport',
  pages: 1,
  size: '3.4 MB',
  timestamp: 'Just now',
  status: 'uploading',
  progress: 42
},
{
  id: '6',
  name: 'corrupted_file.xyz',
  type: 'application/octet-stream',
  detectedType: 'Unknown',
  pages: 0,
  size: '156 KB',
  timestamp: 'Just now',
  status: 'unsupported'
}];

// Sub-components
function StatusChip({ status }: {status: DocStatus;}) {
  const config = STATUS_CONFIG[status];
  const IconComp = config.icon;
  const isAnimated = status === 'processing' || status === 'uploading';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      
      {isAnimated ?
      <motion.div
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}>
        
          <IconComp className="w-3 h-3" />
        </motion.div> :

      <IconComp className="w-3 h-3" />
      }
      {config.label}
    </span>);

}
function DocThumbnail({
  docType,
  status



}: {docType: string;status: DocStatus;}) {
  const IconComp = DOC_TYPE_ICONS[docType] || FileTextIcon;
  const isProcessing = status === 'processing';
  return (
    <div
      className={`w-11 h-14 rounded-lg border flex items-center justify-center flex-shrink-0 relative overflow-hidden ${status === 'done' ? 'bg-emerald-50 border-emerald-200' : status === 'needs-review' ? 'bg-amber-50 border-amber-200' : status === 'unsupported' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
      
      <IconComp
        className={`w-5 h-5 ${status === 'done' ? 'text-emerald-500' : status === 'needs-review' ? 'text-amber-500' : status === 'unsupported' ? 'text-red-400' : 'text-gray-400'}`} />
      
      {isProcessing &&
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
        initial={{
          scaleX: 0
        }}
        animate={{
          scaleX: [0, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          transformOrigin: 'left'
        }} />

      }
    </div>);

}
function ConfidenceBadge({ confidence }: {confidence: number;}) {
  const color =
  confidence >= 90 ?
  'text-emerald-600 bg-emerald-50' :
  confidence >= 70 ?
  'text-amber-600 bg-amber-50' :
  'text-red-600 bg-red-50';
  return (
    <span
      className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${color}`}>
      
      {confidence}%
    </span>);

}
function SkeletonField() {
  return (
    <div className="space-y-1.5">
      <motion.div
        className="h-2 w-20 bg-gray-200 rounded"
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity
        }} />
      
      <motion.div
        className="h-3 w-32 bg-gray-100 rounded"
        animate={{
          opacity: [0.4, 0.8, 0.4]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.1
        }} />
      
    </div>);

}
// Simulated document preview content
function DocumentPreviewContent({ doc }: {doc: QueueDocument;}) {
  const isCard = ['PAN Card', 'Aadhaar', 'Driving License'].includes(
    doc.detectedType
  );
  if (doc.status === 'unsupported') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <XCircleIcon className="w-12 h-12 text-red-300 mb-3" />
        <p className="text-sm font-medium text-gray-600">
          Unsupported file format
        </p>
        <p className="text-xs text-gray-400 mt-1">
          This file type cannot be processed
        </p>
      </div>);

  }
  if (doc.status === 'uploading') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <motion.div
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}>
          
          <UploadCloudIcon className="w-12 h-12 text-blue-300 mb-3" />
        </motion.div>
        <p className="text-sm font-medium text-gray-600">Uploading...</p>
        <div className="w-40 h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
          <motion.div
            className="h-full bg-blue-500 rounded-full"
            animate={{
              width: [`${doc.progress || 0}%`, '100%']
            }}
            transition={{
              duration: 8,
              ease: 'linear'
            }} />
          
        </div>
      </div>);

  }
  return (
    <div
      className={`w-full h-full flex items-center justify-center p-6 ${isCard ? 'bg-gradient-to-br from-gray-50 to-gray-100' : 'bg-white'}`}>
      
      <div
        className={`${isCard ? 'w-full max-w-sm aspect-[1.6/1]' : 'w-full max-w-md aspect-[1/1.4]'} bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col`}>
        
        {/* Simulated document header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${doc.status === 'done' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
            
            {createElement(DOC_TYPE_ICONS[doc.detectedType] || FileTextIcon, {
              className: `w-4 h-4 ${doc.status === 'done' ? 'text-indigo-600' : 'text-gray-400'}`
            })}
          </div>
          <div>
            <div className="h-2 w-24 bg-gray-800 rounded" />
            <div className="h-1.5 w-16 bg-gray-300 rounded mt-1.5" />
          </div>
        </div>
        {/* Simulated content lines */}
        <div className="flex-1 space-y-2">
          <div className="h-1.5 w-full bg-gray-200 rounded" />
          <div className="h-1.5 w-4/5 bg-gray-200 rounded" />
          <div className="h-1.5 w-full bg-gray-200 rounded" />
          <div className="h-1.5 w-3/5 bg-gray-200 rounded" />
          {!isCard &&
          <>
              <div className="h-4" />
              <div className="h-1.5 w-full bg-gray-100 rounded" />
              <div className="h-1.5 w-full bg-gray-100 rounded" />
              <div className="h-1.5 w-2/3 bg-gray-100 rounded" />
              <div className="h-4" />
              <div className="flex gap-3">
                <div className="h-6 w-16 bg-gray-100 rounded border border-gray-200" />
                <div className="h-6 w-20 bg-gray-100 rounded border border-gray-200" />
              </div>
            </>
          }
        </div>
        {/* Simulated footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="h-1.5 w-14 bg-gray-200 rounded" />
          <div className="h-1.5 w-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>);

}
// Main component
interface DocumentQueueProps {
  onBack: () => void;
  onOpenWorkspace?: () => void;
  onOpenKYCWorkspace?: () => void;
  onOpenFinancialWorkspace?: () => void;
  onOpenReview?: () => void;
  onOpenException?: () => void;
}
export function DocumentQueue({
  onBack,
  onOpenWorkspace,
  onOpenKYCWorkspace,
  onOpenFinancialWorkspace,
  onOpenReview,
  onOpenException
}: DocumentQueueProps) {
  const [documents, setDocuments] = useState<QueueDocument[]>(INITIAL_DOCUMENTS);
  const [selectedId, setSelectedId] = useState<string>('1');
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const selectedDoc = documents.find((d) => d.id === selectedId) || documents[0];
  // Simulate status progression
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Passport: uploading → queued
    timers.push(
      setTimeout(() => {
        setDocuments((prev) =>
        prev.map((d) =>
        d.id === '5' ?
        {
          ...d,
          status: 'queued' as DocStatus,
          progress: undefined,
          timestamp: '1 min ago'
        } :
        d
        )
        );
      }, 3000)
    );
    // Passport: queued → processing
    timers.push(
      setTimeout(() => {
        setDocuments((prev) =>
        prev.map((d) =>
        d.id === '5' ?
        {
          ...d,
          status: 'processing' as DocStatus,
          progress: 30
        } :
        d
        )
        );
      }, 5500)
    );
    // Aadhaar: processing → done
    timers.push(
      setTimeout(() => {
        setDocuments((prev) =>
        prev.map((d) =>
        d.id === '3' ?
        {
          ...d,
          status: 'done' as DocStatus,
          progress: undefined,
          confidence: 94,
          extractedFields: [
          {
            label: 'Aadhaar Number',
            value: 'XXXX XXXX 4523',
            confidence: 97
          },
          {
            label: 'Full Name',
            value: 'PRIYA SHARMA',
            confidence: 96
          },
          {
            label: 'Date of Birth',
            value: '23/08/1990',
            confidence: 93
          },
          {
            label: 'Gender',
            value: 'Female',
            confidence: 99
          },
          {
            label: 'Address',
            value: '42, MG Road, Bengaluru',
            confidence: 88
          }]

        } :
        d
        )
        );
      }, 4000)
    );
    // Bank statement: queued → processing
    timers.push(
      setTimeout(() => {
        setDocuments((prev) =>
        prev.map((d) =>
        d.id === '4' ?
        {
          ...d,
          status: 'processing' as DocStatus,
          progress: 15
        } :
        d
        )
        );
      }, 6000)
    );
    return () => timers.forEach(clearTimeout);
  }, []);
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setCurrentPage(1);
    setZoom(100);
  }, []);
  // Sort: processing/uploading first, then queued, needs-review, done, unsupported
  const statusOrder: Record<DocStatus, number> = {
    uploading: 0,
    processing: 1,
    queued: 2,
    'needs-review': 3,
    done: 4,
    unsupported: 5
  };
  const sortedDocs = [...documents].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );
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
      
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Back to upload">
            
            <ArrowLeftIcon className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              Document Queue
            </h1>
            <p className="text-xs text-gray-500">
              {documents.length} documents ·{' '}
              {documents.filter((d) => d.status === 'done').length} processed
            </p>
          </div>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          <PlusIcon className="w-3.5 h-3.5" />
          Add Files
        </button>
      </div>

      {/* 3-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel — Queue list */}
        <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-3">
            <div className="relative mb-3">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all" />
              
            </div>
          </div>

          <LayoutGroup>
            <div className="px-3 pb-3 space-y-1">
              <AnimatePresence>
                {sortedDocs.map((doc) =>
                <motion.button
                  key={doc.id}
                  layout
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
                    x: -20
                  }}
                  transition={{
                    duration: 0.25
                  }}
                  onClick={() => handleSelect(doc.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${selectedId === doc.id ? 'bg-indigo-50 border border-indigo-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent'}`}>
                  
                    <DocThumbnail
                    docType={doc.detectedType}
                    status={doc.status} />
                  
                    <div className="flex-1 min-w-0">
                      <p
                      className={`text-xs font-semibold truncate ${selectedId === doc.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                      
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-gray-400">
                          {doc.detectedType}
                        </span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">
                          {doc.pages > 0 ? `${doc.pages} pg` : '—'}
                        </span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">
                          {doc.size}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <StatusChip status={doc.status} />
                        <span className="text-[10px] text-gray-400">
                          {doc.timestamp}
                        </span>
                      </div>
                      {(doc.status === 'uploading' ||
                    doc.status === 'processing') &&
                    doc.progress !== undefined &&
                    <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                        className={`h-full rounded-full ${doc.status === 'uploading' ? 'bg-blue-500' : 'bg-indigo-500'}`}
                        animate={{
                          width: `${doc.progress}%`
                        }}
                        transition={{
                          duration: 0.3
                        }} />
                      
                          </div>
                    }
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </LayoutGroup>
        </div>

        {/* Center panel — Preview */}
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
          {/* Preview toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-gray-800 truncate max-w-[200px]">
                {selectedDoc.name}
              </p>
              <StatusChip status={selectedDoc.status} />
            </div>
            <div className="flex items-center gap-1.5">
              {selectedDoc.pages > 1 &&
              <div className="flex items-center gap-1 mr-2">
                  <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-all">
                  
                    <ChevronLeftIcon className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <span className="text-[11px] font-medium text-gray-600 tabular-nums min-w-[48px] text-center">
                    {currentPage} / {selectedDoc.pages}
                  </span>
                  <button
                  onClick={() =>
                  setCurrentPage(
                    Math.min(selectedDoc.pages, currentPage + 1)
                  )
                  }
                  disabled={currentPage >= selectedDoc.pages}
                  className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-all">
                  
                    <ChevronRightIcon className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                </div>
              }
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
          <div className="flex-1 overflow-auto flex items-center justify-center p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDoc.id}
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
                className="w-full h-full max-w-2xl max-h-[600px] rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'center'
                }}>
                
                <DocumentPreviewContent doc={selectedDoc} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right panel — Extraction summary */}
        <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
              Extraction Summary
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {selectedDoc.detectedType} · {selectedDoc.name}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDoc.id}
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
                y: -8
              }}
              transition={{
                duration: 0.25
              }}
              className="p-4">
              
              {/* Classification */}
              <div className="mb-5">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Classification
                </p>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  {createElement(
                    DOC_TYPE_ICONS[selectedDoc.detectedType] || FileTextIcon,
                    {
                      className: 'w-4 h-4 text-indigo-500'
                    }
                  )}
                  <span className="text-sm font-medium text-gray-800">
                    {selectedDoc.detectedType}
                  </span>
                  {selectedDoc.confidence &&
                  <ConfidenceBadge confidence={selectedDoc.confidence} />
                  }
                </div>
              </div>

              {/* Issues */}
              {selectedDoc.issues && selectedDoc.issues.length > 0 &&
              <div className="mb-5">
                  <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider mb-2">
                    Issues Found
                  </p>
                  <div className="space-y-2">
                    {selectedDoc.issues.map((issue, i) =>
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                    
                        <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700">{issue}</p>
                      </div>
                  )}
                  </div>
                </div>
              }

              {/* Extracted fields */}
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Extracted Fields
                </p>

                {selectedDoc.extractedFields ?
                <div className="space-y-3">
                    {selectedDoc.extractedFields.map((field, i) =>
                  <motion.div
                    key={field.label}
                    initial={{
                      opacity: 0,
                      y: 4
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      delay: i * 0.05
                    }}
                    className={`p-3 rounded-lg border ${field.confidence < 70 ? 'bg-amber-50/50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                    
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-medium text-gray-500">
                            {field.label}
                          </span>
                          <ConfidenceBadge confidence={field.confidence} />
                        </div>
                        {field.value ?
                    <p className="text-sm font-semibold text-gray-900">
                            {field.value}
                          </p> :

                    <p className="text-sm text-red-400 italic">
                            Could not extract
                          </p>
                    }
                        {field.confidence < 70 &&
                    <div className="flex items-center gap-1 mt-1.5">
                            <AlertTriangleIcon className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] text-amber-600 font-medium">
                              Low confidence — needs review
                            </span>
                          </div>
                    }
                      </motion.div>
                  )}
                  </div> :
                selectedDoc.status === 'processing' ||
                selectedDoc.status === 'queued' ||
                selectedDoc.status === 'uploading' ?
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) =>
                  <SkeletonField key={i} />
                  )}
                    <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                      <motion.div
                      animate={{
                        rotate: 360
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear'
                      }}>
                      
                        <Loader2Icon className="w-3.5 h-3.5 text-indigo-500" />
                      </motion.div>
                      <span className="text-xs text-indigo-600 font-medium">
                        {selectedDoc.status === 'uploading' ?
                      'Waiting for upload...' :
                      selectedDoc.status === 'queued' ?
                      'Waiting in queue...' :
                      'Extracting data...'}
                      </span>
                    </div>
                  </div> :
                selectedDoc.status === 'unsupported' ?
                <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-center">
                    <XCircleIcon className="w-6 h-6 text-red-300 mx-auto mb-2" />
                    <p className="text-xs text-red-600 font-medium">
                      Cannot extract data from this file type
                    </p>
                    {onOpenException &&
                  <button
                    onClick={onOpenException}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                    
                        View Details
                      </button>
                  }
                  </div> :
                null}
              </div>

              {/* Action buttons for completed docs */}
              {(selectedDoc.status === 'done' ||
              selectedDoc.status === 'needs-review') &&
              <div className="mt-6 space-y-2">
                  <button
                  onClick={() => {
                    if (
                    selectedDoc.status === 'needs-review' &&
                    onOpenReview)
                    {
                      onOpenReview();
                      return;
                    }
                    const kycTypes = [
                    'PAN Card',
                    'Aadhaar',
                    'Passport',
                    'Driving License'];

                    const financialTypes = [
                    'Bank Statement',
                    'Financial Statement'];

                    if (
                    kycTypes.includes(selectedDoc.detectedType) &&
                    onOpenKYCWorkspace)
                    {
                      onOpenKYCWorkspace();
                    } else if (
                    financialTypes.includes(selectedDoc.detectedType) &&
                    onOpenFinancialWorkspace)
                    {
                      onOpenFinancialWorkspace();
                    } else if (onOpenWorkspace) {
                      onOpenWorkspace();
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                  
                    {selectedDoc.status === 'needs-review' ?
                  'Review & Correct' :
                  'Export Data'}
                  </button>
                  <button className="w-full px-4 py-2.5 text-gray-600 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    Re-process Document
                  </button>
                </div>
              }
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>);

}