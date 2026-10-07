import React from 'react';
import {
  FileText,
  CheckSquare,
  AlertTriangle,
  Lightbulb,
  Compass,
  FolderTree,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { MissionManifest, MissionFile } from '../../types/mission';

interface MissionInstructionsProps {
  mission: MissionManifest;
  files: MissionFile[];
  onSelectFile?: (filePath: string) => void;
  activeFilePath?: string;
}

export const MissionInstructions: React.FC<MissionInstructionsProps> = ({
  mission,
  files,
  onSelectFile,
  activeFilePath,
}) => {
  return (
    <div className="space-y-4 text-xs text-zinc-700 leading-relaxed overflow-y-auto pr-1">
      {/* Workplace Ticket Context Card */}
      <Card className="border-blue-100 bg-blue-50/20">
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Engineering Task Context</span>
            </div>
            <Badge variant="outline" size="sm" className="bg-white text-[10px]">
              Ticket #{mission.slug.toUpperCase().slice(0, 10)}
            </Badge>
          </div>
          <p className="text-zinc-600">
            You are investigating a production calculation issue on an e-commerce platform. Several
            invoices show inaccurate subtotals and discount discrepancies caused by IEEE 754 floating
            point errors and unvalidated coupon inputs.
          </p>
        </div>
      </Card>

      {/* File Navigator / Workspace Tree */}
      <Card className="border-zinc-200">
        <div className="p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 font-bold text-zinc-800 text-xs">
            <FolderTree className="w-4 h-4 text-zinc-500" />
            <span>Workspace Files ({files.length})</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Click a file to open and edit it in the code editor:
          </p>
          <div className="space-y-1">
            {files.map((file) => {
              const isSelected = activeFilePath === file.path;
              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => onSelectFile?.(file.path)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-colors font-mono text-left cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                      : 'bg-zinc-50 text-zinc-700 border border-zinc-100 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-zinc-400'}`} />
                    <span>{file.path}</span>
                  </div>
                  {file.path.includes('calculations.js') && (
                    <Badge variant="warning" size="sm" className="text-[10px] py-0 px-1.5">
                      Target File
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Objectives & Acceptance Criteria */}
      <Card className="border-zinc-200">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-1.5 font-bold text-zinc-900 text-xs">
            <CheckSquare className="w-4 h-4 text-green-600" />
            <span>Acceptance Criteria</span>
          </div>

          <ul className="space-y-2 text-zinc-600">
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded bg-green-100 text-green-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <span>
                <strong>Accurate Line-Item Math</strong>: Fix <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-800">calculateSubtotal</code> to correctly multiply item quantities and prices without floating point arithmetic leaks.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded bg-green-100 text-green-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <span>
                <strong>Safe Coupon Validation</strong>: Update <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-800">applyDiscount</code> to safely handle percentage discounts (clamp between 0% and 100%) and reject negative or non-numeric discount values.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded bg-green-100 text-green-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                3
              </span>
              <span>
                <strong>Deterministic Order Total</strong>: Ensure <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-800">calculateOrderTotal</code> properly applies tax on top of discounted amounts and returns a cleanly rounded monetary value.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded bg-green-100 text-green-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                4
              </span>
              <span>
                <strong>Passing Evaluation Suite</strong>: All automated unit and regression assertions in the test suite must pass with 0 errors.
              </span>
            </li>
          </ul>
        </div>
      </Card>

      {/* Constraints & Engineering Guidance */}
      <Card className="border-amber-100 bg-amber-50/20">
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>Engineering Hints &amp; Constraints</span>
          </div>
          <ul className="space-y-1.5 text-zinc-600 list-disc list-inside text-[11px]">
            <li>JavaScript represents numbers as IEEE 754 double precision floats. Use <code className="bg-amber-100/60 px-1 rounded text-amber-900">Number(total.toFixed(2))</code> for reliable currency calculations.</li>
            <li>Do not modify the exported function signatures or module exports.</li>
            <li>Run tests frequently to check edge cases and view failure diagnostics.</li>
          </ul>
        </div>
      </Card>

      {/* Security notice */}
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 p-2">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>Submissions run in a secure, sandboxed Node.js runtime with execution resource limits.</span>
      </div>
    </div>
  );
};
