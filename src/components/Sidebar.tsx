import React from 'react';
import {
  FileText,
  Pin,
  Star,
  Trash2,
  Plus,
  Tag as TagIcon,
  Sun,
  Moon,
  Settings,
  X,
  FolderOpen,
} from 'lucide-react';
import { CategoryFilter, Tag, TAG_COLOR_MAP } from '../types/note';

interface SidebarProps {
  activeCategory: CategoryFilter;
  selectedTagId: string | null;
  onSelectCategory: (category: CategoryFilter) => void;
  onSelectTag: (tagId: string | null) => void;
  onNewNote: () => void;
  tags: Tag[];
  onOpenTagModal: () => void;
  onOpenSettingsModal: () => void;
  counts: {
    all: number;
    pinned: number;
    favorites: number;
    trash: number;
  };
  notesTagCount: Record<string, number>;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeCategory,
  selectedTagId,
  onSelectCategory,
  onSelectTag,
  onNewNote,
  tags,
  onOpenTagModal,
  onOpenSettingsModal,
  counts,
  notesTagCount,
  isDarkMode,
  onToggleTheme,
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 md:w-60 lg:w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Brand Bar */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <span className="text-sm tracking-tight">N</span>
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-none block">
                NoteNest
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">
                Smart Notes
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Note Button CTA */}
        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              onNewNote();
              if (isOpenMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-900 text-white dark:bg-sky-500 dark:hover:bg-sky-400 hover:bg-slate-800 transition-all font-medium text-xs shadow-xs cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-150" />
              <span>New Note</span>
            </div>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/20 dark:bg-black/20 text-white/90">
              ⌘N
            </kbd>
          </button>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-5">
          <div className="space-y-0.5">
            <span className="px-2.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
              Views
            </span>
            <button
              type="button"
              onClick={() => {
                onSelectCategory('all');
                onSelectTag(null);
                if (isOpenMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeCategory === 'all' && selectedTagId === null
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>All Notes</span>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-slate-400">{counts.all}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectCategory('pinned');
                onSelectTag(null);
                if (isOpenMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeCategory === 'pinned' && selectedTagId === null
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Pin className="w-3.5 h-3.5 text-amber-500" />
                <span>Pinned</span>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-slate-400">{counts.pinned}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectCategory('favorites');
                onSelectTag(null);
                if (isOpenMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeCategory === 'favorites' && selectedTagId === null
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>Favorites</span>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-slate-400">{counts.favorites}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectCategory('trash');
                onSelectTag(null);
                if (isOpenMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeCategory === 'trash' && selectedTagId === null
                  ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-rose-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Trash</span>
              </div>
              <span className="text-[11px] font-mono tabular-nums text-slate-400">{counts.trash}</span>
            </button>
          </div>

          {/* Tags Section */}
          <div>
            <div className="flex items-center justify-between px-2.5 mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Tags
              </span>
              <button
                type="button"
                onClick={onOpenTagModal}
                className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
                title="Manage tags"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5">
              {tags.map((tag) => {
                const colorDef = TAG_COLOR_MAP[tag.color];
                const count = notesTagCount[tag.id] || 0;
                const isSelected = selectedTagId === tag.id;

                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        onSelectTag(null);
                      } else {
                        onSelectTag(tag.id);
                        if (activeCategory === 'trash') onSelectCategory('all');
                      }
                      if (isOpenMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors group ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`w-2 h-2 rounded-full ${colorDef.dot} shrink-0`} />
                      <span className="truncate">{tag.name}</span>
                    </div>
                    <span className="text-[11px] font-mono tabular-nums text-slate-400 group-hover:text-slate-500">
                      {count}
                    </span>
                  </button>
                );
              })}

              {tags.length === 0 && (
                <div className="px-2.5 py-2 text-xs text-slate-400 italic">No tags added yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Theme toggle and Settings */}
        <div className="p-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            <span className="text-xs">{isDarkMode ? 'Light' : 'Dark'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettingsModal}
            className="p-1.5 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            title="Settings & Backup"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
