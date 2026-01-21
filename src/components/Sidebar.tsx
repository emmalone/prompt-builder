'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export function Sidebar() {
  const { state, addProject, deleteProject, selectProject, addPrompt, deletePrompt, selectPrompt, getSelectedProject } = useApp();
  const [newProjectName, setNewProjectName] = useState('');
  const [newPromptName, setNewPromptName] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewPrompt, setShowNewPrompt] = useState(false);

  const selectedProject = getSelectedProject();

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      addProject(newProjectName.trim());
      setNewProjectName('');
      setShowNewProject(false);
    }
  };

  const handleAddPrompt = () => {
    if (newPromptName.trim() && state.selectedProjectId) {
      addPrompt(state.selectedProjectId, newPromptName.trim());
      setNewPromptName('');
      setShowNewPrompt(false);
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-full flex flex-col">
      {/* Projects Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Projects</h2>
          <button
            onClick={() => setShowNewProject(true)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            + New
          </button>
        </div>

        {showNewProject && (
          <div className="mb-3">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
              placeholder="Project name"
              className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddProject}
                className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded"
              >
                Add
              </button>
              <button
                onClick={() => { setShowNewProject(false); setNewProjectName(''); }}
                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1 max-h-48 overflow-y-auto">
          {state.projects.map((project) => (
            <div
              key={project.id}
              className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer group ${
                state.selectedProjectId === project.id ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
              onClick={() => selectProject(project.id)}
            >
              <span className="text-sm truncate">{project.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject(project.id);
                }}
                className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                &times;
              </button>
            </div>
          ))}
          {state.projects.length === 0 && (
            <p className="text-xs text-gray-500 italic">No projects yet</p>
          )}
        </div>
      </div>

      {/* Prompts Section */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Prompts</h2>
          {selectedProject && (
            <button
              onClick={() => setShowNewPrompt(true)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              + New
            </button>
          )}
        </div>

        {showNewPrompt && selectedProject && (
          <div className="mb-3">
            <input
              type="text"
              value={newPromptName}
              onChange={(e) => setNewPromptName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPrompt()}
              placeholder="Prompt name"
              className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddPrompt}
                className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded"
              >
                Add
              </button>
              <button
                onClick={() => { setShowNewPrompt(false); setNewPromptName(''); }}
                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1 flex-1 overflow-y-auto">
          {selectedProject ? (
            selectedProject.prompts.length > 0 ? (
              selectedProject.prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer group ${
                    state.selectedPromptId === prompt.id ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                  onClick={() => selectPrompt(prompt.id)}
                >
                  <span className="text-sm truncate">{prompt.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePrompt(selectedProject.id, prompt.id);
                    }}
                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    &times;
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">No prompts in this project</p>
            )
          ) : (
            <p className="text-xs text-gray-500 italic">Select a project first</p>
          )}
        </div>
      </div>
    </div>
  );
}
