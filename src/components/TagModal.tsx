import React, { useState } from 'react';
import { X, Plus, Trash2, Tag as TagIcon, Check } from 'lucide-react';
import { Tag, TAG_COLOR_MAP } from '../types/note';

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
  onAddTag: (name: string, color: Tag['color']) => void;
  onUpdateTag: (id: string, name: string, color: Tag['color']) => void;
  onDeleteTag: (id: string) => void;
  notesTagCount: Record<string, number>;
}

const AVAILABLE_COLORS: Tag['color'][] = [
  'indigo',
  'emerald',
  'sky',
  'amber',
  'rose',
  'violet',
  'teal',
  'slate',
];

export const TagModal: React.FC<TagModalProps> = ({
  isOpen,
  onClose,
  tags,
  onAddTag,
  onUpdateTag,
  onDeleteTag,
  notesTagCount,
}) => {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<Tag['color']>('indigo');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState<Tag['color']>('indigo');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    onAddTag(newTagName.trim(), newTagColor);
    setNewTagName('');
  };

  const handleStartEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    onUpdateTag(id, editName.trim(), editColor);
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Manage Tags</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Create new tag form */}
        <form onSubmit={handleCreate} className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
            Create New Tag
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag name (e.g. Finance, Sprint)..."
              maxLength={24}
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-sky-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!newTagName.trim()}
              className="px-3.5 py-2 text-sm font-medium bg-slate-900 text-white dark:bg-sky-500 dark:hover:bg-sky-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Color picker selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Color:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {AVAILABLE_COLORS.map((c) => {
                const colorDef = TAG_COLOR_MAP[c];
                const isSelected = newTagColor === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewTagColor(c)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${colorDef.bg} ${colorDef.border} border ${
                      isSelected ? 'ring-2 ring-slate-900 dark:ring-white scale-110' : 'hover:scale-105'
                    }`}
                    title={c}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${colorDef.dot}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* Existing tags list */}
        <div className="p-5 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
            Existing Tags ({tags.length})
          </span>
          {tags.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-3 text-center">No tags yet. Add one above.</p>
          ) : (
            tags.map((tag) => {
              const isEditing = editingId === tag.id;
              const count = notesTagCount[tag.id] || 0;
              const colorDef = TAG_COLOR_MAP[tag.color];

              if (isEditing) {
                return (
                  <div key={tag.id} className="py-2.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(tag.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {AVAILABLE_COLORS.map((c) => {
                        const cDef = TAG_COLOR_MAP[c];
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setEditColor(c)}
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${cDef.bg} border ${cDef.border} ${
                              editColor === c ? 'ring-2 ring-slate-900 dark:ring-white scale-110' : ''
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${cDef.dot}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={tag.id}
                  className="py-2.5 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 px-2 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${colorDef.dot} shrink-0`} />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{tag.name}</span>
                    <span className="text-xs text-slate-400 tabular-nums font-mono">({count} notes)</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(tag)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTag(tag.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete tag"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
