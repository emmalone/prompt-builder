'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Template } from '@/types';

interface TemplatesPanelProps {
  onInsertTemplate: (content: string, type: 'requirements' | 'success-criteria') => void;
  pendingTemplate: { content: string; type: 'requirements' | 'success-criteria' } | null;
  onClearPending: () => void;
  currentRequirements: string;
  currentSuccessCriteria: string;
}

export function TemplatesPanel({
  onInsertTemplate,
  pendingTemplate,
  onClearPending,
  currentRequirements,
  currentSuccessCriteria
}: TemplatesPanelProps) {
  const { state, addTemplate, updateTemplate, deleteTemplate, exportData } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showManagePanel, setShowManagePanel] = useState(false);
  const [exportedJson, setExportedJson] = useState<string | null>(null);

  const requirementsTemplates = state.templates.filter(t => t.type === 'requirements');
  const successCriteriaTemplates = state.templates.filter(t => t.type === 'success-criteria');

  // Check if a template is already in the prompt
  const isTemplateAdded = (template: Template): boolean => {
    const currentValue = template.type === 'requirements' ? currentRequirements : currentSuccessCriteria;
    return currentValue.includes(template.content.trim());
  };

  // Get templates that haven't been added yet
  const getUnadedTemplates = (type: 'requirements' | 'success-criteria'): Template[] => {
    const templates = type === 'requirements' ? requirementsTemplates : successCriteriaTemplates;
    return templates.filter(t => !isTemplateAdded(t));
  };

  const handleAddAll = (type: 'requirements' | 'success-criteria') => {
    const unadded = getUnadedTemplates(type);
    unadded.forEach(template => {
      onInsertTemplate(template.content, type);
    });
  };

  const handleSavePending = async () => {
    if (pendingTemplate && newTemplateName.trim()) {
      await addTemplate(newTemplateName.trim(), pendingTemplate.content, pendingTemplate.type);
      setNewTemplateName('');
      setShowNameInput(false);
      onClearPending();
    }
  };

  const handleStartEdit = (template: Template) => {
    setEditingTemplate(template);
    setEditName(template.name);
    setEditContent(template.content);
  };

  const handleSaveEdit = async () => {
    if (editingTemplate && editName.trim() && editContent.trim()) {
      await updateTemplate(editingTemplate.id, editName.trim(), editContent.trim());
      setEditingTemplate(null);
      setEditName('');
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setEditName('');
    setEditContent('');
  };

  const handleDelete = async (template: Template) => {
    if (template.isDefault) {
      alert('Cannot delete default templates');
      return;
    }
    if (confirm(`Delete template "${template.name}"?`)) {
      await deleteTemplate(template.id);
    }
  };

  const handleExportJson = async () => {
    const json = await exportData();
    setExportedJson(json);
  };

  const handleCopyJson = async () => {
    if (exportedJson) {
      await navigator.clipboard.writeText(exportedJson);
      alert('JSON copied to clipboard!');
    }
  };

  const handleDownloadJson = () => {
    if (exportedJson) {
      const blob = new Blob([exportedJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompt-builder-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-10 bg-gray-800 flex flex-col items-center py-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="text-gray-400 hover:text-white p-2"
          title="Expand templates"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  }

  // Edit Template Modal
  if (editingTemplate) {
    return (
      <div className="w-80 bg-gray-800 text-white flex flex-col h-full">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Edit Template</h2>
        </div>
        <div className="p-4 flex-1 flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-2 py-1.5 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label className="text-xs text-gray-400 mb-1 block">Content</label>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 w-full px-2 py-1.5 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              className="flex-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex-1 px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Manage Templates View
  if (showManagePanel) {
    return (
      <div className="w-80 bg-gray-800 text-white flex flex-col h-full">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Manage Standards</h2>
          <button
            onClick={() => setShowManagePanel(false)}
            className="text-gray-400 hover:text-white text-sm"
          >
            Back
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {/* Requirements Templates */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">Requirements</h3>
            <div className="space-y-2">
              {requirementsTemplates.map((template) => (
                <div key={template.id} className="bg-gray-700 rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{template.name}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleStartEdit(template)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                      {!template.isDefault && (
                        <button
                          onClick={() => handleDelete(template)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{template.content}</p>
                  {template.isDefault && (
                    <span className="text-xs text-gray-500 italic">Default</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Success Criteria Templates */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">Success Criteria</h3>
            <div className="space-y-2">
              {successCriteriaTemplates.map((template) => (
                <div key={template.id} className="bg-gray-700 rounded p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{template.name}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleStartEdit(template)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                      {!template.isDefault && (
                        <button
                          onClick={() => handleDelete(template)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{template.content}</p>
                  {template.isDefault && (
                    <span className="text-xs text-gray-500 italic">Default</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Export JSON View
  if (exportedJson !== null) {
    return (
      <div className="w-80 bg-gray-800 text-white flex flex-col h-full">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Export JSON</h2>
          <button
            onClick={() => setExportedJson(null)}
            className="text-gray-400 hover:text-white text-sm"
          >
            Back
          </button>
        </div>
        <div className="flex-1 overflow-hidden p-3 flex flex-col gap-2">
          <textarea
            value={exportedJson}
            readOnly
            className="flex-1 w-full p-2 text-xs bg-gray-900 border border-gray-700 rounded font-mono resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCopyJson}
              className="flex-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded"
            >
              Copy
            </button>
            <button
              onClick={handleDownloadJson}
              className="flex-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 rounded"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    );
  }

  const unaddedRequirements = getUnadedTemplates('requirements');
  const unaddedSuccessCriteria = getUnadedTemplates('success-criteria');

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Templates</h2>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-gray-400 hover:text-white"
          title="Collapse"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="p-3 border-b border-gray-700 flex gap-2">
        <button
          onClick={() => setShowManagePanel(true)}
          className="flex-1 px-2 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded"
        >
          Manage Standards
        </button>
        <button
          onClick={handleExportJson}
          className="flex-1 px-2 py-1.5 text-xs bg-green-700 hover:bg-green-600 rounded"
        >
          Export JSON
        </button>
      </div>

      {/* Pending Template to Save */}
      {pendingTemplate && (
        <div className="p-3 bg-green-900/50 border-b border-gray-700">
          <p className="text-xs text-green-400 mb-2">Save as template:</p>
          {showNameInput ? (
            <div>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSavePending()}
                placeholder="Template name"
                className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-green-500 mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSavePending}
                  className="flex-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => { setShowNameInput(false); setNewTemplateName(''); onClearPending(); }}
                  className="flex-1 px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-300 mb-2 line-clamp-2">&ldquo;{pendingTemplate.content.substring(0, 50)}...&rdquo;</p>
              <button
                onClick={() => setShowNameInput(true)}
                className="w-full px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded"
              >
                Name &amp; Save
              </button>
            </div>
          )}
        </div>
      )}

      {/* Templates List */}
      <div className="flex-1 overflow-y-auto">
        {/* Requirements Templates */}
        <div className="p-3 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400">Requirements</h3>
            {unaddedRequirements.length > 0 && (
              <button
                onClick={() => handleAddAll('requirements')}
                className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-0.5 rounded"
              >
                Add All ({unaddedRequirements.length})
              </button>
            )}
          </div>
          <div className="space-y-2">
            {requirementsTemplates.map((template) => {
              const isAdded = isTemplateAdded(template);
              return (
                <button
                  key={template.id}
                  onClick={() => !isAdded && onInsertTemplate(template.content, 'requirements')}
                  disabled={isAdded}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                    isAdded
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title={isAdded ? 'Already added' : template.content}
                >
                  <span className="font-medium">{template.name}</span>
                  {isAdded && <span className="text-xs text-green-400 ml-2">✓</span>}
                </button>
              );
            })}
            {requirementsTemplates.length === 0 && (
              <p className="text-xs text-gray-500 italic">No templates</p>
            )}
          </div>
        </div>

        {/* Success Criteria Templates */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-green-400">Success Criteria</h3>
            {unaddedSuccessCriteria.length > 0 && (
              <button
                onClick={() => handleAddAll('success-criteria')}
                className="text-xs bg-green-600 hover:bg-green-700 px-2 py-0.5 rounded"
              >
                Add All ({unaddedSuccessCriteria.length})
              </button>
            )}
          </div>
          <div className="space-y-2">
            {successCriteriaTemplates.map((template) => {
              const isAdded = isTemplateAdded(template);
              return (
                <button
                  key={template.id}
                  onClick={() => !isAdded && onInsertTemplate(template.content, 'success-criteria')}
                  disabled={isAdded}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                    isAdded
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title={isAdded ? 'Already added' : template.content}
                >
                  <span className="font-medium">{template.name}</span>
                  {isAdded && <span className="text-xs text-green-400 ml-2">✓</span>}
                </button>
              );
            })}
            {successCriteriaTemplates.length === 0 && (
              <p className="text-xs text-gray-500 italic">No templates</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
