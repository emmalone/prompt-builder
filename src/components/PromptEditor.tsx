'use client';

import { useRef, useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { formatPromptForExport } from '@/lib/storage';

interface PromptEditorProps {
  onAddToStandards: (content: string, type: 'requirements' | 'success-criteria') => void;
}

export function PromptEditor({ onAddToStandards }: PromptEditorProps) {
  const { updatePrompt, getSelectedProject, getSelectedPrompt } = useApp();
  const requirementsRef = useRef<HTMLTextAreaElement>(null);
  const successRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [copiedRalph, setCopiedRalph] = useState(false);
  const [selectedText, setSelectedText] = useState<{ text: string; type: 'requirements' | 'success-criteria' } | null>(null);
  const [constructedPrompt, setConstructedPrompt] = useState('');
  const [ralphReadyPrompt, setRalphReadyPrompt] = useState('');

  const selectedProject = getSelectedProject();
  const selectedPrompt = getSelectedPrompt();

  const handleTextSelect = useCallback((type: 'requirements' | 'success-criteria') => {
    const ref = type === 'requirements' ? requirementsRef : successRef;
    const textarea = ref.current;
    if (textarea) {
      const selected = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
      if (selected.trim()) {
        setSelectedText({ text: selected.trim(), type });
      } else {
        setSelectedText(null);
      }
    }
  }, []);

  const handleAddSelection = () => {
    if (selectedText) {
      onAddToStandards(selectedText.text, selectedText.type);
      setSelectedText(null);
    }
  };

  const handleUpdatePrompt = () => {
    if (!selectedPrompt) return;
    const formatted = formatPromptForExport(selectedPrompt);
    setConstructedPrompt(formatted);
  };

  const handleCopyToClipboard = async () => {
    if (!constructedPrompt) return;

    try {
      await navigator.clipboard.writeText(constructedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = constructedPrompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRalphReady = () => {
    if (!constructedPrompt) return;

    // Ralph Loop best practice modifiers
    const ralphModifiers = `
## Loop Control
- Maximum iterations: 25 (safety limit only - stop early when done)
- Stop immediately when all requirements are met
- Do NOT restart or repeat completed work
- If blocked or uncertain, ask for clarification instead of looping

## Completion Signal
When ALL requirements are fully implemented and verified:
1. Run any necessary tests or builds
2. Confirm no errors
3. Output: <promise>COMPLETE</promise>
4. STOP - do not continue after outputting COMPLETE`;

    // Combine prompt with Ralph modifiers
    const fullPrompt = constructedPrompt + '\n' + ralphModifiers;

    // Escape internal quotes and format as single line for CLI
    const escaped = fullPrompt
      .replace(/\\/g, '\\\\')  // Escape backslashes first
      .replace(/"/g, '\\"')    // Escape double quotes
      .replace(/\n/g, '\\n');  // Convert newlines to \n

    // Wrap in quotes for CLI usage
    const ralphFormatted = `"${escaped}"`;

    setRalphReadyPrompt(ralphFormatted);
  };

  const handleCopyRalph = async () => {
    if (!ralphReadyPrompt) return;

    try {
      await navigator.clipboard.writeText(ralphReadyPrompt);
      setCopiedRalph(true);
      setTimeout(() => setCopiedRalph(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = ralphReadyPrompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedRalph(true);
      setTimeout(() => setCopiedRalph(false), 2000);
    }
  };

  if (!selectedProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 text-gray-500">
        <p>Select or create a project to get started</p>
      </div>
    );
  }

  if (!selectedPrompt) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 text-gray-500">
        <p>Select or create a prompt to edit</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-100 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={selectedPrompt.name}
          onChange={(e) => updatePrompt(selectedProject.id, selectedPrompt.id, 'name', e.target.value)}
          className="text-xl font-semibold bg-transparent text-blue-800 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1"
        />
        <div className="flex gap-2">
          {selectedText && (
            <button
              onClick={handleAddSelection}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              + Add to Standards
            </button>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Column - Requirements & Success Criteria */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Requirements Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Requirements</label>
            </div>
            <textarea
              ref={requirementsRef}
              value={selectedPrompt.requirements}
              onChange={(e) => updatePrompt(selectedProject.id, selectedPrompt.id, 'requirements', e.target.value)}
              onMouseUp={() => handleTextSelect('requirements')}
              onKeyUp={() => handleTextSelect('requirements')}
              placeholder="Enter your requirements here..."
              className="flex-1 w-full p-3 bg-white text-blue-800 rounded-lg shadow resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-blue-400"
            />
          </div>

          {/* Success Criteria Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Success Criteria</label>
            </div>
            <textarea
              ref={successRef}
              value={selectedPrompt.successCriteria}
              onChange={(e) => updatePrompt(selectedProject.id, selectedPrompt.id, 'successCriteria', e.target.value)}
              onMouseUp={() => handleTextSelect('success-criteria')}
              onKeyUp={() => handleTextSelect('success-criteria')}
              placeholder="Enter success criteria here..."
              className="flex-1 w-full p-3 bg-white text-blue-800 rounded-lg shadow resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-blue-400"
            />
          </div>
        </div>

        {/* Right Column - Constructed Prompt & Ralph Ready */}
        <div className="flex-1 flex flex-col min-h-0 gap-4">
          {/* Constructed Prompt Section - 3/4 of space */}
          <div className="flex-[3] flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Constructed Prompt</label>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdatePrompt}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Update Prompt
                </button>
                <button
                  onClick={handleCopyToClipboard}
                  disabled={!constructedPrompt}
                  className={`px-3 py-1 text-sm rounded ${
                    copied
                      ? 'bg-green-600 text-white'
                      : constructedPrompt
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
            </div>
            <textarea
              value={constructedPrompt}
              readOnly
              placeholder="Click 'Update Prompt' to generate the combined prompt..."
              className="flex-1 w-full p-3 bg-gray-50 text-blue-800 rounded-lg shadow resize-none focus:outline-none border border-gray-200 placeholder:text-gray-400"
            />
          </div>

          {/* Ralph Ready Section - 1/4 of space (half of success criteria) */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Ralph Loop Ready</label>
              <div className="flex gap-2">
                <button
                  onClick={handleRalphReady}
                  disabled={!constructedPrompt}
                  className={`px-3 py-1 text-sm rounded ${
                    constructedPrompt
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Ralph Ready
                </button>
                <button
                  onClick={handleCopyRalph}
                  disabled={!ralphReadyPrompt}
                  className={`px-3 py-1 text-sm rounded ${
                    copiedRalph
                      ? 'bg-green-600 text-white'
                      : ralphReadyPrompt
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {copiedRalph ? 'Copied!' : 'Copy Ralph'}
                </button>
              </div>
            </div>
            <textarea
              value={ralphReadyPrompt}
              readOnly
              placeholder="Click 'Ralph Ready' to format for Ralph Loop..."
              className="flex-1 w-full p-3 bg-purple-50 text-purple-900 rounded-lg shadow resize-none focus:outline-none border border-purple-200 placeholder:text-purple-400 text-xs font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
