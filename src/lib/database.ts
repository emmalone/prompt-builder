import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'prompts.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS prompts (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    requirements TEXT DEFAULT '',
    success_criteria TEXT DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('requirements', 'success-criteria')),
    is_default INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_prompts_project_id ON prompts(project_id);
`);

// Insert default templates if they don't exist
const defaultTemplates = [
  {
    id: 'default-req-1',
    name: 'Next.js/Tailwind Stack',
    content: 'Use nextJS/tailwind with permanent local storage',
    type: 'requirements',
    is_default: 1,
  },
  {
    id: 'default-req-2',
    name: 'SQLite Database',
    content: 'Store all data in a SQLite database using better-sqlite3',
    type: 'requirements',
    is_default: 1,
  },
  {
    id: 'default-req-3',
    name: 'Export to JSON',
    content: 'Include an export to JSON button for data portability',
    type: 'requirements',
    is_default: 1,
  },
  {
    id: 'default-success-1',
    name: 'Standard Completion',
    content: 'All requirements implemented, no linter errors, documentation updated, Output <promise> COMPLETE </promise> When done.',
    type: 'success-criteria',
    is_default: 1,
  },
];

const insertDefaultTemplate = db.prepare(`
  INSERT OR IGNORE INTO templates (id, name, content, type, is_default, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

for (const t of defaultTemplates) {
  insertDefaultTemplate.run(t.id, t.name, t.content, t.type, t.is_default, Date.now());
}

// Project operations
export function getAllProjects() {
  const projects = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as {
    id: string;
    name: string;
    created_at: number;
    updated_at: number;
  }[];

  return projects.map(p => ({
    id: p.id,
    name: p.name,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    prompts: getPromptsByProjectId(p.id),
  }));
}

export function createProject(name: string) {
  const id = uuidv4();
  const now = Date.now();
  db.prepare('INSERT INTO projects (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)').run(id, name, now, now);
  return { id, name, createdAt: now, updatedAt: now, prompts: [] };
}

export function updateProject(id: string, name: string) {
  const now = Date.now();
  db.prepare('UPDATE projects SET name = ?, updated_at = ? WHERE id = ?').run(name, now, id);
}

export function deleteProject(id: string) {
  db.prepare('DELETE FROM prompts WHERE project_id = ?').run(id);
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
}

// Prompt operations
export function getPromptsByProjectId(projectId: string) {
  const prompts = db.prepare('SELECT * FROM prompts WHERE project_id = ? ORDER BY updated_at DESC').all(projectId) as {
    id: string;
    project_id: string;
    name: string;
    requirements: string;
    success_criteria: string;
    created_at: number;
    updated_at: number;
  }[];

  return prompts.map(p => ({
    id: p.id,
    name: p.name,
    requirements: p.requirements,
    successCriteria: p.success_criteria,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));
}

export function createPrompt(projectId: string, name: string) {
  const id = uuidv4();
  const now = Date.now();
  db.prepare('INSERT INTO prompts (id, project_id, name, requirements, success_criteria, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, projectId, name, '', '', now, now);
  db.prepare('UPDATE projects SET updated_at = ? WHERE id = ?').run(now, projectId);
  return { id, name, requirements: '', successCriteria: '', createdAt: now, updatedAt: now };
}

export function updatePrompt(id: string, projectId: string, field: string, value: string) {
  const now = Date.now();
  const dbField = field === 'successCriteria' ? 'success_criteria' : field;
  db.prepare(`UPDATE prompts SET ${dbField} = ?, updated_at = ? WHERE id = ?`).run(value, now, id);
  db.prepare('UPDATE projects SET updated_at = ? WHERE id = ?').run(now, projectId);
}

export function deletePrompt(id: string, projectId: string) {
  db.prepare('DELETE FROM prompts WHERE id = ?').run(id);
  db.prepare('UPDATE projects SET updated_at = ? WHERE id = ?').run(Date.now(), projectId);
}

// Template operations
export function getAllTemplates() {
  const templates = db.prepare('SELECT * FROM templates ORDER BY is_default DESC, created_at DESC').all() as {
    id: string;
    name: string;
    content: string;
    type: 'requirements' | 'success-criteria';
    is_default: number;
    created_at: number;
  }[];

  return templates.map(t => ({
    id: t.id,
    name: t.name,
    content: t.content,
    type: t.type,
    isDefault: t.is_default === 1,
    createdAt: t.created_at,
  }));
}

export function createTemplate(name: string, content: string, type: 'requirements' | 'success-criteria') {
  const id = uuidv4();
  const now = Date.now();
  db.prepare('INSERT INTO templates (id, name, content, type, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, name, content, type, 0, now);
  return { id, name, content, type, isDefault: false, createdAt: now };
}

export function updateTemplate(id: string, name: string, content: string) {
  db.prepare('UPDATE templates SET name = ?, content = ? WHERE id = ?').run(name, content, id);
}

export function deleteTemplate(id: string) {
  // Don't delete default templates
  const template = db.prepare('SELECT is_default FROM templates WHERE id = ?').get(id) as { is_default: number } | undefined;
  if (template && template.is_default === 1) {
    return false;
  }
  db.prepare('DELETE FROM templates WHERE id = ?').run(id);
  return true;
}

// Export all data as JSON
export function exportAllData() {
  const projects = getAllProjects();
  const templates = getAllTemplates();
  return {
    exportedAt: new Date().toISOString(),
    projects,
    templates: templates.filter(t => !t.isDefault), // Only export custom templates
  };
}

// Import data from JSON
export function importData(data: { projects?: Array<{ name: string; prompts: Array<{ name: string; requirements: string; successCriteria: string }> }>; templates?: Array<{ name: string; content: string; type: 'requirements' | 'success-criteria' }> }) {
  if (data.projects) {
    for (const project of data.projects) {
      const newProject = createProject(project.name);
      if (project.prompts) {
        for (const prompt of project.prompts) {
          const newPrompt = createPrompt(newProject.id, prompt.name);
          if (prompt.requirements) {
            updatePrompt(newPrompt.id, newProject.id, 'requirements', prompt.requirements);
          }
          if (prompt.successCriteria) {
            updatePrompt(newPrompt.id, newProject.id, 'successCriteria', prompt.successCriteria);
          }
        }
      }
    }
  }
  if (data.templates) {
    for (const template of data.templates) {
      createTemplate(template.name, template.content, template.type);
    }
  }
}
