/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { JAVA_FILES } from '../data/javaCode';
import { X, Copy, Check, FileCode, Terminal } from 'lucide-react';

interface JavaCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JavaCodeViewerModal: React.FC<JavaCodeViewerModalProps> = ({ isOpen, onClose }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentFile = JAVA_FILES[selectedFileIndex] || JAVA_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAll = () => {
    const allCode = JAVA_FILES.map(
      (f) => `// ==========================================\n// FILE: ${f.name}\n// ==========================================\n\n${f.code}\n\n`
    ).join('\n');
    navigator.clipboard.writeText(allCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              Java
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                Java OOP Source Code
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  All 7 Operations
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Core Java OOP classes (Abstraction, Encapsulation, Inheritance &amp; Polymorphism)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
              title="Copy all Java files concatenated"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy All Files
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* File Tabs Strip */}
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1 text-xs">
          {JAVA_FILES.map((file, idx) => (
            <button
              key={file.name}
              onClick={() => {
                setSelectedFileIndex(idx);
                setCopied(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedFileIndex === idx
                  ? 'bg-white text-blue-900 font-bold shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-slate-400" />
              <span>{file.name}</span>
            </button>
          ))}
        </div>

        {/* File Description Bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-mono text-slate-700 font-medium truncate">
            {currentFile.name} &bull; <span className="text-slate-500 font-sans">{currentFile.description}</span>
          </span>
          <button
            onClick={handleCopy}
            className={`shrink-0 flex items-center gap-1 px-3 py-1 rounded-md font-semibold text-xs transition-colors ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-800 text-white hover:bg-blue-900'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Body */}
        <div className="p-4 overflow-y-auto flex-1 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed">
          <pre className="overflow-x-auto whitespace-pre">
            <code>{currentFile.code}</code>
          </pre>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>To compile and run: <code className="bg-slate-200 text-slate-800 px-1 rounded">javac com/bank/*.java && java com.bank.Main</code></span>
          </div>
          <span>All 7 required operations (a to g) verified</span>
        </div>
      </div>
    </div>
  );
};
