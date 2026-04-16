import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  DownloadIcon,
  CopyIcon,
  SendIcon,
  ExternalLinkIcon,
  ClockIcon,
  ShieldCheckIcon,
  GlobeIcon,
  FileTextIcon,
  PencilIcon,
  AlertTriangleIcon,
  ReceiptTextIcon,
  SparklesIcon,
  CheckIcon,
  DatabaseIcon,
  BracesIcon,
  ListChecksIcon,
  HistoryIcon,
  FileJsonIcon,
  FileSpreadsheetIcon,
  ServerIcon } from
'lucide-react';
type Tab = 'structured' | 'json' | 'validation' | 'history';
const SUMMARY = [
{
  label: 'Confidence',
  value: '94.2%',
  icon: SparklesIcon,
  color: 'text-emerald-600',
  bg: 'bg-emerald-50',
  ring: 'ring-emerald-100'
},
{
  label: 'Document Type',
  value: 'Tax Invoice',
  icon: ReceiptTextIcon,
  color: 'text-indigo-600',
  bg: 'bg-indigo-50',
  ring: 'ring-indigo-100'
},
{
  label: 'Fields Reviewed',
  value: '3 of 17',
  icon: PencilIcon,
  color: 'text-amber-600',
  bg: 'bg-amber-50',
  ring: 'ring-amber-100'
},
{
  label: 'Language',
  value: 'EN + HI',
  icon: GlobeIcon,
  color: 'text-sky-600',
  bg: 'bg-sky-50',
  ring: 'ring-sky-100'
},
{
  label: 'Processed',
  value: '15 Mar 2024, 14:32',
  icon: ClockIcon,
  color: 'text-gray-600',
  bg: 'bg-gray-50',
  ring: 'ring-gray-100'
},
{
  label: 'Final Status',
  value: 'Approved',
  icon: ShieldCheckIcon,
  color: 'text-emerald-600',
  bg: 'bg-emerald-50',
  ring: 'ring-emerald-100'
}];

