# Project Documentation

## Purpose
Prompt Builder & Organizer is a web application for organizing and composing prompts for AI coding tools like Claude Code. It helps users manage multiple projects, each containing reusable prompt templates with Requirements and Success Criteria sections.

## Current Status
**MVP Complete** - All core features implemented and working. Application is stable and ready for use. Data persisted in SQLite database.

## Architecture Overview
```
┌─────────────────────────────────────────────────────┐
│                  Next.js 16 App                      │
├─────────────────────────────────────────────────────┤
│  Frontend (React 19 + Tailwind CSS v4)              │
│  ├── Sidebar (projects + prompts list)              │
│  ├── PromptEditor (two-column layout)               │
│  │   ├── Left: Requirements + Success Criteria      │
│  │   └── Right: Constructed Prompt preview          │
│  └── TemplatesPanel (collapsible, right side)       │
│      ├── Template buttons with Add All              │
│      ├── Add to Standards workflow                  │
│      ├── Manage Standards (edit/delete)             │
│      └── Export JSON                                │
├─────────────────────────────────────────────────────┤
│  State Management (React Context)                   │
│  └── AppContext (projects, prompts, templates)      │
│      └── API calls for persistence                  │
├─────────────────────────────────────────────────────┤
│  API Routes (/api/*)                                │
│  ├── /state - GET all projects and templates        │
│  ├── /projects - POST, PUT, DELETE                  │
│  ├── /prompts - POST, PUT, DELETE                   │
│  ├── /templates - GET, POST, PUT, DELETE            │
│  └── /export - GET JSON export                      │
├─────────────────────────────────────────────────────┤
│  Database (SQLite via better-sqlite3)               │
│  └── data/prompts.db                                │
│      ├── projects (id, name, timestamps)            │
│      ├── prompts (id, project_id, name, content)    │
│      └── templates (id, name, content, type, default)│
└─────────────────────────────────────────────────────┘
```

**Data Flow:**
1. User actions dispatch to AppContext
2. Context makes API calls to persist changes
3. API routes interact with SQLite database
4. UI updates optimistically for responsiveness
5. Default templates auto-inserted on first run

## Key Decisions

- **SQLite over localStorage:**
  - **Rationale:** Enables larger datasets, proper queries, data portability, and server-side persistence
  - **Implementation:** better-sqlite3 with WAL mode for performance

- **API Routes for all data operations:**
  - **Rationale:** Clean separation of concerns, enables future features like multi-user support
  - **Pattern:** RESTful endpoints (GET/POST/PUT/DELETE)

- **Two-column editor layout:**
  - **Rationale:** Requirements and Success Criteria visible together, with live Constructed Prompt preview
  - **Implementation:** Flex layout with stacked inputs on left, preview on right

- **Template duplicate detection:**
  - **Rationale:** Prevent accidentally adding the same template twice
  - **Implementation:** Templates show checkmark and disable when already in prompt

- **Removed dictation feature:**
  - **Rationale:** macOS native dictation features are sufficient; reduced complexity

- **React Context over Redux:**
  - **Rationale:** Sufficient for app complexity; reduces dependencies

- **Tailwind CSS v4:**
  - **Rationale:** Modern styling with @source directives for component scanning

- **Dark mode by default:**
  - **Rationale:** Better for developers who use the tool alongside code editors

## Configuration & Environment

- **Node.js:** 18+ required
- **No environment variables:** Self-contained
- **Database:** Auto-created at `data/prompts.db` on first run
- **Port:** Default 3000 (configurable via Next.js)

**Dependencies:**
- next: 16.1.4
- react: 19.2.3
- better-sqlite3: ^12.6.2
- uuid: ^13.0.0
- tailwindcss: ^4

**Setup:**
```bash
npm install
npm run dev
```

## Work Completed

### Core Features
- [x] Project CRUD (create, select, delete)
- [x] Prompt CRUD within projects
- [x] Two-column editor layout (inputs + preview)
- [x] Update Prompt button to generate combined output
- [x] Copy to Clipboard functionality

### Templates System
- [x] Standard templates with 4 defaults
- [x] Add to Standards (select text → name → save)
- [x] Manage Standards panel (edit/delete templates)
- [x] Template type categorization (requirements/success-criteria)
- [x] Add All button per template section
- [x] Duplicate detection (checkmark + disabled state)
- [x] Default template protection (cannot delete)

### Data Layer
- [x] SQLite database with better-sqlite3
- [x] API routes for all CRUD operations
- [x] Export to JSON (projects + custom templates)
- [x] WAL mode for database performance
- [x] Foreign key cascade delete

### UI/UX
- [x] Dark mode sidebar
- [x] Collapsible templates panel
- [x] Inline prompt renaming
- [x] Blue text on light background (readable)
- [x] Zero linter errors

## Open Items / Next Steps

- [ ] Import from JSON (restore backups)
- [ ] Prompt search/filter
- [ ] Template categories/tags
- [ ] Keyboard shortcuts
- [ ] Mobile responsive improvements
- [ ] Drag-and-drop prompt reordering

## Change Log

### 2026-01-21 (Update)
- **Documentation recreated** to reflect current architecture
- Major changes since initial doc:
  - Migrated from localStorage to SQLite database
  - Added 5 API routes (state, projects, prompts, templates, export)
  - Removed Web Speech API dictation feature
  - Added Manage Standards panel (edit/delete templates)
  - Added Export to JSON functionality
  - Added "Add All" buttons for template sections
  - Added duplicate detection for templates
  - Changed to two-column editor layout with Constructed Prompt preview
  - Updated .gitignore with additional entries
- GitHub repository created: https://github.com/emmalone/prompt-builder

### 2026-01-21 (Initial)
- Initial project creation
- MVP features implemented
- Initial documentation created
