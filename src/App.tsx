/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Note,
  Tag,
  CategoryFilter,
  SortOption,
  ViewMode,
} from './types/note';
import {
  loadNotesFromStorage,
  saveNotesToStorage,
  loadTagsFromStorage,
  saveTagsToStorage,
} from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { NotesList } from './components/NotesList';
import { NoteEditor } from './components/NoteEditor';
import { TagModal } from './components/TagModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotesFromStorage());
  const [tags, setTags] = useState<Tag[]>(() => loadTagsFromStorage());
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(() => {
    const initialNotes = loadNotesFromStorage();
    const active = initialNotes.filter((n) => !n.isTrash);
    return active.length > 0 ? active[0].id : null;
  });

  // Filter state
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Mobile state: on mobile, if a note is selected and mobileView === 'editor', show editor
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Undo toast state
  const [toast, setToast] = useState<{ message: string; undoAction?: () => void } | null>(null);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('notenest_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Sync theme class to documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('notenest_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('notenest_theme', 'light');
    }
  }, [isDarkMode]);

  // Persist notes and tags on change
  useEffect(() => {
    saveNotesToStorage(notes);
  }, [notes]);

  useEffect(() => {
    saveTagsToStorage(tags);
  }, [tags]);

  // Counts for sidebar navigation
  const counts = useMemo(() => {
    const active = notes.filter((n) => !n.isTrash);
    return {
      all: active.length,
      pinned: active.filter((n) => n.isPinned).length,
      favorites: active.filter((n) => n.isFavorite).length,
      trash: notes.filter((n) => n.isTrash).length,
    };
  }, [notes]);

  // Tag usage count
  const notesTagCount = useMemo(() => {
    const countMap: Record<string, number> = {};
    const active = notes.filter((n) => !n.isTrash);
    for (const n of active) {
      for (const tId of n.tags) {
        countMap[tId] = (countMap[tId] || 0) + 1;
      }
    }
    return countMap;
  }, [notes]);

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let result = notes.filter((note) => {
      // 1. Trash status
      if (category === 'trash') {
        if (!note.isTrash) return false;
      } else {
        if (note.isTrash) return false;
      }

      // 2. Category filtering
      if (category === 'pinned' && !note.isPinned) return false;
      if (category === 'favorites' && !note.isFavorite) return false;

      // 3. Tag filtering
      if (selectedTagId && !note.tags.includes(selectedTagId)) return false;

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = note.title.toLowerCase().includes(q);
        const matchesContent = note.content.toLowerCase().includes(q);
        const matchesTag = tags.some(
          (t) => note.tags.includes(t.id) && t.name.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesContent && !matchesTag) return false;
      }

      return true;
    });

    // Sort result
    result = [...result].sort((a, b) => {
      // If category is 'all' and no tag filter and no search, pinned notes always appear first in their section,
      // but inside each section or for other views, apply chosen sort:
      if (sortBy === 'updated-desc') return b.updatedAt - a.updatedAt;
      if (sortBy === 'updated-asc') return a.updatedAt - b.updatedAt;
      if (sortBy === 'created-desc') return b.createdAt - a.createdAt;
      if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'title-desc') return (b.title || '').localeCompare(a.title || '');
      return b.updatedAt - a.updatedAt;
    });

    return result;
  }, [notes, category, selectedTagId, searchQuery, sortBy, tags]);

  // Currently selected note object
  const selectedNote = useMemo(() => {
    if (!selectedNoteId) return null;
    return notes.find((n) => n.id === selectedNoteId) || null;
  }, [notes, selectedNoteId]);

  // Create new note
  const handleNewNote = useCallback(() => {
    const now = Date.now();
    const newNote: Note = {
      id: `note-${now}-${Math.random().toString(36).substring(2, 6)}`,
      title: 'Untitled Note',
      content: '',
      tags: selectedTagId ? [selectedTagId] : [],
      isPinned: category === 'pinned',
      isFavorite: category === 'favorites',
      isTrash: false,
      colorTheme: 'default',
      createdAt: now,
      updatedAt: now,
    };

    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setMobileView('editor');
    if (category === 'trash') {
      setCategory('all');
    }
  }, [category, selectedTagId]);

  // Update note
  const handleUpdateNote = useCallback((updatedFields: Partial<Note>) => {
    if (!selectedNoteId) return;
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === selectedNoteId) {
          return {
            ...n,
            ...updatedFields,
            updatedAt: updatedFields.updatedAt || Date.now(),
          };
        }
        return n;
      })
    );
  }, [selectedNoteId]);

  // Toggle pin
  const handleTogglePin = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: Date.now() } : n))
    );
  }, []);

  // Toggle favorite
  const handleToggleFavorite = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite, updatedAt: Date.now() } : n))
    );
  }, []);

  // Soft delete / Move to trash
  const handleDeleteNote = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = notes.find((n) => n.id === id);
    if (!target) return;

    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isTrash: true, updatedAt: Date.now() } : n))
    );

    // If deleting the active note, select next available active note
    if (selectedNoteId === id) {
      const remaining = notes.filter((n) => !n.isTrash && n.id !== id);
      setSelectedNoteId(remaining.length > 0 ? remaining[0].id : null);
      if (remaining.length === 0) setMobileView('list');
    }

    // Show undo toast
    setToast({
      message: `"${target.title || 'Untitled'}" moved to trash`,
      undoAction: () => {
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isTrash: false, updatedAt: Date.now() } : n))
        );
        setSelectedNoteId(id);
        setToast(null);
      },
    });

    setTimeout(() => {
      setToast((curr) => (curr?.message.includes(target.title || 'Untitled') ? null : curr));
    }, 4500);
  }, [notes, selectedNoteId]);

  // Restore note from trash
  const handleRestoreNote = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isTrash: false, updatedAt: Date.now() } : n))
    );
  }, []);

  // Permanently delete from trash
  const handlePermanentDelete = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
  }, [selectedNoteId]);

  // Empty trash
  const handleEmptyTrash = useCallback(() => {
    if (window.confirm('Are you sure you want to permanently delete all notes in Trash? This cannot be undone.')) {
      setNotes((prev) => prev.filter((n) => !n.isTrash));
      setSelectedNoteId(null);
    }
  }, []);

  // Duplicate note
  const handleDuplicateNote = useCallback((source: Note) => {
    const now = Date.now();
    const duplicated: Note = {
      ...source,
      id: `note-${now}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${source.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [duplicated, ...prev]);
    setSelectedNoteId(duplicated.id);
  }, []);

  // Tag management
  const handleAddTag = useCallback((name: string, color: Tag['color']) => {
    const newTag: Tag = {
      id: `tag-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name,
      color,
    };
    setTags((prev) => [...prev, newTag]);
  }, []);

  const handleUpdateTag = useCallback((id: string, name: string, color: Tag['color']) => {
    setTags((prev) => prev.map((t) => (t.id === id ? { ...t, name, color } : t)));
  }, []);

  const handleDeleteTag = useCallback((id: string) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
    // Remove tag reference from all notes
    setNotes((prev) =>
      prev.map((n) => (n.tags.includes(id) ? { ...n, tags: n.tags.filter((t) => t !== id) } : n))
    );
    if (selectedTagId === id) setSelectedTagId(null);
  }, [selectedTagId]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively writing in an input or textarea (except for shortcuts with Ctrl/Cmd)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // ⌘N / Ctrl+N: New note
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewNote();
        return;
      }

      // / or ⌘K / Ctrl+K: Focus search
      if ((!isInput && e.key === '/') || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
        searchInput?.focus();
        searchInput?.select();
        return;
      }

      // ⌘P / Ctrl+P: Toggle pin on active note
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        if (selectedNoteId) {
          e.preventDefault();
          handleTogglePin(selectedNoteId);
        }
        return;
      }

      // Esc: Close modals
      if (e.key === 'Escape') {
        setIsTagModalOpen(false);
        setIsSettingsModalOpen(false);
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewNote, selectedNoteId, handleTogglePin]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-slate-200 dark:selection:bg-slate-800">
      {/* Sidebar: Navigation, Tags, Themes, Settings */}
      <Sidebar
        activeCategory={category}
        selectedTagId={selectedTagId}
        onSelectCategory={(cat) => {
          setCategory(cat);
          setSelectedTagId(null);
        }}
        onSelectTag={(tagId) => {
          setSelectedTagId(tagId);
        }}
        onNewNote={handleNewNote}
        tags={tags}
        onOpenTagModal={() => setIsTagModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        counts={counts}
        notesTagCount={notesTagCount}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area: Responsive split between NotesList and NoteEditor */}
      <main className="flex-1 flex overflow-hidden">
        {/* Notes List Column */}
        <div
          className={`h-full w-full md:w-80 lg:w-96 shrink-0 ${
            mobileView === 'editor' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <NotesList
            notes={filteredNotes}
            selectedNoteId={selectedNoteId}
            onSelectNote={(note) => {
              setSelectedNoteId(note.id);
              setMobileView('editor');
            }}
            onNewNote={handleNewNote}
            onTogglePin={handleTogglePin}
            onToggleFavorite={handleToggleFavorite}
            onDeleteNote={handleDeleteNote}
            onRestoreNote={handleRestoreNote}
            onPermanentDelete={handlePermanentDelete}
            onEmptyTrash={handleEmptyTrash}
            category={category}
            selectedTagId={selectedTagId}
            onSelectTag={setSelectedTagId}
            tags={tags}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />
        </div>

        {/* Note Editor Column */}
        <div
          className={`h-full flex-1 ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <NoteEditor
            note={selectedNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={(id) => handleDeleteNote(id)}
            onDuplicateNote={handleDuplicateNote}
            onBackMobile={() => setMobileView('list')}
            tags={tags}
            onOpenTagModal={() => setIsTagModalOpen(true)}
          />
        </div>
      </main>

      {/* Toast Notification with Undo */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xl border border-slate-800 dark:border-slate-200 text-xs animate-in slide-in-from-bottom-3 duration-150">
          <span>{toast.message}</span>
          {toast.undoAction && (
            <button
              type="button"
              onClick={toast.undoAction}
              className="px-2 py-0.5 rounded font-semibold bg-white/20 dark:bg-black/10 hover:bg-white/30 dark:hover:bg-black/20 transition-colors cursor-pointer text-amber-300 dark:text-amber-700"
            >
              Undo
            </button>
          )}
        </div>
      )}

      {/* Tag Management Modal */}
      <TagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        tags={tags}
        onAddTag={handleAddTag}
        onUpdateTag={handleUpdateTag}
        onDeleteTag={handleDeleteTag}
        notesTagCount={notesTagCount}
      />

      {/* Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        notes={notes}
        tags={tags}
        onImportBackup={(importedNotes, importedTags) => {
          setNotes(importedNotes);
          setTags(importedTags);
          if (importedNotes.length > 0) setSelectedNoteId(importedNotes[0].id);
        }}
        onResetSamples={(sampleNotes, sampleTags) => {
          setNotes(sampleNotes);
          setTags(sampleTags);
          setSelectedNoteId(sampleNotes[0].id);
        }}
      />
    </div>
  );
}
