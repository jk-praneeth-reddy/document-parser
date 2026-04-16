import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  RotateCwIcon,
  ZoomInIcon,
  ZoomOutIcon,
  ScissorsIcon,
  RefreshCwIcon,
  EyeOffIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  XCircleIcon,
  PencilIcon,
  LinkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DownloadIcon,
  FileTextIcon,
  ReceiptTextIcon,
  CopyIcon } from
'lucide-react';
// Types
type Confidence = 'high' | 'medium' | 'low' | 'missing';
interface ExtractedField {
  id: string;
  label: string;
  value: string | null;
  confidence: Confidence;
  required: boolean;
  sourceRegion?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}
interface LineItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  taxPercent: string;
  amount: string;
  confidence: Confidence;
}
interface ValidationCheck {
  id: string;
  label: string;
  status: 'passed' | 'warning' | 'failed';
  detail: string;
}
interface PageInfo {
  id: number;
  label: string;
  status: 'reviewed' | 'pending' | 'issue';
}
// Data
const PAGES: PageInfo[] = [
{
  id: 1,
  label: 'Page 1',
  status: 'reviewed'
},
{
  id: 2,
  label: 'Page 2',
  status: 'pending'
},
{
  id: 3,
  label: 'Page 3',
  status: 'issue'
}];

const HEADER_FIELDS: ExtractedField[] = [
{
  id: 'inv-no',
  label: 'Invoice Number',
  value: 'INV-2024-0847',
  confidence: 'high',
  required: true,
  sourceRegion: {
    x: 62,
    y: 4,
    w: 30,
    h: 4
  }
},
{
  id: 'inv-date',
  label: 'Invoice Date',
  value: '15 Mar 2024',
  confidence: 'high',
  required: true,
  sourceRegion: {
    x: 62,
    y: 10,
    w: 22,
    h: 4
  }
},
{
  id: 'vendor',
  label: 'Vendor Name',
  value: 'Acme Corp Pvt Ltd',
  confidence: 'high',
  required: true,
  sourceRegion: {
    x: 5,
    y: 14,
    w: 32,
    h: 4
  }
},
{
  id: 'buyer',
  label: 'Buyer Name',
  value: 'TechStar Solutions',
  confidence: 'high',
  required: true,
  sourceRegion: {
    x: 5,
    y: 20,
    w: 28,
    h: 4
  }
},
{
  id: 'gstin',
  label: 'GSTIN',
  value: '27AABCU9603R1ZM',
  confidence: 'medium',
  required: true,
  sourceRegion: {
    x: 5,
    y: 82,
    w: 30,
    h: 3
  }
},
{
  id: 'po',
  label: 'PO Number',
  value: null,
  confidence: 'missing',
  required: false,
  sourceRegion: undefined
}];

const AMOUNT_FIELDS: ExtractedField[] = [
{
  id: 'subtotal',
  label: 'Subtotal',
  value: '₹1,05,508.47',
  confidence: 'high',
  required: true,
  sourceRegion: {
    x: 58,
    y: 68,
    w: 35,
    h: 3
  }
},
{
  id: 'tax',
  label: 'Tax (GST 18%)',
  value: '₹18,991.53',
  confidence: 'high',
  required: true,
  sourceRegion: {
    x: 58,
    y: 72,
    w: 35,
    h: 3
  }
},
{
  id: 'discount',
  label: 'Discount',
  value: '₹0.00',
  confidence: 'high',
  required: false,
  sourceRegion: {
    x: 58,
    y: 76,
    w: 35,
    h: 3
  }
},
{
  id: 'total',
  label: 'Total Amount',
  value: '₹1,24,500.00',
  confidence: 'high',
  required: true,
  sourceRegion: {
    x: 58,
    y: 80,
    w: 35,
    h: 4
  }
},
{
  id: 'currency',
  label: 'Currency',
  value: 'INR',
  confidence: 'medium',
  required: true,
  sourceRegion: undefined
}];

