"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Card {
  id: string;
  title: string;
  pdfUrl: string;
  description: string;
}

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Card | null;
  certificates: Card[];
}

export default function CertificateModal({
  isOpen,
  onClose,
  certificate,
  certificates,
}: CertificateModalProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [pdfLoadError, setPdfLoadError] = useState<boolean>(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(true);
  const [useDirectUrl, setUseDirectUrl] = useState<boolean>(false);

  // Set the current index when the certificate changes
  useEffect(() => {
    if (certificate) {
      const index = certificates.findIndex(
        (cert) => cert.id === certificate.id
      );
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
    // Reset states when certificate changes
    setPdfLoadError(false);
    setIsLoadingPdf(true);
    setUseDirectUrl(false);
  }, [certificate, certificates]);

  const handleNext = useCallback(() => {
    if (currentIndex < certificates.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setPdfLoadError(false);
      setIsLoadingPdf(true);
      setUseDirectUrl(false);
    }
  }, [currentIndex, certificates.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setPdfLoadError(false);
      setIsLoadingPdf(true);
      setUseDirectUrl(false);
    }
  }, [currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    currentIndex,
    certificates.length,
    onClose,
    handleNext,
    handlePrevious,
  ]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!certificates.length || currentIndex >= certificates.length) {
    return null;
  }

  const currentCertificate = certificates[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && currentCertificate && (
        <motion.div
          {...{
            className:
              "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 backdrop-blur-sm sm:p-4",
            onClick: onClose,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Modal Content */}
          <motion.div
            {...{
              className:
                "relative w-full max-w-5xl overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl sm:w-[90%]",
              onClick: (e: React.MouseEvent<HTMLDivElement>) =>
                e.stopPropagation(),
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            <Button
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
              onClick={onClose}
              aria-label="Close modal"
              size="icon"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Certificate viewer - Vertical layout */}
            <div className="flex h-[94dvh] max-h-[94dvh] flex-col sm:h-[80vh] sm:max-h-[80vh]">
              {/* PDF viewer on top */}
              <div className="flex-1 bg-slate-800 relative">
                {isLoadingPdf && !pdfLoadError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-500 mx-auto mb-4"></div>
                      <p className="text-slate-400">Loading PDF...</p>
                    </div>
                  </div>
                )}

                {pdfLoadError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <div className="text-center p-8 max-w-md">
                      <div className="bg-zinc-900/20 border border-zinc-800/30 rounded-lg p-6 mb-4">
                        <svg
                          className="w-12 h-12 text-zinc-400 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.684-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <h3 className="text-lg font-semibold text-zinc-400 mb-2">
                          PDF Preview Unavailable
                        </h3>
                        <p className="text-slate-300 text-sm mb-4">
                          Unable to load the PDF preview. This may be due to
                          browser restrictions or file access issues.
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setPdfLoadError(false);
                              setIsLoadingPdf(true);
                              setUseDirectUrl(!useDirectUrl);
                            }}
                            className="w-full bg-zinc-600 hover:bg-zinc-700 text-white py-2 px-4 rounded-md transition-colors text-sm"
                          >
                            Try {useDirectUrl ? "Proxy" : "Direct"} Mode
                          </button>
                          <a
                            href={currentCertificate.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-zinc-600 hover:bg-zinc-700 text-white py-2 px-4 rounded-md transition-colors text-sm text-center"
                          >
                            Open in New Tab
                          </a>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        Mode: {useDirectUrl ? "Direct URL" : "Proxy URL"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        URL: {currentCertificate.pdfUrl.substring(0, 60)}...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {(() => {
                      console.log(
                        "Certificate PDF URL:",
                        currentCertificate.pdfUrl
                      );

                      const pdfUrl = useDirectUrl
                        ? currentCertificate.pdfUrl
                        : `/api/view-pdf?id=${encodeURIComponent(currentCertificate.id)}`;

                      console.log("Using PDF URL:", pdfUrl);
                      console.log("Mode:", useDirectUrl ? "Direct" : "Proxy");

                      return (
                        <>
                          {/* Primary PDF viewer - iframe */}
                          <iframe
                            src={pdfUrl}
                            className="w-full h-full border-0"
                            title={currentCertificate.title}
                            style={{ border: "none" }}
                            onLoad={() => {
                              console.log(
                                `PDF iframe loaded successfully (${
                                  useDirectUrl ? "Direct" : "Proxy"
                                } mode)`
                              );
                              setIsLoadingPdf(false);
                            }}
                            onError={(e) => {
                              console.error(
                                `PDF iframe error (${
                                  useDirectUrl ? "Direct" : "Proxy"
                                } mode):`,
                                e
                              );
                              setTimeout(() => {
                                if (isLoadingPdf) {
                                  setPdfLoadError(true);
                                  setIsLoadingPdf(false);
                                }
                              }, 5000);
                            }}
                          />

                          <embed
                            src={pdfUrl}
                            type="application/pdf"
                            className="w-full h-full absolute inset-0 opacity-0 pointer-events-none"
                            style={{ zIndex: -1 }}
                          />
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Certificate info below */}
              <div className="w-full border-t border-slate-700 bg-slate-800/50 p-4 sm:p-6">
                <div className="max-w-3xl mx-auto">
                  <div className="mb-8">
                    <h2 className="mb-2 flex items-center gap-3 break-words pr-10 text-xl font-bold text-slate-100 sm:text-3xl">
                      <span className="inline-flex p-2 rounded-lg bg-zinc-900/20 text-zinc-400 shadow-lg shadow-zinc-500/20 border border-zinc-800/30">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-award"
                        >
                          <circle cx="12" cy="8" r="6" />
                          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                        </svg>
                      </span>
                      {currentCertificate.title}
                    </h2>
                  </div>
                  <p className="text-slate-300 text-sm mb-6">
                    {currentCertificate.description}
                  </p>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        variant="outline"
                        className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </Button>
                      <Button
                        onClick={handleNext}
                        disabled={currentIndex === certificates.length - 1}
                        variant="outline"
                        className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200 disabled:opacity-50"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-center text-sm text-slate-400">
                      {currentIndex + 1} of {certificates.length}
                    </div>

                    <div className="flex items-center gap-4">
                      <a
                        href={`/api/download-certificate?id=${currentCertificate.id}`}
                        className="flex items-center justify-center gap-2 bg-zinc-600 hover:bg-zinc-700 text-white py-2 px-4 rounded-md transition-colors"
                        download
                        onClick={(e) => {
                          console.log(
                            "Download clicked for certificate ID:",
                            currentCertificate.id
                          );
                        }}
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Certificate</span>
                      </a>

                      <a
                        href={currentCertificate.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-zinc-600 hover:bg-zinc-700 text-white py-2 px-4 rounded-md transition-colors"
                        onClick={(e) => {
                          console.log(
                            "Direct view clicked for PDF:",
                            currentCertificate.pdfUrl
                          );
                        }}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        <span>View Direct</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
