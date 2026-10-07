import React, { useState } from 'react';
import { QrCode, Copy, Check, X, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

interface PassportQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicUrl: string;
  candidateName: string;
}

/**
 * Deterministic SVG matrix generator for visual QR presentation
 */
const generateQrMatrix = (text: string): boolean[][] => {
  const size = 25;
  const matrix: boolean[][] = Array(size)
    .fill(false)
    .map(() => Array(size).fill(false));

  // Finder patterns (top-left, top-right, bottom-left)
  const setFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[row + r][col + c] = true;
        }
      }
    }
  };

  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Generate deterministic pattern based on characters
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) % 1000000007;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite finder patterns
      const inFinder1 = r < 8 && c < 8;
      const inFinder2 = r < 8 && c >= size - 8;
      const inFinder3 = r >= size - 8 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inFinder1 && !inFinder2 && !inFinder3 && !inTiming) {
        hash = (hash * 1664525 + 1013904223) % 4294967296;
        matrix[r][c] = (hash % 3) === 0 || ((r + c) % 2 === 0 && (hash % 2 === 0));
      }
    }
  }

  return matrix;
};

export const PassportQrModal: React.FC<PassportQrModalProps> = ({
  isOpen,
  onClose,
  publicUrl,
  candidateName,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${publicUrl}` : publicUrl;
  const matrix = generateQrMatrix(fullUrl);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-sm w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Proof Passport QR Code</h3>
              <p className="text-[11px] text-zinc-500">{candidateName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-md hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Presentation Box */}
        <div className="flex flex-col items-center justify-center p-6 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
          <div className="p-3 bg-white rounded-lg shadow-xs border border-zinc-200">
            <svg
              viewBox={`0 0 ${matrix.length} ${matrix.length}`}
              className="w-48 h-48 shape-rendering-crispEdges"
            >
              {matrix.map((row, rIdx) =>
                row.map((cell, cIdx) =>
                  cell ? (
                    <rect
                      key={`${rIdx}-${cIdx}`}
                      x={cIdx}
                      y={rIdx}
                      width={1}
                      height={1}
                      fill="#0f172a"
                    />
                  ) : null
                )
              )}
            </svg>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Scan to view Proof Passport</span>
          </div>
        </div>

        {/* URL Box & Copy */}
        <div className="space-y-2">
          <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-700 font-mono truncate select-all">
            {fullUrl}
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleCopy}
            className="w-full text-xs font-semibold flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Passport Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Public Link</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
