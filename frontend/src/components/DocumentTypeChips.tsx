import {
  ReceiptTextIcon,
  CreditCardIcon,
  FingerprintIcon,
  BookOpenIcon,
  CarIcon,
  LandmarkIcon,
  BarChart3Icon,
  PenToolIcon,
  FilesIcon,
  ImageIcon,
  FileTextIcon,
} from 'lucide-react'

const documentTypes = [
  { label: 'Invoice', icon: ReceiptTextIcon },
  { label: 'PAN Card', icon: CreditCardIcon },
  { label: 'Aadhaar', icon: FingerprintIcon },
  { label: 'Passport', icon: BookOpenIcon },
  { label: 'Driving License', icon: CarIcon },
  { label: 'Bank Statement', icon: LandmarkIcon },
  { label: 'Financial Report', icon: BarChart3Icon },
  { label: 'Handwritten Notes', icon: PenToolIcon },
  { label: 'Multi-page PDF', icon: FilesIcon },
  { label: 'Scanned Image', icon: ImageIcon },
  { label: 'Any Document', icon: FileTextIcon },
]

export function DocumentTypeChips() {
  return (
    <div className="flex flex-wrap gap-2">
      {documentTypes.map((doc) => {
        const IconComp = doc.icon
        return (
          <span
            key={doc.label}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 select-none"
          >
            <IconComp className="w-3.5 h-3.5 text-gray-400" />
            {doc.label}
          </span>
        )
      })}
    </div>
  )
}
