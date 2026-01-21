# Prompt Builder & Organizer

A lightweight Next.js/Tailwind application for organizing and composing prompts for AI coding tools.

## Features

- **Project-based Organization** - Create and manage multiple projects in the left sidebar, each containing multiple prompts
- **Prompt Editor** - Two-column layout with Requirements and Success Criteria on the left, Constructed Prompt preview on the right
- **Standard Templates** - Click template buttons in the right panel to insert predefined snippets into your prompts
- **Add to Standards** - Select/highlight text in either textarea and click "Add to Standards" to save it as a reusable template
- **Manage Standards** - View, edit, and delete your custom templates through the "Manage Standards" panel
- **Dictation Support** - Click the microphone button to dictate into the active textarea using Web Speech API
- **Export to Clipboard** - Copy the combined prompt (Requirements + Success Criteria) formatted for CLI usage
- **Export to JSON** - Export all your projects, prompts, and custom templates as a JSON file for backup/transfer
- **SQLite Persistence** - All data stored in a local SQLite database for reliability and performance

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Managing Projects

1. Click **+ New** in the Projects section to create a new project
2. Click on a project name to select it
3. Hover over a project and click the X to delete it

### Managing Prompts

1. Select a project first
2. Click **+ New** in the Prompts section to create a new prompt
3. Click on a prompt to select and edit it
4. Hover over a prompt and click the X to delete it

### Using the Prompt Editor

1. Enter requirements in the **Requirements** textarea (left column, top)
2. Enter success criteria in the **Success Criteria** textarea (left column, bottom)
3. Click **Update Prompt** to generate the combined prompt in the preview pane (right column)
4. Click **Copy to Clipboard** to copy the constructed prompt

### Using Templates

1. The right panel shows available templates grouped by type (Requirements / Success Criteria)
2. Click any template button to append its content to the corresponding textarea
3. Default templates are included:
   - Requirements: "Use nextJS/tailwind with permanent local storage"
   - Requirements: "Store all data in a SQLite database using better-sqlite3"
   - Requirements: "Include an export to JSON button for data portability"
   - Success Criteria: "All requirements implemented, no linter errors, documentation updated..."

### Creating Custom Templates (Add to Standards)

1. Select/highlight text in either the Requirements or Success Criteria textarea
2. Click the **Add to Standards** button that appears in the header
3. In the Templates panel, click **Name & Save**
4. Enter a name for your template and click Save
5. Your template will appear in the Templates panel for future use

### Managing Standards (Edit/Delete Templates)

1. Click **Manage Standards** in the Templates panel
2. View all templates grouped by type
3. Click **Edit** to modify a template's name or content
4. Click **Delete** to remove custom templates (default templates cannot be deleted)

### Using Dictation

1. Click the microphone icon next to Requirements or Success Criteria
2. Allow microphone access when prompted
3. Speak your text - it will be appended to the textarea
4. Click the microphone again (now red/pulsing) to stop dictation

### Exporting Data

**Export to Clipboard:**
1. Click **Update Prompt** to generate the combined prompt
2. Click **Copy to Clipboard** to copy the formatted prompt

**Export to JSON:**
1. Click **Export JSON** in the Templates panel
2. View the JSON data in the preview
3. Click **Copy** to copy to clipboard or **Download** to save as a file

## Tech Stack

- Next.js 16+ with App Router
- React 19 with TypeScript
- Tailwind CSS v4
- SQLite (better-sqlite3) for persistence
- Web Speech API for dictation

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── state/        # GET all data
│   │   ├── projects/     # CRUD for projects
│   │   ├── prompts/      # CRUD for prompts
│   │   ├── templates/    # CRUD for templates
│   │   └── export/       # Export data as JSON
│   ├── globals.css       # Tailwind config and custom styles
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Main page component
├── components/
│   ├── Sidebar.tsx       # Project and prompt list
│   ├── PromptEditor.tsx  # Main editing area with two-column layout
│   └── TemplatesPanel.tsx # Right panel with templates and export
├── context/
│   └── AppContext.tsx    # React Context for state management
├── lib/
│   ├── database.ts       # SQLite database operations
│   └── storage.ts        # Utility functions
└── types/
    └── index.ts          # TypeScript type definitions
data/
└── prompts.db            # SQLite database (gitignored)
```

## Database

Data is stored in `data/prompts.db` (SQLite). The database is automatically created on first run with default templates.

Tables:
- `projects` - Project metadata
- `prompts` - Prompt content linked to projects
- `templates` - Standard requirement/success criteria snippets
