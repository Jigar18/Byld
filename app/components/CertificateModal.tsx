"use client";

import type { PortfolioCertificate } from "@/types/portfolio";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, ExternalLink } from "lucide-react";
import { Button, ButtonSpinner } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: PortfolioCertificate | null;
  certificates: PortfolioCertificate[];
}

export default function CertificateModal({
  isOpen,
  onClose,
  certificate,
  certificates,
}: CertificateModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [useDirectUrl, setUseDirectUrl] = useState(false);
  const lastIndex = certificates.length - 1;

  const showCertificate = (index: number) => {
    setCurrentIndex(index);
    setPdfLoadError(false);
    setIsLoadingPdf(true);
    setUseDirectUrl(false);
  };
  const handleNext = () => {
    if (currentIndex < lastIndex) showCertificate(currentIndex + 1);
  };
  const handlePrevious = () => {
    if (currentIndex > 0) showCertificate(currentIndex - 1);
  };

  useEffect(() => {
    const index = certificate ? certificates.findIndex((cert) => cert.id === certificate.id) : -1;
    if (index !== -1) setCurrentIndex(index);
    setPdfLoadError(false);
    setIsLoadingPdf(true);
    setUseDirectUrl(false);
  }, [certificate, certificates]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") handleNext();
    else if (e.key === "ArrowLeft") handlePrevious();
  };
  // Re-bind on each render so the handler always sees the current index.
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const currentCertificate = certificates[currentIndex] as PortfolioCertificate | undefined;
  // Served through the app by default; the file's own address is the fallback when that preview fails.
  const pdfUrl = currentCertificate
    ? useDirectUrl
      ? currentCertificate.pdfUrl
      : `/api/view-pdf?id=${encodeURIComponent(currentCertificate.id)}`
    : "";

  return (
    <Dialog
      open={isOpen && Boolean(currentCertificate)}
      onClose={onClose}
      title={currentCertificate?.title ?? ""}
      size="xl"
      bodyClassName="p-0 sm:p-0"
      footer={
        currentCertificate && (
          <>
            {certificates.length > 1 && (
              <>
                <span className="mr-auto text-sm tabular-nums text-ink-soft">
                  Certificate {currentIndex + 1} of {certificates.length}
                </span>
                <Button variant="secondary" size="sm" onClick={handlePrevious} disabled={currentIndex === 0}>
                  <ChevronLeft aria-hidden="true" />
                  Previous
                </Button>
                <Button variant="secondary" size="sm" onClick={handleNext} disabled={currentIndex === lastIndex}>
                  Next
                  <ChevronRight aria-hidden="true" />
                </Button>
              </>
            )}
            <Button asChild variant="ghost" size="sm">
              <a href={currentCertificate.pdfUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden="true" />
                Open in a new tab
              </a>
            </Button>
            <Button asChild size="sm">
              <a href={`/api/download-certificate?id=${currentCertificate.id}`} download>
                <Download aria-hidden="true" />
                Download
              </a>
            </Button>
          </>
        )
      }
    >
      {currentCertificate && (
        <>
          <div className="relative h-[56dvh] min-h-[300px] bg-black sm:h-[62dvh]">
            {pdfLoadError ? (
              <div className="absolute inset-0 grid place-items-center bg-paper p-6 text-center">
                <div>
                  <p className="font-display text-xl font-semibold">The preview didn’t load</p>
                  <p className="mx-auto mt-1.5 max-w-[44ch] text-[15px] leading-relaxed text-ink-soft">
                    Your browser may be blocking it. Try loading it another way, or open the file in a new tab.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-5"
                    onClick={() => {
                      setPdfLoadError(false);
                      setIsLoadingPdf(true);
                      setUseDirectUrl(!useDirectUrl);
                    }}
                  >
                    Try another way
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <iframe
                  key={pdfUrl}
                  src={pdfUrl}
                  className="size-full border-0"
                  title={currentCertificate.title}
                  onLoad={() => setIsLoadingPdf(false)}
                  onError={() => {
                    setPdfLoadError(true);
                    setIsLoadingPdf(false);
                  }}
                />
                {isLoadingPdf && (
                  <p role="status" className="absolute inset-0 flex items-center justify-center gap-2.5 bg-paper text-[15px] text-ink-soft">
                    <ButtonSpinner />
                    Loading certificate…
                  </p>
                )}
              </>
            )}
          </div>

          {currentCertificate.description && (
            <p className="max-w-[78ch] whitespace-pre-wrap px-5 py-5 leading-relaxed text-ink-soft sm:px-7">
              {currentCertificate.description}
            </p>
          )}
        </>
      )}
    </Dialog>
  );
}
