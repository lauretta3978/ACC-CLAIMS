import React, { useState, useRef } from 'react';
import { Upload, FileUp, Sparkles, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { ClaimRecord, SampleClaimPackage, UploadedDoc } from '../types';
import { SAMPLE_CLAIM_PACKAGES } from '../data/sampleClaims';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimsExtracted: (items: ClaimRecord[], sourceDoc: UploadedDoc) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onClaimsExtracted,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [staffNameHint, setStaffNameHint] = useState<string>('Vigneshwaran A/L Suriyakumaran');
  const [claimMonthHint, setClaimMonthHint] = useState<string>('October 2026');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(
      (f) =>
        f.type === 'application/pdf' ||
        f.type.startsWith('image/') ||
        f.name.endsWith('.pdf') ||
        f.name.endsWith('.png') ||
        f.name.endsWith('.jpg') ||
        f.name.endsWith('.jpeg')
    );
    if (validFiles.length === 0) {
      setErrorMessage('Please upload PDF or image files (PDF, PNG, JPG, WebP).');
      return;
    }
    setErrorMessage(null);
    setSelectedFiles(validFiles);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleStartExtraction = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setProgressStep('Ingesting receipts & documents...');

    try {
      const filePayloads = await Promise.all(
        selectedFiles.map(async (file) => {
          const base64 = await fileToBase64(file);
          return {
            name: file.name,
            type: file.type || 'application/pdf',
            base64,
          };
        })
      );

      setProgressStep('Running Google AI Studio (gemini-3.8-flash OCR)...');

      const response = await fetch('/api/extract-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: filePayloads,
          staffNameHint: staffNameHint.trim() || undefined,
          claimMonthHint: claimMonthHint.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract claim data from document.');
      }

      setProgressStep('Mapping official EMO account codes & category subtotals...');

      const firstFile = selectedFiles[0];
      const previewUrl = URL.createObjectURL(firstFile);

      const sourceDoc: UploadedDoc = {
        id: `doc-${Date.now()}`,
        name: firstFile.name,
        type: firstFile.type,
        size: firstFile.size,
        previewUrl,
        base64: filePayloads[0].base64,
      };

      onClaimsExtracted(data.items, sourceDoc);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during extraction.');
    } finally {
      setIsProcessing(false);
      setProgressStep('');
    }
  };

  const handleSelectSample = (sample: SampleClaimPackage) => {
    const sourceDoc: UploadedDoc = {
      id: sample.id,
      name: `${sample.employee} - ${sample.month} Claim.pdf`,
      type: 'image/svg+xml',
      size: 45000,
      previewUrl: sample.docPreviewUrl,
      base64: sample.docPreviewUrl,
    };
    onClaimsExtracted(sample.items, sourceDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden relative">
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center">
              <FileUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Upload Receipts &amp; Invoices
              </h3>
              <p className="text-xs text-slate-500">
                Processed with Google AI Studio <span className="font-mono font-bold text-slate-800">gemini-3.8-flash</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Quick Preloaded Vicky's Claim */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Instant 1-Click Test Package
              </span>
              <span className="text-[11px] text-blue-600 font-semibold">Ready to Load</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAMPLE_CLAIM_PACKAGES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  disabled={isProcessing}
                  className="text-left p-4 rounded-2xl border border-slate-200 hover:border-slate-950 hover:shadow-xs transition-all group flex flex-col justify-between bg-white"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 leading-snug">
                      {sample.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {sample.employee} • {sample.month}
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">
                      RM {sample.totalAmount.toFixed(2)}
                    </span>
                    <span className="text-slate-400 group-hover:text-slate-950 group-hover:translate-x-0.5 transition-all font-bold">
                      Load &rarr;
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-100" />
            <span className="shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Or Drag &amp; Drop Your Documents
            </span>
            <div className="grow border-t border-slate-100" />
          </div>

          {/* Upload Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-slate-950 bg-slate-50'
                : selectedFiles.length > 0
                ? 'border-emerald-500 bg-emerald-50/20'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="application/pdf,image/png,image/jpeg,image/webp"
              onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center mb-3 shadow-2xs">
                <Upload className="w-5 h-5 text-slate-900" />
              </div>
              <p className="text-xs font-bold text-slate-900">
                Click or drag &amp; drop receipts, PDFs, or invoices
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports consolidated Claim PDFs, scanned receipts (PNG, JPG, WebP)
              </p>
              {selectedFiles.length > 0 && (
                <div className="mt-3 inline-flex items-center px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  {selectedFiles.length} file(s) selected: {selectedFiles.map((f) => f.name).join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Claimant Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Staff Claimant Name
              </label>
              <input
                type="text"
                placeholder="e.g., Vigneshwaran A/L Suriyakumaran"
                value={staffNameHint}
                onChange={(e) => setStaffNameHint(e.target.value)}
                disabled={isProcessing}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Claim Month &amp; Period
              </label>
              <input
                type="text"
                placeholder="e.g., October 2026"
                value={claimMonthHint}
                onChange={(e) => setClaimMonthHint(e.target.value)}
                disabled={isProcessing}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Processing Status Banner */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-950 border-t-transparent shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  AI Extraction In Progress
                </p>
                <p className="text-xs text-slate-600 animate-pulse mt-0.5">
                  {progressStep}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStartExtraction}
            disabled={selectedFiles.length === 0 || isProcessing}
            className={`inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl shadow-md transition-all ${
              selectedFiles.length > 0 && !isProcessing
                ? 'bg-slate-950 hover:bg-slate-900 text-white shadow-slate-950/10'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            Extract with gemini-3.8-flash
          </button>
        </div>
      </div>
    </div>
  );
};
