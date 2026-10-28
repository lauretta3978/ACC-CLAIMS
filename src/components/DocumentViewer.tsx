import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, FileText, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface DocumentViewerProps {
  currentPreviewUrl?: string;
  documentTitle?: string;
  sourceFiles?: Array<{ name: string; url: string }>;
  onClose?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  currentPreviewUrl,
  documentTitle = 'Ingested Corporate Claim Form & Scanned Receipts',
  sourceFiles = [],
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const activeUrl = sourceFiles[selectedDocIndex]?.url || currentPreviewUrl;
  const activeTitle = sourceFiles[selectedDocIndex]?.name || documentTitle;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  if (!activeUrl) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center min-h-[350px]">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">No Document Selected</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Upload a claim form PDF or receipt image, or select a preloaded sample to preview side-by-side.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl bg-slate-900 border-slate-700' : 'h-full min-h-[460px]'
      }`}
    >
      {/* Header Bar */}
      <div className={`px-5 py-3.5 flex items-center justify-between border-b ${
        isFullscreen ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50/70 border-slate-100 text-slate-800'
      }`}>
        <div className="flex items-center space-x-2 truncate">
          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs font-bold truncate max-w-[200px] sm:max-w-xs text-slate-900">
            {activeTitle}
          </span>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Receipt File
          </span>
        </div>

        {/* Viewer Tools */}
        <div className="flex items-center space-x-1">
          <span className="text-xs text-slate-500 mr-2 font-mono hidden sm:inline">
            {zoom}%
          </span>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-slate-300 mx-1" />
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Document Canvas View */}
      <div className={`relative flex-1 overflow-auto p-4 flex items-center justify-center ${
        isFullscreen ? 'bg-slate-950' : 'bg-slate-100'
      }`}>
        <div
          className="transition-transform duration-200 origin-top shadow-lg rounded-md overflow-hidden bg-white max-w-full"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {activeUrl.startsWith('data:image/') || activeUrl.endsWith('.png') || activeUrl.endsWith('.jpg') || activeUrl.endsWith('.jpeg') || activeUrl.endsWith('.svg') ? (
            <img
              src={activeUrl}
              alt="Scanned Claim Document"
              className="max-w-full h-auto object-contain block mx-auto select-none"
            />
          ) : (
            <iframe
              src={activeUrl}
              title="PDF Claim Viewer"
              className="w-[700px] h-[800px] border-0"
            />
          )}
        </div>
      </div>

      {/* Multiple Files Pagination / Selector if provided */}
      {sourceFiles.length > 1 && (
        <div className="px-4 py-2 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-600">
          <span>
            Document {selectedDocIndex + 1} of {sourceFiles.length}
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setSelectedDocIndex((p) => Math.max(p - 1, 0))}
              disabled={selectedDocIndex === 0}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDocIndex((p) => Math.min(p + 1, sourceFiles.length - 1))}
              disabled={selectedDocIndex === sourceFiles.length - 1}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
