# Project Documentation

## Purpose
Prompt Builder & Organizer is a web application for organizing and composing prompts for AI coding tools like Claude Code. It helps users manage multiple projects, each containing reusable prompt templates with Requirements and Success Criteria sections.

## Current Status
**MVP Complete** - All core features implemented and working. Application is stable and ready for use.

## Architecture Overview
```
┌─────────────────────────────────────────────────────┐
│                  Next.js 16 App                      │
├─────────────────────────────────────────────────────┤
│  Frontend (React 19 + Tailwind CSS v4)              │
│  ├── Sidebar (projects + prompts list)              │
│  ├── PromptEditor (requirements + success criteria) │
│  └── TemplatesPanel (collapsible, right side)       │
├─────────────────────────────────────────────────────┤
│  State Management (React Context)                   │
│  └── AppContext (projects, prompts, templates)      │
├─────────────────────────────────────────────────────┤
│  Persistence (localStorage)                         │
│  └── storage.ts utilities                           │
├─────────────────────────────────────────────────────┤
│  Browser APIs                                       │
│  ├── Web Speech API (dictation)                     │
│  └── Clipboard API (export)                         │
└─────────────────────────────────────────────────────┘
```

**Data Flow:**
1. User actions dispatch to AppContext reducer
2. State updates trigger localStorage save
3. On load, state hydrates from localStorage
4. Default templates injected if missing

## Key Decisions
- **localStorage over database:** Simplicity for single-user local tool; no backend required
- **React Context over Redux:** Sufficient for app complexity; reduces dependencies
- **Web Speech API for dictation:** Native browser support, no third-party services
- **Tailwind CSS v4:** Modern styling with @source directives for component scanning
- **Dark mode by default:** Better for developers who use the tool alongside code editors

## Configuration & Environment
- **Node.js:** 18+ required
- **No environment variables:** Self-contained, runs entirely in browser
- **Browser requirements:** Modern browser with localStorage and optional Web Speech API support
- **Port:** Default 3000 (configurable via Next.js)

**Setup:**
```bash
npm install
npm run dev
```

## Work Completed
- [x] Project CRUD (create, select, delete)
- [x] Prompt CRUD within projects
- [x] Dual textarea editor (Requirements + Success Criteria)
- [x] Standard templates with defaults
- [x] Add to Standards (text selection → new template)
- [x] Dictation support via Web Speech API
- [x] Export to clipboard (formatted output)
- [x] localStorage persistence
- [x] Dark mode UI
- [x] Collapsible templates panel
- [x] Inline prompt renaming
- [x] Zero linter errors

## Open Items / Next Steps
- [ ] Template editing (currently only add/delete)
- [ ] Prompt search/filter
- [ ] Template categories/tags
- [ ] Import/export all data as JSON
- [ ] Keyboard shortcuts
- [ ] Mobile responsive improvements

## Change Log

### 2026-01-21
- Initial project creation
- All MVP features implemented
- Documentation created
- Build verified with zero linter errors
