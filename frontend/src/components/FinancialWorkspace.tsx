import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  RotateCwIcon,
  ScissorsIcon,
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
  LandmarkIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  AlertCircleIcon,
  BanknoteIcon,
  CalendarIcon,
  CopyIcon,
  FlagIcon,
  SearchIcon } from
'lucide-react';
// Types
type Confidence = 'high' | 'medium' | 'low';
type RightTab = 'summary' | 'transactions';
type FlagSeverity = 'info' | 'warning' | 'critical';
interface AccountField {
  id: string;
  label: string;
  value: string;
  confidence: Confidence;
  sourceRegion?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}
interface SummaryMetric {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ElementType;
  color: string;
}
interface FlagItem {
  id: string;
  label: string;
  detail: string;
  severity: FlagSeverity;
  count?: number;
}
interface Transaction {
  id: string;
  date: string;
  description: string;
  debit: string;
  credit: string;
  balance: string;
  flag?: string;
  confidence: Confidence;
}
interface PageInfo {
  id: number;
  label: string;
  status: 'verified' | 'review' | 'pending';
}
// Data
const PAGES: PageInfo[] = [
{
  id: 1,
  label: 'Page 1',
  status: 'verified'
},
{
  id: 2,
  label: 'Page 2',
  status: 'verified'
},
{
  id: 3,
  label: 'Page 3',
  status: 'verified'
},
{
  id: 4,
  label: 'Page 4',
  status: 'verified'
},
{
  id: 5,
  label: 'Page 5',
  status: 'verified'
},
{
  id: 6,
  label: 'Page 6',
  status: 'verified'
},
{
  id: 7,
  label: 'Page 7',
  status: 'verified'
},
{
  id: 8,
  label: 'Page 8',
  status: 'verified'
},
{
  id: 9,
  label: 'Page 9',
  status: 'verified'
},
{
  id: 10,
  label: 'Page 10',
  status: 'review'
},
{
  id: 11,
  label: 'Page 11',
  status: 'review'
},
{
  id: 12,
  label: 'Page 12',
  status: 'pending'
}];

const ACCOUNT_FIELDS: AccountField[] = [
{
  id: 'holder',
  label: 'Account Holder',
  value: 'Rajesh Kumar Sharma',
  confidence: 'high',
  sourceRegion: {
    x: 5,
    y: 8,
    w: 40,
    h: 4
  }
},
{
  id: 'bank',
  label: 'Bank Name',
  value: 'HDFC Bank Ltd',
  confidence: 'high',
  sourceRegion: {
    x: 5,
    y: 2,
    w: 30,
    h: 5
  }
},
{
  id: 'account',
  label: 'Account Number',
  value: 'XXXX XXXX 4523',
  confidence: 'high',
  sourceRegion: {
    x: 55,
    y: 8,
    w: 35,
    h: 4
  }
},
{
  id: 'ifsc',
  label: 'IFSC Code',
  value: 'HDFC0001234',
  confidence: 'high',
  sourceRegion: {
    x: 55,
    y: 13,
    w: 25,
    h: 3
  }
},
{
  id: 'period',
  label: 'Statement Period',
  value: '01 Jan 2024 — 31 Mar 2024',
  confidence: 'high',
  sourceRegion: {
    x: 5,
    y: 14,
    w: 40,
    h: 3
  }
},
{
  id: 'branch',
  label: 'Branch',
  value: 'Koramangala, Bengaluru',
  confidence: 'medium',
  sourceRegion: {
    x: 5,
    y: 18,
    w: 35,
    h: 3
  }
}];

