import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Copy, RotateCcw, Download, Maximize2, Minimize2, Check } from "lucide-react";

const STARTER_TEMPLATES = {
  "C++": `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    \n};`,
  "Java": `class Solution {\n    \n}`,
  "Python": `class Solution:\n    pass\n`,
  "JavaScript": `function solution() {\n    \n}`
};

const LANGUAGE_MAP = {
  "C++": "cpp",
  "Java": "java",
  "Python": "python",
  "JavaScript": "javascript"
};

const FILE_EXTENSIONS = {
  "C++": "cpp",
  "Java": "java",
  "Python": "py",
  "JavaScript": "js"
};

const CodeEditor = ({ questionId, language, value, onChange, disabled }) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get code for active language on mount/change
  useEffect(() => {
    if (!questionId) return;
    try {
      const saved = localStorage.getItem(`coding-question-${questionId}-${language}`);
      if (saved !== null) {
        onChange(saved);
      } else {
        const template = STARTER_TEMPLATES[language] || "";
        onChange(template);
        localStorage.setItem(`coding-question-${questionId}-${language}`, template);
      }
    } catch (e) {
      console.error("Failed to load draft:", e);
      const template = STARTER_TEMPLATES[language] || "";
      onChange(template);
    }
  }, [questionId, language, onChange]);

  // Handle local save on every code change
  const handleEditorChange = (val) => {
    if (disabled) return;
    onChange(val || "");
    try {
      localStorage.setItem(`coding-question-${questionId}-${language}`, val || "");
    } catch (e) {
      console.error("Failed to auto-save draft:", e);
    }
  };

  // Reset current language code to starter template
  const handleReset = () => {
    if (disabled || !window.confirm("Are you sure you want to reset your code to the default template?")) return;
    const template = STARTER_TEMPLATES[language] || "";
    handleEditorChange(template);
  };

  // Copy code to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  // Download code as file
  const handleDownload = () => {
    const ext = FILE_EXTENSIONS[language] || "txt";
    const element = document.createElement("a");
    const file = new Blob([value], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `solution.${ext}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const monacoLanguage = LANGUAGE_MAP[language] || "javascript";

  return (
    <div
      className={`flex flex-col border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-[100] p-6 bg-[#050B1F]/98 backdrop-blur-2xl"
          : "bg-slate-950/40 relative h-[500px]"
      }`}
    >
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/60 border-b border-white/10 select-none">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase">
            {language} Solution Code
          </span>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            title="Copy Code"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            title="Reset to Template"
            disabled={disabled}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            title="Download Code File"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 min-h-0 relative">
        {disabled && (
          <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-auto cursor-not-allowed" />
        )}
        <Editor
          height="100%"
          language={monacoLanguage}
          theme="vs-dark"
          value={value}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            fontFamily: "'Fira Code', 'Courier New', Courier, monospace",
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12, bottom: 12 },
            readOnly: disabled
          }}
          loading={
            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono">
              Loading Code Workspace...
            </div>
          }
        />
      </div>
    </div>
  );
};

export default CodeEditor;
