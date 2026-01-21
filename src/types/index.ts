export interface Template {
  id: string;
  name: string;
  content: string;
  type: 'requirements' | 'success-criteria';
  isDefault?: boolean;
  createdAt: number;
}

export interface Prompt {
  id: string;
  name: string;
  requirements: string;
  successCriteria: string;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  prompts: Prompt[];
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  projects: Project[];
  templates: Template[];
  selectedProjectId: string | null;
  selectedPromptId: string | null;
  isLoading: boolean;
}
