import React, { useState } from 'react';
import {
  FileCode,
  RotateCcw,
  CheckCircle,
  Copy,
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { MissionFile } from '../../types/mission';

interface CodeEditorProps {
  files: MissionFile[];
  activeFilePath: string;
  onSelectFile: (path: string) => void;
  onFileChange: (path: string, newContent: string) => void;
  onResetStarterFile: (path: string) => void;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  files,
  activeFilePath,
  onSelectFile,
  onFileChange,
  onResetStarterFile,
  readOnly = false,
}) => {
  const [copied, setCopied] = useState(false);
  const activeFile = files.find((f) => f.path === activeFilePath) || files[0];
  const lines = (activeFile?.content || '').split('\n');

  const handleCopyCode = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const newVal = val.substring(0, start) + '  ' + val.substring(end);
      onFileChange(activeFile.path, newVal);

      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-xs text-xs font-mono">
      {/* Top File Tabs Bar */}
      <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 border-b border-zinc-800 shrink-0 select-none">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {files.map((file) => {
            const isSelected = file.path === activeFile?.path;
            return (
              <button
                key={file.path}
                type="button"
                onClick={() => onSelectFile(file.path)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-t text-xs transition-colors font-mono cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 text-zinc-100 border-t-2 border-blue-500 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-zinc-500'}`} />
                <span>{file.path}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
            title="Copy code to clipboard"
          >
            {copied ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {!readOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm(`Reset "${activeFile.path}" back to initial starter code?`)) {
                  onResetStarterFile(activeFile.path);
                }
              }}
              className="text-[11px] text-zinc-400 hover:text-red-300 hover:bg-red-950/40 py-1 px-2 h-auto"
              title="Reset this file to original starter code"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Editor Body: Line Numbers + Code Textarea */}
      <div className="relative flex-1 flex overflow-hidden min-h-[360px]">
        {/* Gutter / Line Numbers */}
        <div className="w-12 bg-zinc-950/80 text-zinc-600 select-none py-3 text-right pr-3 font-mono text-[11px] leading-[22px] shrink-0 border-r border-zinc-800/80">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <textarea
          value={activeFile?.content || ''}
          onChange={(e) => onFileChange(activeFile.path, e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          spellCheck={false}
          className="flex-1 w-full h-full bg-zinc-900 text-zinc-100 p-3 font-mono text-[12px] leading-[22px] resize-none outline-hidden overflow-auto whitespace-pre tab-2 selection:bg-blue-600/40"
          placeholder="// Author your fix here..."
        />
      </div>

      {/* Editor Footer / Status Bar */}
      <div className="bg-zinc-950 px-3 py-1.5 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500 select-none">
        <div className="flex items-center gap-3">
          <span>JavaScript (Node.js)</span>
          <span>•</span>
          <span>{lines.length} lines</span>
          <span>•</span>
          <span>{(activeFile?.content || '').length} characters</span>
        </div>
        <div>
          {readOnly ? (
            <span className="text-amber-500 font-semibold">Read Only (Submitted)</span>
          ) : (
            <span className="text-zinc-400">Press Tab to indent</span>
          )}
        </div>
      </div>
    </div>
  );
};