const LINE_ITEMS: LineItem[] = [
{
  id: 'li-1',
  description: 'Cloud Hosting — Standard Plan (Monthly)',
  quantity: '1',
  unitPrice: '₹45,000.00',
  taxPercent: '18%',
  amount: '₹53,100.00',
  confidence: 'high'
},
{
  id: 'li-2',
  description: 'API Gateway — 500K requests',
  quantity: '1',
  unitPrice: '₹22,000.00',
  taxPercent: '18%',
  amount: '₹25,960.00',
  confidence: 'high'
},
{
  id: 'li-3',
  description: 'SSL Certificate — Wildcard (Annual)',
  quantity: '2',
  unitPrice: '₹8,500.00',
  taxPercent: '18%',
  amount: '₹20,060.00',
  confidence: 'medium'
},
{
  id: 'li-4',
  description: 'Dta Bckup Srvce — Prmium',
  quantity: '1',
  unitPrice: '₹12,008.47',
  taxPercent: '18%',
  amount: '₹14,169.99',
  confidence: 'low'
},
{
  id: 'li-5',
  description: 'Technical Support — Priority',
  quantity: '3',
  unitPrice: '₹3,736.67',
  taxPercent: '18%',
  amount: '₹13,227.78',
  confidence: 'high'
}];