const STRUCTURED_DATA = {
  'Header Information': [
  {
    label: 'Invoice Number',
    value: 'INV-2024-0847'
  },
  {
    label: 'Invoice Date',
    value: '15 Mar 2024'
  },
  {
    label: 'Due Date',
    value: '14 Apr 2024'
  },
  {
    label: 'Vendor Name',
    value: 'Acme Corp Pvt Ltd'
  },
  {
    label: 'Buyer Name',
    value: 'TechStar Solutions'
  },
  {
    label: 'GSTIN (Vendor)',
    value: '27AABCU9603R1ZM'
  },
  {
    label: 'PO Number',
    value: 'PO-2024-1192'
  }],

  'Amount Summary': [
  {
    label: 'Subtotal',
    value: '₹1,05,508.47'
  },
  {
    label: 'Tax (GST 18%)',
    value: '₹18,991.53'
  },
  {
    label: 'Discount',
    value: '₹0.00'
  },
  {
    label: 'Total Amount',
    value: '₹1,24,500.00',
    highlight: true
  },
  {
    label: 'Currency',
    value: 'INR'
  }],

  'Line Items': [
  {
    label: 'Cloud Hosting — Standard Plan',
    value: 'Qty: 1 · ₹53,100.00'
  },
  {
    label: 'API Gateway — 500K requests',
    value: 'Qty: 1 · ₹25,960.00'
  },
  {
    label: 'SSL Certificate — Wildcard',
    value: 'Qty: 2 · ₹20,060.00'
  },
  {
    label: 'Data Backup Service — Premium',
    value: 'Qty: 1 · ₹14,169.99'
  },
  {
    label: 'Technical Support — Priority',
    value: 'Qty: 3 · ₹13,227.78'
  }]

};
const JSON_OUTPUT = `{
  "document": {
    "type": "invoice",
    "confidence": 0.942,
    "language": ["en", "hi"],
    "pages": 3,
    "processedAt": "2024-03-15T14:32:18Z",
    "schema": "docuparse/invoice/v2.1"
  },
  "header": {
    "invoiceNumber": "INV-2024-0847",
    "invoiceDate": "2024-03-15",
    "dueDate": "2024-04-14",
    "vendorName": "Acme Corp Pvt Ltd",
    "buyerName": "TechStar Solutions",
    "gstin": "27AABCU9603R1ZM",
    "poNumber": "PO-2024-1192"
  },
  "amounts": {
    "subtotal": 105508.47,
    "tax": 18991.53,
    "taxRate": 0.18,
    "discount": 0,
    "total": 124500.00,
    "currency": "INR"
  },
  "lineItems": [
    {
      "description": "Cloud Hosting — Standard Plan (Monthly)",
      "quantity": 1,
      "unitPrice": 45000.00,
      "taxPercent": 18,
      "amount": 53100.00
    },
    {
      "description": "API Gateway — 500K requests",
      "quantity": 1,
      "unitPrice": 22000.00,
      "taxPercent": 18,
      "amount": 25960.00
    },
    {
      "description": "SSL Certificate — Wildcard (Annual)",
      "quantity": 2,
      "unitPrice": 8500.00,
      "taxPercent": 18,
      "amount": 20060.00
    },
    {
      "description": "Data Backup Service — Premium",
      "quantity": 1,
      "unitPrice": 12008.47,
      "taxPercent": 18,
      "amount": 14169.99
    },
    {
      "description": "Technical Support — Priority",
      "quantity": 3,
      "unitPrice": 3736.67,
      "taxPercent": 18,
      "amount": 13227.78
    }
  ],
  "validation": {
    "totalMatchesLineItems": true,
    "gstinFormatValid": true,
    "duplicateCheck": "passed",
    "poReferenceFound": true,
    "schemaValid": true
  }
}`;
const VALIDATION_LOG: {
  id: string;
  check: string;
  status: 'passed' | 'warning' | 'corrected';
  detail: string;
}[] = [
{
  id: 'v1',
  check: 'Total matches line items sum',
  status: 'passed',
  detail: '₹1,24,500.00 = sum of 5 line items'
},
{
  id: 'v2',
  check: 'GSTIN format valid (Vendor)',
  status: 'passed',
  detail: '27AABCU9603R1ZM matches 15-char alphanumeric pattern'
},
{
  id: 'v3',
  check: 'GSTIN format valid (Buyer)',
  status: 'corrected',
  detail: 'Corrected from 29AADCB223OM1ZP → 29AADCB2230M1ZP (OCR misread)'
},
{
  id: 'v4',
  check: 'Duplicate invoice check',
  status: 'passed',
  detail: 'No duplicates found across 12,847 records'
},
{
  id: 'v5',
  check: 'PO reference found',
  status: 'passed',
  detail: 'PO-2024-1192 matched in procurement system'
},
{
  id: 'v6',
  check: 'Tax rate consistency',
  status: 'warning',
  detail:
  'Line item 3 originally extracted as 12% — manually corrected to 18%'
},
{
  id: 'v7',
  check: 'Date format validation',
  status: 'passed',
  detail: 'All dates conform to ISO 8601'
},
{
  id: 'v8',
  check: 'Currency consistency',
  status: 'passed',
  detail: 'All amounts denominated in INR'
}];

