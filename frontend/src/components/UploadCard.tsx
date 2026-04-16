import React, { useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloudIcon,
  CameraIcon,
  FileTextIcon,
  MonitorIcon,
  XIcon,
  CheckCircle2Icon,
  Loader2Icon } from
'lucide-react';
import { DocumentTypeChips } from './DocumentTypeChips';
type UploadState =
'idle' |
'drag-over' |
'uploading' |
'processing' |
'complete';
interface FileInfo {
  name: string;
  size: string;
  type: string;
}
interface UploadCardProps {
  onCameraClick?: () => void;
  onViewExtractedData?: () => void;
  initialUpload?: FileInfo | null;
}
export function UploadCard({
  onCameraClick,
  onViewExtractedData,
  initialUpload
}: UploadCardProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const simulateUpload = useCallback((file: FileInfo) => {
    setFileInfo(file);
    setUploadState('uploading');
    setProgress(0);
  }, []);
  // Handle initial upload from camera capture
  useEffect(() => {
    if (initialUpload) {
      simulateUpload(initialUpload);
    }
  }, [initialUpload, simulateUpload]);
  useEffect(() => {
    if (uploadState !== 'uploading') return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadState('processing');
          setTimeout(() => setUploadState('complete'), 1800);
          return 100;
        }
        return prev + Math.random() * 12 + 3;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [uploadState]);
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) {
      setUploadState('drag-over');
    }
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setUploadState('idle');
    }
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const f = files[0];
        simulateUpload({
          name: f.name,
          size: `${(f.size / 1024).toFixed(1)} KB`,
          type: f.type || 'application/pdf'
        });
      }
    },
    [simulateUpload]
  );
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const f = files[0];
        simulateUpload({
          name: f.name,
          size: `${(f.size / 1024).toFixed(1)} KB`,
          type: f.type || 'application/pdf'
        });
      }
    },
    [simulateUpload]
  );
  const handleTrySample = useCallback(() => {
    simulateUpload({
      name: 'sample_invoice_2024.pdf',
      size: '342.8 KB',
      type: 'application/pdf'
    });
  }, [simulateUpload]);
  const handleReset = useCallback(() => {
    setUploadState('idle');
    setProgress(0);
    setFileInfo(null);
    dragCounterRef.current = 0;
  }, []);
  const isDragging = uploadState === 'drag-over';
  const isActive =
  uploadState === 'uploading' ||
  uploadState === 'processing' ||
  uploadState === 'complete';
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.6,
        delay: 0.35,
        ease: 'easeOut'
      }}
      className="w-full max-w-2xl mx-auto px-4">
      
      <motion.div
        animate={{
          scale: isDragging ? 1.02 : 1,
          boxShadow: isDragging ?
          '0 0 0 3px rgba(79, 70, 229, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.08)' :
          '0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 32px -8px rgba(0, 0, 0, 0.06)'
        }}
        transition={{
          duration: 0.25,
          ease: 'easeOut'
        }}
        className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 relative overflow-hidden"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp"
          onChange={handleFileSelect} />
        

        <AnimatePresence mode="wait">
          {!isActive ?
          <motion.div
            key="upload-zone"
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.98
            }}
            transition={{
              duration: 0.25
            }}>
            
              {/* Drop zone */}
              <motion.div
              animate={{
                borderColor: isDragging ? '#4F46E5' : '#E5E7EB',
                backgroundColor: isDragging ?
                'rgba(79, 70, 229, 0.03)' :
                'rgba(249, 250, 251, 0.5)'
              }}
              transition={{
                duration: 0.2
              }}
              className="border-2 border-dashed rounded-xl p-8 md:p-10 flex flex-col items-center text-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload document"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}>
              
                <motion.div
                animate={{
                  scale: isDragging ? 1.1 : 1,
                  color: isDragging ? '#4F46E5' : '#9CA3AF'
                }}
                transition={{
                  duration: 0.2
                }}>
                
                  <UploadCloudIcon className="w-10 h-10 mb-4" />
                </motion.div>

                <AnimatePresence mode="wait">
                  {isDragging ?
                <motion.p
                  key="drag-text"
                  initial={{
                    opacity: 0,
                    y: 4
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  exit={{
                    opacity: 0,
                    y: -4
                  }}
                  className="text-sm font-semibold text-indigo-600">
                  
                      Drop your document here
                    </motion.p> :

                <motion.div
                  key="default-text"
                  initial={{
                    opacity: 0,
                    y: 4
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  exit={{
                    opacity: 0,
                    y: -4
                  }}>
                  
                      <p className="text-sm font-medium text-gray-700">
                        Drag and drop your document here
                      </p>
                      <p className="text-xs text-gray-400 mt-1.5">
                        PDF, JPG, PNG, or scanned documents up to 25MB
                      </p>
                    </motion.div>
                }
                </AnimatePresence>
              </motion.div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-5">
                <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm">
                
                  <MonitorIcon className="w-4 h-4" />
                  Upload from Device
                </button>
                <button
                onClick={onCameraClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                
                  <CameraIcon className="w-4 h-4" />
                  Capture with Camera
                </button>
                <button
                onClick={handleTrySample}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-gray-500 text-sm font-medium rounded-lg hover:text-gray-700 hover:bg-gray-50 transition-colors">
                
                  <FileTextIcon className="w-4 h-4" />
                  Try Sample File
                </button>
              </div>

              {/* Document type chips */}
              <DocumentTypeChips />
            </motion.div> :

          <motion.div
            key="progress-zone"
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
              duration: 0.3
            }}
            className="py-4">
            
              {/* File preview */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <FileTextIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {fileInfo?.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {fileInfo?.size}
                      </p>
                    </div>
                    {uploadState === 'complete' ?
                  <motion.div
                    initial={{
                      scale: 0
                    }}
                    animate={{
                      scale: 1
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 15
                    }}>
                    
                        <CheckCircle2Icon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      </motion.div> :

                  <button
                    onClick={handleReset}
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
                    aria-label="Cancel upload">
                    
                        <XIcon className="w-4 h-4 text-gray-400" />
                      </button>
                  }
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                      className={`h-full rounded-full ${uploadState === 'complete' ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                      initial={{
                        width: '0%'
                      }}
                      animate={{
                        width: `${Math.min(progress, 100)}%`
                      }}
                      transition={{
                        duration: 0.15,
                        ease: 'linear'
                      }} />
                    
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        {uploadState === 'processing' &&
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
                      }
                        <p className="text-xs text-gray-500">
                          {uploadState === 'uploading' &&
                        'Uploading document...'}
                          {uploadState === 'processing' &&
                        'Extracting structured data...'}
                          {uploadState === 'complete' &&
                        'Document processed successfully'}
                        </p>
                      </div>
                      {uploadState === 'uploading' &&
                    <p className="text-xs font-medium text-gray-600">
                          {Math.min(Math.round(progress), 100)}%
                        </p>
                    }
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete state action */}
              <AnimatePresence>
                {uploadState === 'complete' &&
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
                  duration: 0.3,
                  delay: 0.2
                }}
                className="mt-6 flex items-center justify-center gap-3">
                
                    <button
                  onClick={onViewExtractedData}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                  
                      View Extracted Data
                    </button>
                    <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  
                      Upload Another
                    </button>
                  </motion.div>
              }
              </AnimatePresence>
            </motion.div>
          }
        </AnimatePresence>
      </motion.div>
    </motion.div>);

}