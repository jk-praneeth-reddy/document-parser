import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Navbar } from './components/Navbar'
import { HeroSection } from './components/HeroSection'
import { UploadCard } from './components/UploadCard'
import { TrustIndicators } from './components/TrustIndicators'
import { BackgroundDecoration } from './components/BackgroundDecoration'
import { CameraCapture } from './components/CameraCapture'
import { DocumentQueue } from './components/DocumentQueue'
import { AIProcessing } from './components/AIProcessing'
import { InvoiceWorkspace } from './components/InvoiceWorkspace'
import { KYCWorkspace } from './components/KYCWorkspace'
import { FinancialWorkspace } from './components/FinancialWorkspace'
import { ReviewMode } from './components/ReviewMode'
import { ExceptionState } from './components/ExceptionState'
import { ExportScreen } from './components/ExportScreen'

interface CapturedFile {
  name: string
  size: string
  type: string
}

type Screen =
  | 'landing'
  | 'camera'
  | 'processing'
  | 'queue'
  | 'workspace'
  | 'kyc-workspace'
  | 'financial-workspace'
  | 'review'
  | 'exception'
  | 'export'

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [capturedFile, setCapturedFile] = useState<CapturedFile | null>(null)

  const go = (s: Screen) => () => setScreen(s)

  const handleCameraCapture = () => {
    setCapturedFile({
      name: 'camera_capture.jpg',
      size: '1.2 MB',
      type: 'image/jpeg',
    })
    setScreen('landing')
  }

  const handleBackToLanding = () => {
    setCapturedFile(null)
    setScreen('landing')
  }

  // TODO: Replace demo handlers with real backend API calls
  // import api from './utils/api'
  // const handleUpload = async (file: File) => {
  //   const formData = new FormData()
  //   formData.append('document', file)
  //   const res = await api.post('/documents/upload', formData)
  //   return res.data
  // }

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] relative">
      <AnimatePresence mode="wait">
        {screen === 'camera' ? (
          <CameraCapture
            key="camera"
            onClose={go('landing')}
            onCapture={handleCameraCapture}
          />
        ) : screen === 'processing' ? (
          <div key="processing" className="w-full min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1">
              <AIProcessing onComplete={go('queue')} />
            </div>
          </div>
        ) : screen === 'workspace' ? (
          <div key="workspace" className="w-full h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 overflow-hidden">
              <InvoiceWorkspace onBack={go('queue')} />
            </div>
          </div>
        ) : screen === 'kyc-workspace' ? (
          <div key="kyc-workspace" className="w-full h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 overflow-hidden">
              <KYCWorkspace onBack={go('queue')} />
            </div>
          </div>
        ) : screen === 'financial-workspace' ? (
          <div
            key="financial-workspace"
            className="w-full h-screen flex flex-col"
          >
            <Navbar />
            <div className="flex-1 overflow-hidden">
              <FinancialWorkspace onBack={go('queue')} />
            </div>
          </div>
        ) : screen === 'review' ? (
          <div key="review" className="w-full h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 overflow-hidden">
              <ReviewMode onBack={go('queue')} onComplete={go('export')} />
            </div>
          </div>
        ) : screen === 'exception' ? (
          <div key="exception" className="w-full h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 overflow-hidden">
              <ExceptionState
                onBack={go('queue')}
                onRetake={() => setScreen('camera')}
                onReupload={handleBackToLanding}
              />
            </div>
          </div>
        ) : screen === 'export' ? (
          <div key="export" className="w-full h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 overflow-hidden">
              <ExportScreen onBack={go('queue')} onDone={handleBackToLanding} />
            </div>
          </div>
        ) : screen === 'queue' ? (
          <div key="queue" className="w-full min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1">
              <DocumentQueue
                onBack={handleBackToLanding}
                onOpenWorkspace={go('workspace')}
                onOpenKYCWorkspace={go('kyc-workspace')}
                onOpenFinancialWorkspace={go('financial-workspace')}
                onOpenReview={go('review')}
                onOpenException={go('exception')}
              />
            </div>
          </div>
        ) : (
          <div key="landing" className="w-full min-h-screen">
            <BackgroundDecoration />
            <Navbar />
            <main className="relative z-10 pt-16 md:pt-24 pb-20">
              <HeroSection />
              <div className="mt-10 md:mt-12">
                <UploadCard
                  onCameraClick={go('camera')}
                  onViewExtractedData={go('processing')}
                  initialUpload={capturedFile}
                />
              </div>
              <TrustIndicators />
            </main>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