const VALIDATION_CHECKS: ValidationCheck[] = [
{
  id: 'v1',
  label: 'Total matches line items',
  status: 'passed',
  detail: 'Sum of line items matches total amount'
},
{
  id: 'v2',
  label: 'GSTIN format valid',
  status: 'warning',
  detail: 'Format valid but not verified against registry'
},
{
  id: 'v3',
  label: 'Duplicate invoice check',
  status: 'passed',
  detail: 'No duplicate found in system'
},
{
  id: 'v4',
  label: 'PO reference found',
  status: 'failed',
  detail: 'PO Number field is missing from document'
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
        label: '98%',
        icon: CheckCircle2Icon
      };
    case 'medium':
      return {
        bg: 'bg-amber-50/50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-700',
        label: '76%',
        icon: AlertTriangleIcon
      };
    case 'low':
      return {
        bg: 'bg-red-50/50',
        text: 'text-red-600',
        border: 'border-red-200',
        badge: 'bg-red-100 text-red-600',
        label: '42%',
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
function validationIcon(status: ValidationCheck['status']) {
  switch (status) {
    case 'passed':
      return {
        icon: CheckCircle2Icon,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50'
      };
    case 'warning':
      return {
        icon: AlertTriangleIcon,
        color: 'text-amber-500',
        bg: 'bg-amber-50'
      };
    case 'failed':
      return {
        icon: XCircleIcon,
        color: 'text-red-500',
        bg: 'bg-red-50'
      };
  }
}
// Sub-components
function FieldRow({
  field,
  isActive,
  onSelect




}: {field: ExtractedField;isActive: boolean;onSelect: (id: string) => void;}) {
  const config = confidenceConfig(field.confidence);
  const ConfIcon = config.icon;
  return (
    <motion.button
      onClick={() => onSelect(field.id)}
      className={`w-full text-left p-3 rounded-lg border transition-all ${isActive ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-100' : `${config.bg} ${config.border} hover:shadow-sm`}`}
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
            <span className="text-[9px] text-red-400">*</span>
            }
          </div>
          {field.value ?
          <p className="text-sm font-semibold text-gray-900 truncate">
              {field.value}
            </p> :

          <p className="text-sm italic text-red-400">Not found</p>
          }
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${config.badge}`}>
            
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
  count,
  defaultOpen,
  children





}: {title: string;count?: number;defaultOpen?: boolean;children: React.ReactNode;}) {
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
// Main component
interface InvoiceWorkspaceProps {
  onBack: () => void;
}
export function InvoiceWorkspace({ onBack }: InvoiceWorkspaceProps) {
  const [selectedField, setSelectedField] = useState<string | null>('inv-no');
  const [activePage, setActivePage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const activeSourceRegion =
  [...HEADER_FIELDS, ...AMOUNT_FIELDS].find((f) => f.id === selectedField)?.
  sourceRegion || null;
  const handleFieldSelect = useCallback((id: string) => {
    setSelectedField((prev) => prev === id ? null : id);
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
              <ReceiptTextIcon className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">
                invoice_march_2024.pdf
              </h1>
              <p className="text-[11px] text-gray-500">
                Invoice · 3 pages · 94% confidence
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
            Approve & Submit
          </button>
        </div>
      </div>

      {/* 3-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL — Page navigator */}
        <div className="w-[200px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Pages
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {PAGES.map((page) =>
            <button
              key={page.id}
              onClick={() => setActivePage(page.id)}
              className={`w-full rounded-lg border overflow-hidden transition-all ${activePage === page.id ? 'border-indigo-300 ring-2 ring-indigo-100 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
              
                {/* Page thumbnail */}
                <div className="aspect-[1/1.4] bg-gray-50 relative p-2">
                  <div className="w-full h-full bg-white rounded border border-gray-100 p-2 flex flex-col">
                    <div className="h-1.5 w-12 bg-gray-800 rounded mb-1.5" />
                    <div className="h-1 w-8 bg-gray-300 rounded mb-2" />
                    <div className="space-y-1 flex-1">
                      {[1, 2, 3, 4, 5].map((l) =>
                    <div
                      key={l}
                      className="h-0.5 bg-gray-200 rounded"
                      style={{
                        width: `${50 + Math.random() * 50}%`
                      }} />

                    )}
                    </div>
                  </div>
                  {/* Status dot */}
                  <div
                  className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${page.status === 'reviewed' ? 'bg-emerald-400' : page.status === 'issue' ? 'bg-amber-400' : 'bg-gray-300'}`} />
                
                </div>
                <div className="px-2 py-1.5 text-center border-t border-gray-100">
                  <span
                  className={`text-[10px] font-medium ${activePage === page.id ? 'text-indigo-700' : 'text-gray-600'}`}>
                  
                    {page.label}
                  </span>
                </div>
              </button>
            )}
          </div>

          {/* Page tools */}
          <div className="p-3 border-t border-gray-100 space-y-1">
            {[
            {
              icon: RotateCwIcon,
              label: 'Rotate'
            },
            {
              icon: ScissorsIcon,
              label: 'Split Page'
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

        {/* CENTER PANEL — Document viewer */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-100">
          {/* Viewer toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white flex-shrink-0">
            <span className="text-xs font-medium text-gray-600">
              Page {activePage} of 3
            </span>
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

          {/* Document preview */}
          <div className="flex-1 overflow-auto flex items-start justify-center p-6">
            <motion.div
              className="bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden"
              style={{
                width: `${Math.min(640 * zoom / 100, 900)}px`,
                transformOrigin: 'top center'
              }}>
              
              <div className="aspect-[1/1.4] relative p-8">
                {/* Simulated invoice */}
                <div className="w-full h-full flex flex-col text-left">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="h-4 w-36 bg-gray-800 rounded mb-2" />
                      <div className="h-2 w-28 bg-gray-300 rounded mb-1" />
                      <div className="h-2 w-24 bg-gray-300 rounded" />
                    </div>
                    <div className="text-right">
                      <div className="h-3 w-16 bg-indigo-200 rounded mb-2 ml-auto" />
                      <div className="h-2.5 w-28 bg-gray-700 rounded mb-1 ml-auto" />
                      <div className="h-2 w-20 bg-gray-300 rounded ml-auto" />
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="flex gap-8 mb-6">
                    <div className="flex-1">
                      <div className="h-2 w-10 bg-gray-400 rounded mb-2" />
                      <div className="h-2 w-32 bg-gray-300 rounded mb-1" />
                      <div className="h-2 w-28 bg-gray-300 rounded mb-1" />
                      <div className="h-2 w-24 bg-gray-300 rounded" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-8 bg-gray-400 rounded mb-2" />
                      <div className="h-2 w-28 bg-gray-300 rounded mb-1" />
                      <div className="h-2 w-32 bg-gray-300 rounded mb-1" />
                      <div className="h-2 w-20 bg-gray-300 rounded" />
                    </div>
                  </div>

                  {/* Table header */}
                  <div className="flex gap-3 pb-2 border-b-2 border-gray-300 mb-1">
                    <div className="h-2 w-6 bg-gray-500 rounded" />
                    <div className="h-2 w-40 bg-gray-500 rounded flex-1" />
                    <div className="h-2 w-8 bg-gray-500 rounded" />
                    <div className="h-2 w-16 bg-gray-500 rounded" />
                    <div className="h-2 w-8 bg-gray-500 rounded" />
                    <div className="h-2 w-16 bg-gray-500 rounded" />
                  </div>

                  {/* Table rows */}
                  {[1, 2, 3, 4, 5].map((row) =>
                  <div
                    key={row}
                    className="flex gap-3 py-2.5 border-b border-gray-100 items-center">
                    
                      <div className="h-1.5 w-4 bg-gray-200 rounded" />
                      <div
                      className="h-1.5 bg-gray-200 rounded flex-1"
                      style={{
                        maxWidth: `${100 + row * 30}px`
                      }} />
                    
                      <div className="h-1.5 w-6 bg-gray-200 rounded" />
                      <div className="h-1.5 w-14 bg-gray-200 rounded" />
                      <div className="h-1.5 w-6 bg-gray-200 rounded" />
                      <div className="h-1.5 w-14 bg-gray-200 rounded" />
                    </div>
                  )}

                  {/* Totals */}
                  <div className="mt-auto flex justify-end">
                    <div className="w-48 space-y-2">
                      <div className="flex justify-between">
                        <div className="h-2 w-14 bg-gray-300 rounded" />
                        <div className="h-2 w-20 bg-gray-300 rounded" />
                      </div>
                      <div className="flex justify-between">
                        <div className="h-2 w-10 bg-gray-300 rounded" />
                        <div className="h-2 w-16 bg-gray-300 rounded" />
                      </div>
                      <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                        <div className="h-2.5 w-12 bg-gray-700 rounded" />
                        <div className="h-2.5 w-24 bg-gray-700 rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex justify-between items-end">
                    <div>
                      <div className="h-2 w-24 bg-gray-300 rounded mb-1" />
                      <div className="h-2 w-36 bg-gray-300 rounded" />
                    </div>
                    <div className="w-16 h-10 border border-gray-200 rounded flex items-center justify-center">
                      <div className="w-10 h-5 bg-gray-100 rounded" />
                    </div>
                  </div>
                </div>

                {/* Active field highlight overlay */}
                <AnimatePresence>
                  {activeSourceRegion &&
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
                    className="absolute rounded-md border-2 border-indigo-500 z-10 pointer-events-none"
                    style={{
                      left: `${activeSourceRegion.x}%`,
                      top: `${activeSourceRegion.y}%`,
                      width: `${activeSourceRegion.w}%`,
                      height: `${activeSourceRegion.h}%`,
                      backgroundColor: 'rgba(79, 70, 229, 0.08)',
                      boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.1)'
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
                      className="absolute -top-6 left-0 text-[9px] font-bold text-white bg-indigo-600 px-2 py-0.5 rounded whitespace-nowrap">
                      
                        {
                      [...HEADER_FIELDS, ...AMOUNT_FIELDS].find(
                        (f) => f.id === selectedField
                      )?.label
                      }
                      </motion.div>
                    </motion.div>
                  }
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        {/* RIGHT PANEL — Extracted data */}
        <div className="w-[340px] lg:w-[380px] flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
          {/* Header info */}
          <CollapsibleSection
            title="Header Information"
            count={HEADER_FIELDS.length}
            defaultOpen>
            
            <div className="space-y-2">
              {HEADER_FIELDS.map((field) =>
              <FieldRow
                key={field.id}
                field={field}
                isActive={selectedField === field.id}
                onSelect={handleFieldSelect} />

              )}
            </div>
          </CollapsibleSection>

          {/* Amount summary */}
          <CollapsibleSection
            title="Amount Summary"
            count={AMOUNT_FIELDS.length}
            defaultOpen>
            
            <div className="space-y-2">
              {AMOUNT_FIELDS.map((field) =>
              <FieldRow
                key={field.id}
                field={field}
                isActive={selectedField === field.id}
                onSelect={handleFieldSelect} />

              )}
            </div>
          </CollapsibleSection>

          {/* Line items */}
          <CollapsibleSection
            title="Line Items"
            count={LINE_ITEMS.length}
            defaultOpen>
            
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-left min-w-[480px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['Description', 'Qty', 'Unit Price', 'Tax', 'Amount'].map(
                      (h) =>
                      <th
                        key={h}
                        className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-2 px-2 first:pl-0">
                        
                          {h}
                        </th>

                    )}
                  </tr>
                </thead>
                <tbody>
                  {LINE_ITEMS.map((item) => {
                    const config = confidenceConfig(item.confidence);
                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-gray-50 ${item.confidence === 'low' ? 'bg-red-50/30' : ''}`}>
                        
                        <td className="py-2.5 px-2 first:pl-0">
                          <div className="flex items-center gap-1.5">
                            {item.confidence !== 'high' &&
                            <config.icon
                              className={`w-3 h-3 flex-shrink-0 ${config.text}`} />

                            }
                            <span
                              className={`text-xs ${item.confidence === 'low' ? 'text-red-700' : 'text-gray-800'}`}>
                              
                              {item.description}
                            </span>
                          </div>
                        </td>
                        <td className="text-xs text-gray-600 py-2.5 px-2 tabular-nums">
                          {item.quantity}
                        </td>
                        <td className="text-xs text-gray-600 py-2.5 px-2 tabular-nums">
                          {item.unitPrice}
                        </td>
                        <td className="text-xs text-gray-600 py-2.5 px-2 tabular-nums">
                          {item.taxPercent}
                        </td>
                        <td className="text-xs font-medium text-gray-800 py-2.5 px-2 tabular-nums">
                          {item.amount}
                        </td>
                      </tr>);

                  })}
                </tbody>
              </table>
            </div>
            {/* Low confidence note */}
            <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-100">
              <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-amber-700">
                1 line item has low confidence and may contain OCR errors.
                Review highlighted row.
              </p>
            </div>
          </CollapsibleSection>

          {/* Validation checks */}
          <CollapsibleSection
            title="Validation Checks"
            count={VALIDATION_CHECKS.length}
            defaultOpen>
            
            <div className="space-y-2">
              {VALIDATION_CHECKS.map((check) => {
                const vConfig = validationIcon(check.status);
                const VIcon = vConfig.icon;
                return (
                  <div
                    key={check.id}
                    className={`flex items-start gap-2.5 p-3 rounded-lg border ${check.status === 'passed' ? 'bg-emerald-50/50 border-emerald-100' : check.status === 'warning' ? 'bg-amber-50/50 border-amber-100' : 'bg-red-50/50 border-red-100'}`}>
                    
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${vConfig.bg}`}>
                      
                      <VIcon className={`w-3.5 h-3.5 ${vConfig.color}`} />
                    </div>
                    <div>
                      <p
                        className={`text-xs font-semibold ${check.status === 'passed' ? 'text-emerald-800' : check.status === 'warning' ? 'text-amber-800' : 'text-red-800'}`}>
                        
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
        </div>
      </div>
    </motion.div>);

}