const SUMMARY_METRICS: SummaryMetric[] = [
{
  label: 'Total Credits',
  value: '₹8,42,500.00',
  subtext: '24 transactions',
  icon: ArrowDownIcon,
  color: 'text-emerald-600'
},
{
  label: 'Total Debits',
  value: '₹6,18,340.00',
  subtext: '47 transactions',
  icon: ArrowUpIcon,
  color: 'text-red-500'
},
{
  label: 'Opening Balance',
  value: '₹1,85,200.00',
  subtext: '01 Jan 2024',
  icon: BanknoteIcon,
  color: 'text-gray-600'
},
{
  label: 'Closing Balance',
  value: '₹4,09,360.00',
  subtext: '31 Mar 2024',
  icon: BanknoteIcon,
  color: 'text-indigo-600'
},
{
  label: 'Avg Monthly Inflow',
  value: '₹2,80,833.33',
  subtext: 'Per month',
  icon: TrendingUpIcon,
  color: 'text-emerald-600'
},
{
  label: 'Avg Monthly Outflow',
  value: '₹2,06,113.33',
  subtext: 'Per month',
  icon: TrendingDownIcon,
  color: 'text-red-500'
}];

const FLAGS: FlagItem[] = [
{
  id: 'f1',
  label: 'Salary credits detected',
  detail: 'Regular monthly credit of ₹1,25,000 from TechFlow Solutions',
  severity: 'info',
  count: 3
},
{
  id: 'f2',
  label: 'EMI payments detected',
  detail: 'Recurring debit of ₹18,500 to HDFC Home Loan',
  severity: 'info',
  count: 3
},
{
  id: 'f3',
  label: 'Large cash deposit',
  detail: '₹2,00,000 cash deposit on 15 Feb 2024',
  severity: 'warning',
  count: 1
},
{
  id: 'f4',
  label: 'Bounced transaction',
  detail: 'Cheque return on 22 Mar — insufficient funds',
  severity: 'critical',
  count: 1
},
{
  id: 'f5',
  label: 'High-value transfer',
  detail: '₹3,50,000 NEFT to unknown beneficiary on 10 Mar',
  severity: 'warning',
  count: 1
},
{
  id: 'f6',
  label: 'Incomplete page detected',
  detail: 'Page 12 may be truncated — last transaction row cut off',
  severity: 'warning',
  count: 1
}];

const TRANSACTIONS: Transaction[] = [
{
  id: 't1',
  date: '02 Jan',
  description: 'NEFT — TechFlow Solutions — Salary Jan',
  debit: '',
  credit: '₹1,25,000.00',
  balance: '₹3,10,200.00',
  flag: 'Salary',
  confidence: 'high'
},
{
  id: 't2',
  date: '03 Jan',
  description: 'UPI — Swiggy Food Order',
  debit: '₹486.00',
  credit: '',
  balance: '₹3,09,714.00',
  confidence: 'high'
},
{
  id: 't3',
  date: '05 Jan',
  description: 'HDFC Home Loan EMI — Auto Debit',
  debit: '₹18,500.00',
  credit: '',
  balance: '₹2,91,214.00',
  flag: 'EMI',
  confidence: 'high'
},
{
  id: 't4',
  date: '07 Jan',
  description: 'IMPS — Amazon Pay Wallet Load',
  debit: '₹5,000.00',
  credit: '',
  balance: '₹2,86,214.00',
  confidence: 'high'
},
{
  id: 't5',
  date: '10 Jan',
  description: 'NEFT — Rent Payment — Prop Mgmt Co',
  debit: '₹35,000.00',
  credit: '',
  balance: '₹2,51,214.00',
  confidence: 'high'
},
{
  id: 't6',
  date: '12 Jan',
  description: 'UPI — BigBasket Groceries',
  debit: '₹2,340.00',
  credit: '',
  balance: '₹2,48,874.00',
  confidence: 'high'
},
{
  id: 't7',
  date: '15 Jan',
  description: 'ATM Withdrawal — Koramangala',
  debit: '₹10,000.00',
  credit: '',
  balance: '₹2,38,874.00',
  confidence: 'medium'
},
{
  id: 't8',
  date: '15 Feb',
  description: 'Cash Deposit — Self',
  debit: '',
  credit: '₹2,00,000.00',
  balance: '₹4,38,874.00',
  flag: 'Cash',
  confidence: 'medium'
},
{
  id: 't9',
  date: '01 Mar',
  description: 'NEFT — TechFlow Solutions — Salary Mar',
  debit: '',
  credit: '₹1,25,000.00',
  balance: '₹5,63,874.00',
  flag: 'Salary',
  confidence: 'high'
},
{
  id: 't10',
  date: '10 Mar',
  description: 'NEFT — Transfer to Savings — Unknown',
  debit: '₹3,50,000.00',
  credit: '',
  balance: '₹2,13,874.00',
  flag: 'High Value',
  confidence: 'high'
},
{
  id: 't11',
  date: '22 Mar',
  description: 'Cheque Return — Insufficient Funds',
  debit: '₹45,000.00',
  credit: '',
  balance: '₹1,68,874.00',
  flag: 'Bounced',
  confidence: 'low'
},
{
  id: 't12',
  date: '28 Mar',
  description: 'NEFT — Freelance Payment — DesignCo',
  debit: '',
  credit: '₹75,000.00',
  balance: '₹2,43,874.00',
  confidence: 'high'
}];

