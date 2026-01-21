'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { AppState, Project, Prompt, Template } from '@/types';

type Action =
  | { type: 'SET_STATE'; payload: { projects: Project[]; templates: Template[] } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: { projectId: string } }
  | { type: 'SELECT_PROJECT'; payload: { projectId: string | null } }
  | { type: 'ADD_PROMPT'; payload: { projectId: string; prompt: Prompt } }
  | { type: 'DELETE_PROMPT'; payload: { projectId: string; promptId: string } }
  | { type: 'SELECT_PROMPT'; payload: { promptId: string | null } }
  | { type: 'UPDATE_PROMPT'; payload: { projectId: string; promptId: string; field: 'requirements' | 'successCriteria' | 'name'; value: string } }
  | { type: 'ADD_TEMPLATE'; payload: Template }
  | { type: 'UPDATE_TEMPLATE'; payload: { id: string; name: string; content: string } }
  | { type: 'DELETE_TEMPLATE'; payload: { templateId: string } }
  | { type: 'SET_TEMPLATES'; payload: Template[] };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return {
        ...state,
        projects: action.payload.projects,
        templates: action.payload.templates,
        isLoading: false,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'ADD_PROJECT': {
      return {
        ...state,
        projects: [action.payload, ...state.projects],
        selectedProjectId: action.payload.id,
        selectedPromptId: null,
      };
    }

    case 'DELETE_PROJECT': {
      const newProjects = state.projects.filter(p => p.id !== action.payload.projectId);
      return {
        ...state,
        projects: newProjects,
        selectedProjectId: state.selectedProjectId === action.payload.projectId ? null : state.selectedProjectId,
        selectedPromptId: state.selectedProjectId === action.payload.projectId ? null : state.selectedPromptId,
      };
    }

    case 'SELECT_PROJECT':
      return {
        ...state,
        selectedProjectId: action.payload.projectId,
        selectedPromptId: null,
      };

    case 'ADD_PROMPT': {
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, prompts: [action.payload.prompt, ...p.prompts], updatedAt: Date.now() }
            : p
        ),
        selectedPromptId: action.payload.prompt.id,
      };
    }

    case 'DELETE_PROMPT': {
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? { ...p, prompts: p.prompts.filter(pr => pr.id !== action.payload.promptId), updatedAt: Date.now() }
            : p
        ),
        selectedPromptId: state.selectedPromptId === action.payload.promptId ? null : state.selectedPromptId,
      };
    }

    case 'SELECT_PROMPT':
      return {
        ...state,
        selectedPromptId: action.payload.promptId,
      };

    case 'UPDATE_PROMPT': {
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.projectId
            ? {
                ...p,
                prompts: p.prompts.map(pr =>
                  pr.id === action.payload.promptId
                    ? { ...pr, [action.payload.field]: action.payload.value, updatedAt: Date.now() }
                    : pr
                ),
                updatedAt: Date.now(),
              }
            : p
        ),
      };
    }

    case 'ADD_TEMPLATE': {
      return {
        ...state,
        templates: [...state.templates, action.payload],
      };
    }

    case 'UPDATE_TEMPLATE': {
      return {
        ...state,
        templates: state.templates.map(t =>
          t.id === action.payload.id
            ? { ...t, name: action.payload.name, content: action.payload.content }
            : t
        ),
      };
    }

    case 'DELETE_TEMPLATE': {
      return {
        ...state,
        templates: state.templates.filter(t => t.id !== action.payload.templateId),
      };
    }

    case 'SET_TEMPLATES': {
      return {
        ...state,
        templates: action.payload,
      };
    }

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  addProject: (name: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  selectProject: (projectId: string | null) => void;
  addPrompt: (projectId: string, name: string) => Promise<void>;
  deletePrompt: (projectId: string, promptId: string) => Promise<void>;
  selectPrompt: (promptId: string | null) => void;
  updatePrompt: (projectId: string, promptId: string, field: 'requirements' | 'successCriteria' | 'name', value: string) => void;
  addTemplate: (name: string, content: string, type: 'requirements' | 'success-criteria') => Promise<void>;
  updateTemplate: (id: string, name: string, content: string) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  refreshTemplates: () => Promise<void>;
  getSelectedProject: () => Project | null;
  getSelectedPrompt: () => Prompt | null;
  exportData: () => Promise<string>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    projects: [],
    templates: [],
    selectedProjectId: null,
    selectedPromptId: null,
    isLoading: true,
  });

  // Load initial state from API on mount
  useEffect(() => {
    async function loadState() {
      try {
        const response = await fetch('/api/state');
        const data = await response.json();
        dispatch({ type: 'SET_STATE', payload: data });
      } catch (error) {
        console.error('Failed to load state:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
    loadState();
  }, []);

  const addProject = useCallback(async (name: string) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const project = await response.json();
      dispatch({ type: 'ADD_PROJECT', payload: project });
    } catch (error) {
      console.error('Failed to add project:', error);
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      await fetch('/api/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId }),
      });
      dispatch({ type: 'DELETE_PROJECT', payload: { projectId } });
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }, []);

  const selectProject = useCallback((projectId: string | null) => {
    dispatch({ type: 'SELECT_PROJECT', payload: { projectId } });
  }, []);

  const addPrompt = useCallback(async (projectId: string, name: string) => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, name }),
      });
      const prompt = await response.json();
      dispatch({ type: 'ADD_PROMPT', payload: { projectId, prompt } });
    } catch (error) {
      console.error('Failed to add prompt:', error);
    }
  }, []);

  const deletePrompt = useCallback(async (projectId: string, promptId: string) => {
    try {
      await fetch('/api/prompts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: promptId, projectId }),
      });
      dispatch({ type: 'DELETE_PROMPT', payload: { projectId, promptId } });
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  }, []);

  const selectPrompt = useCallback((promptId: string | null) => {
    dispatch({ type: 'SELECT_PROMPT', payload: { promptId } });
  }, []);

  // Debounced update for prompt fields
  const updatePrompt = useCallback((projectId: string, promptId: string, field: 'requirements' | 'successCriteria' | 'name', value: string) => {
    // Optimistic update
    dispatch({ type: 'UPDATE_PROMPT', payload: { projectId, promptId, field, value } });

    // Debounced API call
    const timeoutId = setTimeout(async () => {
      try {
        await fetch('/api/prompts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: promptId, projectId, field, value }),
        });
      } catch (error) {
        console.error('Failed to update prompt:', error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  const addTemplate = useCallback(async (name: string, content: string, type: 'requirements' | 'success-criteria') => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content, type }),
      });
      const template = await response.json();
      dispatch({ type: 'ADD_TEMPLATE', payload: template });
    } catch (error) {
      console.error('Failed to add template:', error);
    }
  }, []);

  const updateTemplate = useCallback(async (id: string, name: string, content: string) => {
    try {
      await fetch('/api/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, content }),
      });
      dispatch({ type: 'UPDATE_TEMPLATE', payload: { id, name, content } });
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  }, []);

  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: templateId }),
      });
      if (response.ok) {
        dispatch({ type: 'DELETE_TEMPLATE', payload: { templateId } });
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  }, []);

  const refreshTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/templates');
      const templates = await response.json();
      dispatch({ type: 'SET_TEMPLATES', payload: templates });
    } catch (error) {
      console.error('Failed to refresh templates:', error);
    }
  }, []);

  const getSelectedProject = useCallback((): Project | null => {
    if (!state.selectedProjectId) return null;
    return state.projects.find(p => p.id === state.selectedProjectId) || null;
  }, [state.selectedProjectId, state.projects]);

  const getSelectedPrompt = useCallback((): Prompt | null => {
    const project = getSelectedProject();
    if (!project || !state.selectedPromptId) return null;
    return project.prompts.find(p => p.id === state.selectedPromptId) || null;
  }, [getSelectedProject, state.selectedPromptId]);

  const exportData = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch('/api/export');
      const data = await response.json();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '';
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        addProject,
        deleteProject,
        selectProject,
        addPrompt,
        deletePrompt,
        selectPrompt,
        updatePrompt,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        refreshTemplates,
        getSelectedProject,
        getSelectedPrompt,
        exportData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
