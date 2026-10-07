import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Terminal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { RunExecutionResult } from '../../types/mission';

interface TestResultsProps {
  onRunTests: () => void;
  isRunning: boolean;
  result: RunExecutionResult | null;
}

export const TestResults: React.FC<TestResultsProps> = ({
  onRunTests,
  isRunning,
  result,
}) => {
  const [showConsole, setShowConsole] = useState(false);

  const isAllPassed =
    result &&
    result.status === 'completed' &&
    result.passed === result.total &&
    result.total > 0 &&
    result.failed === 0;

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-4 shadow-xs">
      {/* Header Bar: Run Tests Trigger & Overall Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-50 text-blue-700">
            <Play className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-900">Automated Test Evaluation</h3>
            <p className="text-[11px] text-zinc-500">
              Evaluates your fix against production unit and regression assertions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onRunTests}
            disabled={isRunning}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2"
          >
            {isRunning ? (
              <>
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Running in Sandbox...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Tests</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Initial state before first run */}
      {!result && !isRunning && (
        <div className="p-6 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-lg space-y-2">
          <Terminal className="w-6 h-6 text-zinc-400 mx-auto" />
          <p className="text-xs font-semibold text-zinc-700">No tests executed yet</p>
          <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
            Click <strong>Run Tests</strong> above to execute your solution in the secure Node.js sandbox runner.
          </p>
        </div>
      )}

      {/* Execution Results */}
      {result && (
        <div className="space-y-3">
          {/* Summary Banner */}
          <div
            className={`p-3.5 rounded-lg border flex items-center justify-between gap-3 text-xs ${
              isAllPassed
                ? 'bg-green-50/80 border-green-200 text-green-900'
                : result.status === 'timeout'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-red-50/80 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isAllPassed ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              ) : result.status === 'timeout' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <div>
                <p className="font-bold">
                  {isAllPassed
                    ? 'All Required Test Assertions Passed (100%)'
                    : result.status === 'timeout'
                      ? 'Execution Timed Out (>5000ms)'
                      : `${result.failed} of ${result.total} Tests Failed`}
                </p>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {isAllPassed
                    ? 'Your solution is mathematically sound and verified. Ready to submit.'
                    : 'Fix the failing test assertions and run tests again.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 text-[11px] opacity-80 bg-white/70 px-2 py-0.5 rounded border border-black/5">
                <Clock className="w-3 h-3" />
                <span>{result.duration}ms</span>
              </span>
              <Badge
                variant={isAllPassed ? 'success' : 'error'}
                size="sm"
                className="font-bold"
              >
                {result.passed}/{result.total} Passed
              </Badge>
            </div>
          </div>

          {/* Individual Test Assertions List */}
          {result.tests.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
                Test Assertions:
              </span>
              <div className="space-y-1">
                {result.tests.map((t, idx) => {
                  const passed = t.status === 'passed';
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-md border text-xs flex flex-col gap-1 ${
                        passed
                          ? 'bg-zinc-50/70 border-zinc-200/80 text-zinc-800'
                          : 'bg-red-50/40 border-red-200 text-red-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          {passed ? (
                            <span className="text-green-600 font-bold">✓</span>
                          ) : (
                            <span className="text-red-600 font-bold">✗</span>
                          )}
                          <span className={passed ? 'text-zinc-800' : 'text-red-800 font-semibold'}>
                            {t.name}
                          </span>
                        </div>
                        {t.durationMs && (
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {t.durationMs}ms
                          </span>
                        )}
                      </div>
                      {t.message && (
                        <p className="text-[11px] text-red-700 font-mono pl-4 bg-red-100/50 p-1.5 rounded border border-red-200/60 mt-0.5">
                          {t.message}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Raw Sandbox Console Output Drawer */}
          {(result.stdout || result.stderr) && (
            <div className="pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setShowConsole(!showConsole)}
                className="text-[11px] font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                <span>{showConsole ? 'Hide Sandbox Console Log' : 'View Sandbox Console Log'}</span>
                {showConsole ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showConsole && (
                <div className="mt-2 p-3 bg-zinc-950 text-zinc-300 font-mono text-[11px] rounded-md overflow-x-auto max-h-48 whitespace-pre leading-relaxed border border-zinc-800">
                  {result.stdout && <div>{result.stdout}</div>}
                  {result.stderr && <div className="text-red-400 mt-1">{result.stderr}</div>}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
