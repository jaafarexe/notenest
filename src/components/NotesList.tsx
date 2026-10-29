import React, { useRef } from 'react';
import {
  Search,
  X,
  Pin,
  Star,
  Trash2,
  RotateCcw,
  Menu,
  Plus,
  SlidersHorizontal,
  LayoutList,
  LayoutGrid,
  FileQuestion,
  Tag as TagIcon,
  Clock,
} from 'lucide-react';
import {
  Note,
  Tag,
  CategoryFilter,
  SortOption,
  ViewMode,
  NOTE_COLOR_STYLES,
  TAG_COLOR_MAP,
} from '../types/note';
import { formatRelativeTime } from '../utils/date';

interface NotesListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (note: Note) => void;
  onNewNote: () => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDeleteNote: (id: string, e: React.MouseEvent) => void;
  onRestoreNote: (id: string, e: React.MouseEvent) => void;
  onPermanentDelete: (id: string, e: React.MouseEvent) => void;
  onEmptyTrash: () => void;
  category: CategoryFilter;
  selectedTagId: string | null;
  onSelectTag: (tagId: string | null) => void;
  tags: Tag[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenMobileSidebar: () => void;
}

export const NotesList: React.FC<NotesListProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onNewNote,
  onTogglePin,
  onToggleFavorite,
  onDeleteNote,
  onRestoreNote,
  onPermanentDelete,
  onEmptyTrash,
  category,
  selectedTagId,
  onSelectTag,
  tags,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onOpenMobileSidebar,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedTag = tags.find((t) => t.id === selectedTagId);

  // Group notes into pinned and normal when category is 'all' and no active search query
  const isAllCategory = category === 'all' && !selectedTagId;
  const pinnedNotes = isAllCategory ? notes.filter((n) => n.isPinned) : [];
  const otherNotes = isAllCategory ? notes.filter((n) => !n.isPinned) : notes;

  const renderNoteCard = (note: Note) => {
    const isSelected = selectedNoteId === note.id;
    const colorStyle = NOTE_COLOR_STYLES[note.colorTheme] || NOTE_COLOR_STYLES.default;
    const noteTags = tags.filter((t) => note.tags.includes(t.id));

    // Get plain text preview by removing basic markdown tags
    const cleanPreview = note.content
      .replace(/#+\s+/g, '')
      .replace(/[-*]\s*\[([ xX])\]\s*/g, '')
      .replace(/[-*]\s+/g, '')
      .replace(/`{3}[\s\S]*?`{3}/g, '[Code]')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/>\s+/g, '')
      .slice(0, 160)
      .trim();

    return (
      <div
        key={note.id}
        onClick={() => onSelectNote(note)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectNote(note);
          }
        }}
        className={`group relative rounded-xl p-3.5 transition-all text-left border cursor-pointer ${
          colorStyle.bgLight
        } ${colorStyle.bgDark} ${
          isSelected
            ? 'ring-2 ring-slate-900 dark:ring-sky-500 border-transparent shadow-sm'
            : `${colorStyle.borderLight} ${colorStyle.borderDark} hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-xs`
        }`}
      >
        {/* Top Header inside Card: Title + Pin/Star Actions */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1 break-words">
            {highlightMatch(note.title || 'Untitled Note', searchQuery)}
          </h3>

          <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
            {!note.isTrash && (
              <>
                <button
                  type="button"
                  onClick={(e) => onTogglePin(note.id, e)}
                  className={`p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors ${
                    note.isPinned ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
                  aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
                >
                  <Pin className="w-3.5 h-3.5 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={(e) => onToggleFavorite(note.id, e)}
                  className={`p-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors ${
                    note.isFavorite ? 'text-amber-400' : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  aria-label={note.isFavorite ? 'Remove favorite' : 'Add favorite'}
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                </button>
              </>
            )}

            {note.isTrash ? (
              <>
                <button
                  type="button"
                  onClick={(e) => onRestoreNote(note.id, e)}
                  className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                  title="Restore note"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => onPermanentDelete(note.id, e)}
                  className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={(e) => onDeleteNote(note.id, e)}
                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Move to trash"
                aria-label="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Snippet */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3 break-words">
          {cleanPreview ? highlightMatch(cleanPreview, searchQuery) : <span className="italic text-slate-400">Empty note...</span>}
        </p>

        {/* Bottom Metadata: Tags + Time */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
          <div className="flex items-center gap-1.5 flex-wrap overflow-hidden">
            {noteTags.slice(0, 2).map((t) => {
              const cDef = TAG_COLOR_MAP[t.color];
              return (
                <span
                  key={t.id}
                  className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${cDef.bg} ${cDef.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cDef.dot}`} />
                  <span className="truncate max-w-[80px]">{t.name}</span>
                </span>
              );
            })}
            {noteTags.length > 2 && (
              <span className="text-[10px] text-slate-400">+{noteTags.length - 2}</span>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-mono text-[11px] tabular-nums shrink-0 ml-auto">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(note.updatedAt)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden border-r border-slate-200/80 dark:border-slate-800">
      {/* Top Bar Zone: Breadcrumb & View controls */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="md:hidden p-1.5 -ml-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-md"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white capitalize flex items-center gap-1.5">
              {selectedTag ? (
                <>
                  <TagIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>#{selectedTag.name}</span>
                </>
              ) : category === 'all' ? (
                'All Notes'
              ) : category === 'pinned' ? (
                'Pinned Notes'
              ) : category === 'favorites' ? (
                'Favorites'
              ) : (
                'Trash'
              )}
            </h1>
            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </span>
          </div>
        </div>

        {/* Right Action: Empty Trash button OR New Note button */}
        <div className="flex items-center gap-2">
          {category === 'trash' ? (
            notes.length > 0 && (
              <button
                type="button"
                onClick={onEmptyTrash}
                className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-md transition-colors"
              >
                Empty Trash
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={onNewNote}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-sky-500 dark:hover:bg-sky-400 hover:bg-slate-800 text-xs font-medium transition-all shadow-xs md:hidden"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-1 rounded ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="List view"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1 rounded ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Compact Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="p-3 border-b border-slate-200/60 dark:border-slate-800/80 space-y-2 shrink-0 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search titles, tags, or content..."
            className="w-full pl-9 pr-14 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-sky-500 transition-all"
          />
          <div className="absolute right-2 top-2 flex items-center gap-1">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-1 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Secondary Bar: Sort Dropdown + Quick Filter Tags */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 overflow-x-auto py-0.5 scrollbar-none">
            <span className="text-[11px] font-medium shrink-0">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="bg-transparent border-none text-slate-700 dark:text-slate-300 font-medium text-xs focus:outline-none cursor-pointer py-0.5"
            >
              <option value="updated-desc">Recently updated</option>
              <option value="updated-asc">Oldest updated</option>
              <option value="created-desc">Date created</option>
              <option value="title-asc">Title (A → Z)</option>
              <option value="title-desc">Title (Z → A)</option>
            </select>
          </div>

          {selectedTag && (
            <button
              type="button"
              onClick={() => onSelectTag(null)}
              className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Clear #{selectedTag.name}</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Note Cards Container */}
      <div className="flex-1 overflow-y-auto p-3">
        {notes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <FileQuestion className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {searchQuery ? 'No matching notes found' : 'No notes in this view'}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mb-4">
              {searchQuery
                ? `No results for "${searchQuery}". Try searching for another keyword or tag.`
                : category === 'trash'
                ? 'Your trash is currently empty.'
                : 'Get started by creating your first note or selecting another view.'}
            </p>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Clear Search
              </button>
            ) : category !== 'trash' ? (
              <button
                type="button"
                onClick={onNewNote}
                className="px-3.5 py-1.5 text-xs font-medium bg-slate-900 text-white dark:bg-sky-500 dark:hover:bg-sky-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Note</span>
              </button>
            ) : null}
          </div>
        ) : isAllCategory && pinnedNotes.length > 0 ? (
          <div className="space-y-4">
            {/* Pinned Section */}
            <div>
              <div className="flex items-center gap-1.5 px-1 mb-2">
                <Pin className="w-3 h-3 text-amber-500 fill-current" />
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Pinned ({pinnedNotes.length})
                </span>
              </div>
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5' : 'space-y-2.5'}>
                {pinnedNotes.map((note) => renderNoteCard(note))}
              </div>
            </div>

            {/* Other Notes Section */}
            {otherNotes.length > 0 && (
              <div>
                <div className="px-1 mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Notes ({otherNotes.length})
                  </span>
                </div>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5' : 'space-y-2.5'}>
                  {otherNotes.map((note) => renderNoteCard(note))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5' : 'space-y-2.5'}>
            {notes.map((note) => renderNoteCard(note))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper for clean highlighting of matching search terms without dangerous innerHTML
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={index}
            className="bg-amber-200 dark:bg-amber-900/70 text-slate-900 dark:text-amber-100 rounded-xs px-0.5 font-medium"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
