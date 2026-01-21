import { Prompt } from '@/types';

export function formatPromptForExport(prompt: Prompt): string {
  const parts: string[] = [];

  if (prompt.requirements.trim()) {
    parts.push('## Requirements\n' + prompt.requirements.trim());
  }

  if (prompt.successCriteria.trim()) {
    parts.push('## Success Criteria\n' + prompt.successCriteria.trim());
  }

  return parts.join('\n\n');
}
