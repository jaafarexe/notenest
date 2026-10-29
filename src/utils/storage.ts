import { Note, Tag } from '../types/note';
import { INITIAL_NOTES, INITIAL_TAGS } from '../data/sampleNotes';

const STORAGE_KEY_NOTES = 'notenest_notes_v1';
const STORAGE_KEY_TAGS = 'notenest_tags_v1';

export function loadNotesFromStorage(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    if (!raw) {
      // First time initialization
      saveNotesToStorage(INITIAL_NOTES);
      return INITIAL_NOTES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load notes from localStorage, falling back to samples:', err);
  }
  return INITIAL_NOTES;
}

export function saveNotesToStorage(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save notes to localStorage:', err);
  }
}

export function loadTagsFromStorage(): Tag[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TAGS);
    if (!raw) {
      saveTagsToStorage(INITIAL_TAGS);
      return INITIAL_TAGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load tags from localStorage:', err);
  }
  return INITIAL_TAGS;
}

export function saveTagsToStorage(tags: Tag[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(tags));
  } catch (err) {
    console.error('Failed to save tags to localStorage:', err);
  }
}

export function exportBackupJSON(notes: Note[], tags: Tag[]): void {
  const payload = {
    app: 'NoteNest',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    notes,
    tags,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `notenest-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadNoteMarkdown(note: Note): void {
  const content = `# ${note.title}\n\n${note.content}`;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeTitle = note.title.trim().toLowerCase().replace(/[^a-z0-9_-]/gi, '-').slice(0, 40) || 'untitled';
  a.href = url;
  a.download = `${safeTitle}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function resetToSampleData(): { notes: Note[]; tags: Tag[] } {
  saveNotesToStorage(INITIAL_NOTES);
  saveTagsToStorage(INITIAL_TAGS);
  return { notes: INITIAL_NOTES, tags: INITIAL_TAGS };
}