const REVIEW_HISTORY: {
  id: string;
  user: string;
  avatar: string;
  action: string;
  detail: string;
  timestamp: string;
  type: 'system' | 'edit' | 'note' | 'approval';
}[] = [
{
  id: 'h1',
  user: 'DocuParse AI',
  avatar: 'AI',
  action: 'Document processed & extracted',
  detail: '17 fields extracted across 3 pages, 3 flagged for human review',
  timestamp: '14:32:18',
  type: 'system'
},
{
  id: 'h2',
  user: 'DocuParse AI',
  avatar: 'AI',
  action: 'Automated validation completed',
  detail: '6 checks passed, 1 warning, 1 auto-corrected',
  timestamp: '14:32:20',
  type: 'system'
},
{
  id: 'h3',
  user: 'Priya Sharma',
  avatar: 'PS',
  action: "Corrected Father's Name",
  detail: '"MOHAN LAL SHRMA" → "MOHAN LAL SHARMA" (missing character)',
  timestamp: '14:35:42',
  type: 'edit'
},
{
  id: 'h4',
  user: 'Priya Sharma',
  avatar: 'PS',
  action: 'Corrected Date of Birth',
  detail: '"12/O5/1985" → "12/05/1985" (OCR confused O with 0)',
  timestamp: '14:36:01',
  type: 'edit'
},
{
  id: 'h5',
  user: 'Priya Sharma',
  avatar: 'PS',
  action: 'Corrected Tax Rate (Line 3)',
  detail: '12% → 18% (verified against source document)',
  timestamp: '14:36:28',
  type: 'edit'
},
{
  id: 'h6',
  user: 'Priya Sharma',
  avatar: 'PS',
  action: 'Marked Address field as N/A',
  detail: 'Field not present on this document type — excluded from output',
  timestamp: '14:36:45',
  type: 'note'
},
{
  id: 'h7',
  user: 'Priya Sharma',
  avatar: 'PS',
  action: 'Approved for export',
  detail:
  'All 3 flagged fields resolved. Document approved for downstream push.',
  timestamp: '14:37:12',
  type: 'approval'
}];