// Helpers
function confidenceConfig(c: Confidence) {
  switch (c) {
    case 'high':
      return {
        badge: 'bg-emerald-100 text-emerald-700',
        dot: 'bg-emerald-400'
      };
    case 'medium':
      return {
        badge: 'bg-amber-100 text-amber-700',
        dot: 'bg-amber-400'
      };
    case 'low':
      return {
        badge: 'bg-red-100 text-red-600',
        dot: 'bg-red-400'
      };
  }
}
function flagConfig(s: FlagSeverity) {
  switch (s) {
    case 'info':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        text: 'text-blue-800',
        icon: AlertCircleIcon,
        iconColor: 'text-blue-500'
      };
    case 'warning':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        text: 'text-amber-800',
        icon: AlertTriangleIcon,
        iconColor: 'text-amber-500'
      };
    case 'critical':
      return {
        bg: 'bg-red-50',
        border: 'border-red-100',
        text: 'text-red-800',
        icon: XCircleIcon,
        iconColor: 'text-red-500'
      };
  }
}
function flagBadgeColor(flag: string) {
  switch (flag) {
    case 'Salary':
      return 'bg-emerald-100 text-emerald-700';
    case 'EMI':
      return 'bg-indigo-100 text-indigo-700';
    case 'Cash':
      return 'bg-amber-100 text-amber-700';
    case 'High Value':
      return 'bg-orange-100 text-orange-700';
    case 'Bounced':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}
// Sub-components
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
// Main component
interface FinancialWorkspaceProps {
  onBack: () => void;
}
export function FinancialWorkspace({ onBack }: FinancialWorkspaceProps) {
  const [selectedField, setSelectedField] = useState<string | null>('holder');
  const [activePage, setActivePage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rightTab, setRightTab] = useState<RightTab>('summary');
  const [txSearch, setTxSearch] = useState('');
  const activeRegion =
  ACCOUNT_FIELDS.find((f) => f.id === selectedField)?.sourceRegion || null;
  const handleFieldSelect = useCallback((id: string) => {
    setSelectedField((prev) => prev === id ? null : id);
  }, []);
  const filteredTx = txSearch ?
  TRANSACTIONS.filter(
    (t) =>
    t.description.toLowerCase().includes(txSearch.toLowerCase()) ||
    t.date.includes(txSearch)
  ) :
  TRANSACTIONS;
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
            aria-label="Back">
            
            <ArrowLeftIcon className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
              <LandmarkIcon className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">
                bank_statement_q4.pdf
              </h1>
              <p className="text-[11px] text-gray-500">
                Bank Statement · 12 pages · HDFC Bank · Q1 2024
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
            Export CSV
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <CheckCircle2Icon className="w-3.5 h-3.5" />
            Approve
          </button>
        </div>
      </div>

      {/* 3-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL — Page navigator */}
        <div className="w-[160px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Pages
            </p>
            <p className="text-[10px] text-gray-400">{PAGES.length} pages</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {PAGES.map((page) =>
            <button
              key={page.id}
              onClick={() => setActivePage(page.id)}
              className={`w-full rounded-lg border overflow-hidden transition-all ${activePage === page.id ? 'border-indigo-300 ring-2 ring-indigo-100 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
              
                <div className="aspect-[1/1.2] bg-gray-50 relative p-1.5">
                  <div className="w-full h-full bg-white rounded border border-gray-100 p-1.5 flex flex-col gap-0.5">
                    {[1, 2, 3, 4, 5, 6].map((l) =>
                  <div
                    key={l}
                    className="h-px bg-gray-200 rounded"
                    style={{
                      width: `${40 + Math.random() * 60}%`
                    }} />

                  )}
                  </div>
                  <div
                  className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${page.status === 'verified' ? 'bg-emerald-400' : page.status === 'review' ? 'bg-amber-400' : 'bg-gray-300'}`} />
                
                </div>
                <div className="px-1.5 py-1 text-center border-t border-gray-100">
                  <span
                  className={`text-[9px] font-medium ${activePage === page.id ? 'text-indigo-700' : 'text-gray-500'}`}>
                  
                    Pg {page.id}
                  </span>
                </div>
              </button>
            )}
          </div>
          <div className="p-2 border-t border-gray-100 space-y-0.5">
            {[
            {
              icon: RotateCwIcon,
              label: 'Rotate'
            },
            {
              icon: ScissorsIcon,
              label: 'Split'
            },
            {
              icon: RefreshCwIcon,
              label: 'Reclassify'
            },
            {
              icon: EyeOffIcon,
              label: 'Unreadable'
            }].
            map((tool) =>
            <button
              key={tool.label}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-medium text-gray-500 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors">
              
                <tool.icon className="w-3 h-3" />
                {tool.label}
              </button>
            )}
          </div>
        </div>

        {/* CENTER PANEL — Document viewer */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-100">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white flex-shrink-0">
            <span className="text-xs font-medium text-gray-600">
              Page {activePage} of {PAGES.length}
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

          <div className="flex-1 overflow-auto flex items-start justify-center p-6">
            <motion.div
              className="bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden"
              style={{
                width: `${Math.min(600 * zoom / 100, 850)}px`,
                transformOrigin: 'top center'
              }}>
              
              <div className="aspect-[1/1.4] relative p-6 md:p-8">
                {/* Simulated bank statement */}
                <div className="w-full h-full flex flex-col">
                  {/* Bank header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-blue-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-blue-800 flex items-center justify-center">
                        <LandmarkIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="h-3 w-24 bg-blue-800 rounded" />
                        <div className="h-1.5 w-32 bg-gray-300 rounded mt-1" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-2 w-28 bg-gray-700 rounded mb-1 ml-auto" />
                      <div className="h-1.5 w-20 bg-gray-300 rounded ml-auto" />
                    </div>
                  </div>

                  {/* Account info */}
                  <div className="flex gap-6 mb-4">
                    <div className="flex-1">
                      <div className="h-1.5 w-16 bg-gray-400 rounded mb-1.5" />
                      <div className="h-2 w-32 bg-gray-700 rounded mb-1" />
                      <div className="h-1.5 w-28 bg-gray-300 rounded" />
                    </div>
                    <div className="flex-1">
                      <div className="h-1.5 w-20 bg-gray-400 rounded mb-1.5" />
                      <div className="h-2 w-28 bg-gray-700 rounded mb-1" />
                      <div className="h-1.5 w-36 bg-gray-300 rounded" />
                    </div>
                  </div>

                  {/* Table header */}
                  <div className="flex gap-2 pb-1.5 border-b-2 border-gray-300 mb-0.5">
                    <div className="h-1.5 w-12 bg-gray-600 rounded" />
                    <div className="h-1.5 flex-1 bg-gray-600 rounded" />
                    <div className="h-1.5 w-16 bg-gray-600 rounded" />
                    <div className="h-1.5 w-16 bg-gray-600 rounded" />
                    <div className="h-1.5 w-18 bg-gray-600 rounded" />
                  </div>

                  {/* Transaction rows */}
                  <div className="flex-1 space-y-0">
                    {Array.from({
                      length: 18
                    }).map((_, i) =>
                    <div
                      key={i}
                      className={`flex gap-2 py-1.5 border-b border-gray-50 items-center ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                      
                        <div className="h-1 w-10 bg-gray-200 rounded" />
                        <div
                        className="h-1 flex-1 bg-gray-200 rounded"
                        style={{
                          maxWidth: `${80 + Math.random() * 120}px`
                        }} />
                      
                        <div
                        className={`h-1 w-14 rounded ${i % 3 === 0 ? 'bg-gray-100' : 'bg-gray-200'}`} />
                      
                        <div
                        className={`h-1 w-14 rounded ${i % 3 !== 0 ? 'bg-gray-100' : 'bg-gray-200'}`} />
                      
                        <div className="h-1 w-16 bg-gray-200 rounded" />
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between">
                    <div className="h-1.5 w-24 bg-gray-300 rounded" />
                    <div className="h-1.5 w-32 bg-gray-300 rounded" />
                  </div>
                </div>

                {/* Source highlight */}
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
                    className="absolute rounded-md border-2 border-indigo-500 z-10 pointer-events-none"
                    style={{
                      left: `${activeRegion.x}%`,
                      top: `${activeRegion.y}%`,
                      width: `${activeRegion.w}%`,
                      height: `${activeRegion.h}%`,
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
                      className="absolute -top-5 left-1 text-[9px] font-bold text-white bg-indigo-600 px-2 py-0.5 rounded whitespace-nowrap">
                      
                        {
                      ACCOUNT_FIELDS.find((f) => f.id === selectedField)?.
                      label
                      }
                      </motion.div>
                    </motion.div>
                  }
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[360px] lg:w-[400px] flex-shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-gray-200 flex-shrink-0">
            {[
            {
              id: 'summary' as RightTab,
              label: 'Summary'
            },
            {
              id: 'transactions' as RightTab,
              label: `Transactions (${TRANSACTIONS.length})`
            }].
            map((tab) =>
            <button
              key={tab.id}
              onClick={() => setRightTab(tab.id)}
              className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors relative ${rightTab === tab.id ? 'text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}>
              
                {tab.label}
                {rightTab === tab.id &&
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 rounded-full" />

              }
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {rightTab === 'summary' ?
              <motion.div
                key="summary"
                initial={{
                  opacity: 0,
                  x: -8
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                exit={{
                  opacity: 0,
                  x: 8
                }}
                transition={{
                  duration: 0.2
                }}>
                
                  {/* Account Summary */}
                  <CollapsibleSection
                  title="Account Details"
                  icon={LandmarkIcon}
                  count={ACCOUNT_FIELDS.length}
                  defaultOpen>
                  
                    <div className="space-y-2">
                      {ACCOUNT_FIELDS.map((field) => {
                      const conf = confidenceConfig(field.confidence);
                      return (
                        <motion.button
                          key={field.id}
                          onClick={() => handleFieldSelect(field.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${selectedField === field.id ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-100' : 'bg-gray-50 border-gray-100 hover:shadow-sm'}`}
                          whileTap={{
                            scale: 0.995
                          }}>
                          
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                  {field.label}
                                </span>
                                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                  {field.value}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <div
                                className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                              
                                {field.sourceRegion &&
                              <LinkIcon
                                className={`w-3 h-3 ${selectedField === field.id ? 'text-indigo-500' : 'text-gray-300'}`} />

                              }
                                <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-0.5 rounded hover:bg-white/80">
                                
                                  <PencilIcon className="w-3 h-3 text-gray-400" />
                                </button>
                              </div>
                            </div>
                          </motion.button>);

                    })}
                    </div>
                  </CollapsibleSection>

                  {/* Transaction Summary */}
                  <CollapsibleSection
                  title="Transaction Summary"
                  icon={TrendingUpIcon}
                  defaultOpen>
                  
                    <div className="grid grid-cols-2 gap-2">
                      {SUMMARY_METRICS.map((metric) => {
                      const MIcon = metric.icon;
                      return (
                        <div
                          key={metric.label}
                          className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                          
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <MIcon
                              className={`w-3.5 h-3.5 ${metric.color}`} />
                            
                              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                {metric.label}
                              </span>
                            </div>
                            <p
                            className={`text-sm font-bold tabular-nums ${metric.color}`}>
                            
                              {metric.value}
                            </p>
                            {metric.subtext &&
                          <p className="text-[10px] text-gray-400 mt-0.5">
                                {metric.subtext}
                              </p>
                          }
                          </div>);

                    })}
                    </div>
                  </CollapsibleSection>

                  {/* Flags & Insights */}
                  <CollapsibleSection
                  title="Flags & Insights"
                  icon={FlagIcon}
                  count={FLAGS.length}
                  defaultOpen>
                  
                    <div className="space-y-2">
                      {FLAGS.map((flag) => {
                      const fc = flagConfig(flag.severity);
                      const FIcon = fc.icon;
                      return (
                        <div
                          key={flag.id}
                          className={`flex items-start gap-2.5 p-3 rounded-xl border ${fc.bg} ${fc.border}`}>
                          
                            <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${fc.bg}`}>
                            
                              <FIcon
                              className={`w-3.5 h-3.5 ${fc.iconColor}`} />
                            
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                className={`text-xs font-semibold ${fc.text}`}>
                                
                                  {flag.label}
                                </p>
                                {flag.count &&
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/60 text-gray-600">
                                    ×{flag.count}
                                  </span>
                              }
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                {flag.detail}
                              </p>
                            </div>
                          </div>);

                    })}
                    </div>
                  </CollapsibleSection>
                </motion.div> :

              <motion.div
                key="transactions"
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
                
                  {/* Search */}
                  <div className="p-3 border-b border-gray-100 flex-shrink-0">
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                      type="text"
                      value={txSearch}
                      onChange={(e) => setTxSearch(e.target.value)}
                      placeholder="Search transactions..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all" />
                    
                    </div>
                  </div>

                  {/* Transaction table */}
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-left">
                      <thead className="sticky top-0 bg-gray-50 z-10">
                        <tr className="border-b border-gray-200">
                          <th className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-2 px-3">
                            Date
                          </th>
                          <th className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-2 px-3">
                            Description
                          </th>
                          <th className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-2 px-3 text-right">
                            Debit
                          </th>
                          <th className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-2 px-3 text-right">
                            Credit
                          </th>
                          <th className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-2 px-3 text-right">
                            Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTx.map((tx, i) => {
                        const conf = confidenceConfig(tx.confidence);
                        return (
                          <tr
                            key={tx.id}
                            className={`border-b border-gray-50 hover:bg-indigo-50/30 transition-colors ${tx.flag === 'Bounced' ? 'bg-red-50/30' : tx.flag === 'Cash' || tx.flag === 'High Value' ? 'bg-amber-50/20' : i % 2 === 1 ? 'bg-gray-50/30' : ''}`}>
                            
                              <td className="text-[11px] text-gray-500 py-2 px-3 tabular-nums whitespace-nowrap">
                                {tx.date}
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] text-gray-800 truncate max-w-[160px]">
                                    {tx.description}
                                  </span>
                                  {tx.flag &&
                                <span
                                  className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${flagBadgeColor(tx.flag)}`}>
                                  
                                      {tx.flag}
                                    </span>
                                }
                                </div>
                                <div
                                className={`w-1 h-1 rounded-full inline-block ml-1 ${conf.dot}`} />
                              
                              </td>
                              <td
                              className={`text-[11px] font-medium py-2 px-3 text-right tabular-nums ${tx.debit ? 'text-red-600' : 'text-gray-300'}`}>
                              
                                {tx.debit || '—'}
                              </td>
                              <td
                              className={`text-[11px] font-medium py-2 px-3 text-right tabular-nums ${tx.credit ? 'text-emerald-600' : 'text-gray-300'}`}>
                              
                                {tx.credit || '—'}
                              </td>
                              <td className="text-[11px] font-medium text-gray-800 py-2 px-3 text-right tabular-nums">
                                {tx.balance}
                              </td>
                            </tr>);

                      })}
                      </tbody>
                    </table>
                  </div>

                  {/* Table footer */}
                  <div className="p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">
                      {filteredTx.length} transactions
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-medium text-red-600">
                        Debits: ₹6,18,340
                      </span>
                      <span className="text-[10px] font-medium text-emerald-600">
                        Credits: ₹8,42,500
                      </span>
                    </div>
                  </div>
                </motion.div>
              }
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>);

}