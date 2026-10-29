import React, { useRef, useState } from 'react';
import { X, Download, Upload, RotateCcw, ShieldCheck, Keyboard, Check, AlertTriangle } from 'lucide-react';
import { Note, Tag } from '../types/note';
import { exportBackupJSON, resetToSampleData } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  tags: Tag[];
  onImportBackup: (importedNotes: Note[], importedTags: Tag[]) => void;
  onResetSamples: (notes: Note[], tags: Tag[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  notes,
  tags,
  onImportBackup,
  onResetSamples,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    exportBackupJSON(notes, tags);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.notes) && Array.isArray(parsed.tags)) {
          onImportBackup(parsed.notes, parsed.tags);
          setImportMessage({ text: `Successfully restored ${parsed.notes.length} notes and ${parsed.tags.length} tags!` });
          setTimeout(() => setImportMessage(null), 4000);
        } else {
          setImportMessage({ text: 'Invalid backup file format. Expected notes and tags arrays.', error: true });
        }
      } catch (err) {
        setImportMessage({ text: 'Failed to read JSON backup file.', error: true });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    const { notes: sampleNotes, tags: sampleTags } = resetToSampleData();
    onResetSamples(sampleNotes, sampleTags);
    setShowResetConfirm(false);
    onClose();
  };

  const totalActive = notes.filter((n) => !n.isTrash).length;
  const totalPinned = notes.filter((n) => !n.isTrash && n.isPinned).length;
  const totalTrash = notes.filter((n) => n.isTrash).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Settings & Data Management</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Storage Summary */}
          <div>
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Workspace Overview
            </span>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="block text-lg font-bold text-slate-900 dark:text-white tabular-nums">{totalActive}</span>
                <span className="text-[11px] text-slate-500">Active Notes</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="block text-lg font-bold text-slate-900 dark:text-white tabular-nums">{totalPinned}</span>
                <span className="text-[11px] text-slate-500">Pinned</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="block text-lg font-bold text-slate-900 dark:text-white tabular-nums">{tags.length}</span>
                <span className="text-[11px] text-slate-500">Tags</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="block text-lg font-bold text-slate-900 dark:text-white tabular-nums">{totalTrash}</span>
                <span className="text-[11px] text-slate-500">In Trash</span>
              </div>
            </div>
          </div>

          {/* Backup & Restore */}
          <div>
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Backup & Local Persistence
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              Your notes are automatically saved to your browser&apos;s local storage. You can also export a complete offline JSON backup or restore from a previously saved file.
            </p>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON Backup
              </button>

              <label className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Restore from JSON
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {importMessage && (
              <div
                className={`mt-2.5 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  importMessage.error
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                {importMessage.error ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
                <span>{importMessage.text}</span>
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Keyboard className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Keyboard Shortcuts
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300">New Note</span>
                <kbd className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                  Ctrl / ⌘ + N
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300">Search Notes</span>
                <kbd className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                  / or ⌘ + K
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300">Toggle Pin</span>
                <kbd className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                  Ctrl / ⌘ + P
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300">Close / Escape</span>
                <kbd className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                  Esc
                </kbd>
              </div>
            </div>
          </div>

          {/* Reset / Reload Sample Notes */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
              Reset Data
            </span>
            <p className="text-xs text-slate-500 mb-3">
              Want to see the original sample notes and guide again? You can reset to initial sample content.
            </p>
            {showResetConfirm ? (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg space-y-2">
                <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                  Are you sure? This will replace current notes with the default sample notes.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors"
                  >
                    Yes, Reset to Sample Notes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-600 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset & Restore Sample Notes
              </button>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