function validationStatusConfig(s: 'passed' | 'warning' | 'corrected') {
  switch (s) {
    case 'passed':
      return {
        icon: CheckCircle2Icon,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200/60',
        text: 'text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-700',
        label: 'Passed'
      };
    case 'warning':
      return {
        icon: AlertTriangleIcon,
        color: 'text-amber-500',
        bg: 'bg-amber-50',
        border: 'border-amber-200/60',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-700',
        label: 'Warning'
      };
    case 'corrected':
      return {
        icon: PencilIcon,
        color: 'text-indigo-500',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200/60',
        text: 'text-indigo-700',
        badge: 'bg-indigo-100 text-indigo-700',
        label: 'Corrected'
      };
  }
}
function historyTypeConfig(t: 'system' | 'edit' | 'note' | 'approval') {
  switch (t) {
    case 'system':
      return {
        icon: SparklesIcon,
        color: 'text-gray-400',
        bg: 'bg-gray-100',
        accent: 'border-gray-200'
      };
    case 'edit':
      return {
        icon: PencilIcon,
        color: 'text-indigo-500',
        bg: 'bg-indigo-50',
        accent: 'border-indigo-200'
      };
    case 'note':
      return {
        icon: FileTextIcon,
        color: 'text-amber-500',
        bg: 'bg-amber-50',
        accent: 'border-amber-200'
      };
    case 'approval':
      return {
        icon: CheckCircle2Icon,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
        accent: 'border-emerald-200'
      };
  }
}
interface ExportScreenProps {
  onBack: () => void;
  onDone: () => void;
}
export function ExportScreen({ onBack, onDone }: ExportScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('structured');
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(JSON_OUTPUT).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };
  const tabs: {
    id: Tab;
    label: string;
    icon: React.ElementType;
    count?: number;
  }[] = [
  {
    id: 'structured',
    label: 'Structured View',
    icon: DatabaseIcon
  },
  {
    id: 'json',
    label: 'JSON',
    icon: BracesIcon
  },
  {
    id: 'validation',
    label: 'Validation Log',
    icon: ListChecksIcon,
    count: VALIDATION_LOG.length
  },
  {
    id: 'history',
    label: 'Review History',
    icon: HistoryIcon,
    count: REVIEW_HISTORY.length
  }];

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
      className="w-full h-full bg-[#F8F9FB] flex flex-col overflow-hidden">
      
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white flex-shrink-0">
        {/* Header row */}
        <div className="px-5 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Go back">
              
              <ArrowLeftIcon className="w-4 h-4 text-gray-500" />
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <ShieldCheckIcon className="w-[18px] h-[18px] text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-semibold text-gray-900">
                    invoice_march_2024.pdf
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-semibold text-emerald-700">
                    <CheckCircle2Icon className="w-2.5 h-2.5" />
                    Ready to Export
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  3 pages · 17 fields extracted · All validations passed
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
              
              {copied ?
              <CheckIcon className="w-3.5 h-3.5 text-emerald-500" /> :

              <CopyIcon className="w-3.5 h-3.5" />
              }
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
            <div className="hidden md:flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-200">
                <FileJsonIcon className="w-3.5 h-3.5" />
                JSON
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <FileSpreadsheetIcon className="w-3.5 h-3.5" />
                CSV
              </button>
            </div>
            <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
              <ServerIcon className="w-3.5 h-3.5" />
              Send to ERP
            </button>
            <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
              <SendIcon className="w-3.5 h-3.5" />
              Push to Workflow
            </button>
            <button
              onClick={handleExport}
              className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 shadow-sm ${exported ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}>
              
              {exported ?
              <CheckIcon className="w-3.5 h-3.5" /> :

              <ExternalLinkIcon className="w-3.5 h-3.5" />
              }
              {exported ? 'Exported!' : 'Approve & Export'}
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="px-5 md:px-8 pb-4 flex gap-2.5 overflow-x-auto">
          {SUMMARY.map((item, i) => {
            const SIcon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{
                  opacity: 0,
                  y: 8
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  delay: i * 0.05,
                  duration: 0.3
                }}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl ${item.bg} ring-1 ${item.ring} min-w-fit`}>
                
                <div
                  className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center`}>
                  
                  <SIcon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-1">
                    {item.label}
                  </p>
                  <p
                    className={`text-[13px] font-bold ${item.color} leading-none`}>
                    
                    {item.value}
                  </p>
                </div>
              </motion.div>);

          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white px-5 md:px-8 flex-shrink-0">
        <nav className="flex gap-1" role="tablist">
          {tabs.map((tab) => {
            const TIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={isActive}
                className={`relative flex items-center gap-1.5 px-4 py-3 text-xs font-medium transition-colors rounded-t-lg ${isActive ? 'text-indigo-700' : 'text-gray-400 hover:text-gray-600'}`}>
                
                <TIcon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.count !== undefined &&
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                  
                    {tab.count}
                  </span>
                }
                {isActive &&
                <motion.div
                  layoutId="export-tab-indicator"
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-indigo-600 rounded-full"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30
                  }} />

                }
              </button>);

          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {/* STRUCTURED VIEW */}
          {activeTab === 'structured' &&
          <motion.div
            key="structured"
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0
            }}
            transition={{
              duration: 0.25
            }}
            className="max-w-3xl mx-auto p-6 md:p-8 space-y-5">
            
              {Object.entries(STRUCTURED_DATA).map(([section, fields], si) =>
            <motion.div
              key={section}
              initial={{
                opacity: 0,
                y: 12
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: si * 0.08,
                duration: 0.3
              }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/80">
                    <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      {section}
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {fields.map(
                  (
                  field: {
                    label: string;
                    value: string;
                    highlight?: boolean;
                  },
                  fi: number) =>

                  <motion.div
                    key={field.label}
                    initial={{
                      opacity: 0
                    }}
                    animate={{
                      opacity: 1
                    }}
                    transition={{
                      delay: si * 0.08 + fi * 0.02
                    }}
                    className={`flex items-center justify-between px-5 py-3 ${field.highlight ? 'bg-indigo-50/40' : ''}`}>
                    
                          <span className="text-xs text-gray-400 font-medium">
                            {field.label}
                          </span>
                          <span
                      className={`text-sm tabular-nums ${field.highlight ? 'font-bold text-indigo-700' : 'font-semibold text-gray-900'}`}>
                      
                            {field.value}
                          </span>
                        </motion.div>

                )}
                  </div>
                </motion.div>
            )}

              {/* Bottom note */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[11px] text-gray-400">
                  17 fields extracted · Schema v2.1 · All validations passed
                </span>
              </div>
            </motion.div>
          }

          {/* JSON VIEW */}
          {activeTab === 'json' &&
          <motion.div
            key="json"
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0
            }}
            transition={{
              duration: 0.25
            }}
            className="max-w-4xl mx-auto p-6 md:p-8">
            
              <div className="bg-[#0D1117] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/80 bg-[#161B22]">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                      <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                      <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                    </div>
                    <div className="flex items-center gap-1.5 ml-1">
                      <FileJsonIcon className="w-3 h-3 text-gray-500" />
                      <span className="text-[11px] font-mono font-medium text-gray-400">
                        output.json
                      </span>
                      <span className="text-[9px] font-mono text-gray-600 ml-1">
                        — 2.4 KB
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-900/30 border border-emerald-800/40 text-[9px] font-mono text-emerald-400">
                      <CheckCircle2Icon className="w-2.5 h-2.5" />
                      schema valid
                    </span>
                    <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-gray-400 rounded-md hover:bg-gray-700/50 hover:text-gray-200 transition-colors">
                    
                      {copied ?
                    <CheckIcon className="w-3 h-3 text-emerald-400" /> :

                    <CopyIcon className="w-3 h-3" />
                    }
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Code */}
                <div className="overflow-auto max-h-[560px]">
                  <pre className="p-5 text-[12.5px] leading-[1.7] font-mono text-gray-300">
                    <code>
                      {JSON_OUTPUT.split('\n').map((line, i) => {
                      const highlighted = line.
                      replace(/"([^"]+)":/g, '<key>"$1"</key>:').
                      replace(/: "([^"]+)"/g, ': <str>"$1"</str>').
                      replace(/: (\d+\.?\d*)/g, ': <num>$1</num>').
                      replace(/: (true|false)/g, ': <bool>$1</bool>');
                      return (
                        <div
                          key={i}
                          className="flex hover:bg-white/[0.02] transition-colors">
                          
                            <span className="w-10 text-right pr-5 text-gray-600 select-none text-[11px] leading-[1.7]">
                              {i + 1}
                            </span>
                            <span
                            dangerouslySetInnerHTML={{
                              __html: highlighted.
                              replace(
                                /<key>/g,
                                '<span class="text-[#D2A8FF]">'
                              ).
                              replace(/<\/key>/g, '</span>').
                              replace(
                                /<str>/g,
                                '<span class="text-[#A5D6FF]">'
                              ).
                              replace(/<\/str>/g, '</span>').
                              replace(
                                /<num>/g,
                                '<span class="text-[#79C0FF]">'
                              ).
                              replace(/<\/num>/g, '</span>').
                              replace(
                                /<bool>/g,
                                '<span class="text-[#FF7B72]">'
                              ).
                              replace(/<\/bool>/g, '</span>')
                            }} />
                          
                          </div>);

                    })}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Footer info */}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] text-gray-500 font-medium">
                    Schema valid
                  </span>
                </div>
                <span className="text-[10px] text-gray-300">·</span>
                <span className="text-[11px] text-gray-400">17 fields</span>
                <span className="text-[10px] text-gray-300">·</span>
                <span className="text-[11px] text-gray-400">5 line items</span>
                <span className="text-[10px] text-gray-300">·</span>
                <span className="text-[11px] text-gray-400">UTF-8</span>
                <span className="text-[10px] text-gray-300">·</span>
                <span className="text-[11px] text-gray-400">
                  docuparse/invoice/v2.1
                </span>
              </div>
            </motion.div>
          }

          {/* VALIDATION LOG */}
          {activeTab === 'validation' &&
          <motion.div
            key="validation"
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0
            }}
            transition={{
              duration: 0.25
            }}
            className="max-w-3xl mx-auto p-6 md:p-8">
            
              {/* Stats row */}
              <div className="flex items-center gap-3 mb-6">
                {[
              {
                label: 'Passed',
                count: VALIDATION_LOG.filter((v) => v.status === 'passed').
                length,
                color: 'emerald'
              },
              {
                label: 'Warnings',
                count: VALIDATION_LOG.filter((v) => v.status === 'warning').
                length,
                color: 'amber'
              },
              {
                label: 'Corrected',
                count: VALIDATION_LOG.filter(
                  (v) => v.status === 'corrected'
                ).length,
                color: 'indigo'
              }].
              map((stat) =>
              <div
                key={stat.label}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl bg-${stat.color}-50 ring-1 ring-${stat.color}-100`}>
                
                    <span
                  className={`text-lg font-bold text-${stat.color}-600 tabular-nums`}>
                  
                      {stat.count}
                    </span>
                    <span
                  className={`text-[11px] font-semibold text-${stat.color}-600`}>
                  
                      {stat.label}
                    </span>
                  </div>
              )}
              </div>

              {/* Log items */}
              <div className="space-y-2.5">
                {VALIDATION_LOG.map((item, i) => {
                const vc = validationStatusConfig(item.status);
                const VIcon = vc.icon;
                return (
                  <motion.div
                    key={item.id}
                    initial={{
                      opacity: 0,
                      y: 8
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      delay: i * 0.04,
                      duration: 0.25
                    }}
                    className={`flex items-start gap-3.5 p-4 rounded-xl bg-white border ${vc.border} shadow-sm`}>
                    
                      <div
                      className={`w-8 h-8 rounded-lg ${vc.bg} flex items-center justify-center flex-shrink-0`}>
                      
                        <VIcon className={`w-4 h-4 ${vc.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-xs font-semibold text-gray-800">
                            {item.check}
                          </p>
                          <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${vc.badge}`}>
                          
                            {vc.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          {item.detail}
                        </p>
                      </div>
                    </motion.div>);

              })}
              </div>
            </motion.div>
          }

          {/* REVIEW HISTORY */}
          {activeTab === 'history' &&
          <motion.div
            key="history"
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0
            }}
            transition={{
              duration: 0.25
            }}
            className="max-w-3xl mx-auto p-6 md:p-8">
            
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[22px] top-6 bottom-6 w-px bg-gray-200" />

                <div className="space-y-1">
                  {REVIEW_HISTORY.map((item, i) => {
                  const hc = historyTypeConfig(item.type);
                  const HIcon = hc.icon;
                  const isApproval = item.type === 'approval';
                  return (
                    <motion.div
                      key={item.id}
                      initial={{
                        opacity: 0,
                        x: -10
                      }}
                      animate={{
                        opacity: 1,
                        x: 0
                      }}
                      transition={{
                        delay: i * 0.06,
                        duration: 0.3
                      }}
                      className={`flex items-start gap-4 py-3.5 relative ${isApproval ? 'bg-emerald-50/50 -mx-3 px-3 rounded-xl' : ''}`}>
                      
                        <div
                        className={`w-11 h-11 rounded-xl ${hc.bg} border-2 border-white flex items-center justify-center flex-shrink-0 z-10 shadow-sm`}>
                        
                          {item.avatar === 'AI' ?
                        <SparklesIcon className={`w-4 h-4 ${hc.color}`} /> :

                        <span
                          className={`text-[10px] font-bold ${hc.color}`}>
                          
                              {item.avatar}
                            </span>
                        }
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-gray-900">
                              {item.user}
                            </span>
                            <span className="text-[10px] text-gray-300">·</span>
                            <span className="text-[10px] text-gray-400 tabular-nums font-mono">
                              {item.timestamp}
                            </span>
                            {isApproval &&
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700">
                                <CheckCircle2Icon className="w-2.5 h-2.5" />
                                APPROVED
                              </span>
                          }
                          </div>
                          <p
                          className={`text-xs font-medium ${isApproval ? 'text-emerald-700' : 'text-gray-700'}`}>
                          
                            {item.action}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                            {item.detail}
                          </p>
                        </div>
                      </motion.div>);

                })}
                </div>
              </div>
            </motion.div>
          }
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 bg-white px-5 md:px-8 py-3 flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
          <span>Document approved and ready for downstream integration</span>
        </div>
        <button
          onClick={onDone}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
          
          Process Another Document →
        </button>
      </div>
    </motion.div>);

}