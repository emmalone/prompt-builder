'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { PromptEditor } from '@/components/PromptEditor';
import { TemplatesPanel } from '@/components/TemplatesPanel';
import { useApp } from '@/context/AppContext';

export default function Home() {
  const { updatePrompt, getSelectedProject, getSelectedPrompt } = useApp();
  const [pendingTemplate, setPendingTemplate] = useState<{ content: string; type: 'requirements' | 'success-criteria' } | null>(null);

  const selectedProject = getSelectedProject();
  const selectedPrompt = getSelectedPrompt();

  const handleAddToStandards = (content: string, type: 'requirements' | 'success-criteria') => {
    setPendingTemplate({ content, type });
  };

  const handleInsertTemplate = (content: string, type: 'requirements' | 'success-criteria') => {
    if (!selectedProject || !selectedPrompt) return;

    const field = type === 'requirements' ? 'requirements' : 'successCriteria';
    const currentValue = type === 'requirements' ? selectedPrompt.requirements : selectedPrompt.successCriteria;

    // Check if content already exists in the current value
    if (currentValue.includes(content.trim())) {
      return; // Don't add duplicate
    }

    const newValue = currentValue + (currentValue ? '\n\n' : '') + content;
    updatePrompt(selectedProject.id, selectedPrompt.id, field, newValue);
  };

  return (
    <main className="h-screen flex bg-gray-900">
      <Sidebar />
      <PromptEditor onAddToStandards={handleAddToStandards} />
      <TemplatesPanel
        onInsertTemplate={handleInsertTemplate}
        pendingTemplate={pendingTemplate}
        onClearPending={() => setPendingTemplate(null)}
        currentRequirements={selectedPrompt?.requirements || ''}
        currentSuccessCriteria={selectedPrompt?.successCriteria || ''}
      />
    </main>
  );
}
