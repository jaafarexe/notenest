import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowLeft,
  Pin,
  Star,
  Trash2,
  Copy,
  Download,
  Palette,
  Check,
  Tag as TagIcon,
  MoreVertical,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Clock,
  Eye,
  Columns,
  Edit3,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Note, Tag, NoteColor, NOTE_COLOR_STYLES, TAG_COLOR_MAP } from '../types/note';
import { MarkdownRenderer } from './MarkdownRenderer';
import { getNoteStats, formatFullDateTime } from '../utils/date';
import { downloadNoteMarkdown } from '../utils/storage';

interface NoteEditorProps {
  note: Note | null;
  onUpdateNote: (updatedNote: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
  onBackMobile: () => void;
  tags: Tag[];
  onOpenTagModal: () => void;
}

type EditorMode = 'edit' | 'split' | 'preview';

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onUpdateNote,
  onDeleteNote,
  onDuplicateNote,
  onBackMobile,
  tags,
  onOpenTagModal,
}) => {
  const [mode, setMode] = useState<EditorMode>('edit');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus title on newly created note
  useEffect(() => {
    if (note && note.title === 'Untitled Note' && note.content === '') {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [note?.id]);

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-900/40 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-center text-slate-400 mb-4">
          <Edit3 className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
          No Note Selected
        </h2>
        <p className="text-xs text-slate-500 max-w-xs">
          Select a note from the list on the left to read and edit, or click New Note to create one.
        </p>
      </div>
    );
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaveStatus('saving');
    onUpdateNote({ title: e.target.value, updatedAt: Date.now() });
    setTimeout(() => setSaveStatus('saved'), 300);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSaveStatus('saving');
    onUpdateNote({ content: e.target.value, updatedAt: Date.now() });
    setTimeout(() => setSaveStatus('saved'), 300);
  };

  // Insert markdown helper into textarea at current cursor position
  const insertFormatting = (prefix: string, suffix: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const selectedText = current.substring(start, end) || placeholder;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const nextContent = current.substring(0, start) + replacement + current.substring(end);

    onUpdateNote({ content: nextContent, updatedAt: Date.now() });

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  // Interactive task checkbox toggle handler
  const handleToggleTask = (taskText: string, newCompleted: boolean) => {
    const lines = note.content.split('\n');
    const updatedLines = lines.map((line) => {
      // Find line with this task text
      if (line.includes(taskText)) {
        if (newCompleted) {
          return line.replace(/\[\s*\]/, '[x]').replace(/\[\s*X\s*\]/, '[x]');
        } else {
          return line.replace(/\[[xX]\]/, '[ ]');
        }
      }
      return line;
    });

    onUpdateNote({ content: updatedLines.join('\n'), updatedAt: Date.now() });
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(`# ${note.title}\n\n${note.content}`);
    setCopiedStatus(true);
    setShowMoreMenu(false);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  const toggleTag = (tagId: string) => {
    const exists = note.tags.includes(tagId);
    const newTags = exists ? note.tags.filter((t) => t !== tagId) : [...note.tags, tagId];
    onUpdateNote({ tags: newTags, updatedAt: Date.now() });
  };

  const stats = getNoteStats(note.content, note.title);
  const colorStyle = NOTE_COLOR_STYLES[note.colorTheme] || NOTE_COLOR_STYLES.default;
  const noteTags = tags.filter((t) => note.tags.includes(t.id));

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-hidden transition-colors ${colorStyle.bgLight} ${colorStyle.bgDark}`}
    >
      {/* Top Action Bar */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 gap-2 shrink-0">
        {/* Left: Mobile Back Button + Save Status */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackMobile}
            className="md:hidden p-1.5 -ml-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-md"
            aria-label="Back to notes list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span className="hidden sm:inline">
              {saveStatus === 'saving' ? 'Saving...' : 'Saved to browser'}
            </span>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Mode switch: Edit / Split / Preview */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 mr-1">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 transition-colors ${
                mode === 'edit'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Edit mode"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('split')}
              className={`hidden md:flex px-2 py-1 text-xs font-medium rounded items-center gap-1 transition-colors ${
                mode === 'split'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Side-by-side split view"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 transition-colors ${
                mode === 'preview'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Formatted Preview mode"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Preview</span>
            </button>
          </div>

          {/* Color theme popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowTagPicker(false);
                setShowMoreMenu(false);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Change note color theme"
            >
              <Palette className="w-4 h-4" />
            </button>

            {showColorPicker && (
              <div className="absolute right-0 top-full mt-1.5 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-30 w-44 animate-in fade-in duration-100">
                <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
                  Card Tone
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(Object.keys(NOTE_COLOR_STYLES) as NoteColor[]).map((c) => {
                    const style = NOTE_COLOR_STYLES[c];
                    const isSelected = note.colorTheme === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          onUpdateNote({ colorTheme: c, updatedAt: Date.now() });
                          setShowColorPicker(false);
                        }}
                        className={`h-7 rounded-lg border flex items-center justify-center transition-all ${
                          style.bgLight
                        } ${style.borderLight} ${
                          isSelected ? 'ring-2 ring-slate-900 dark:ring-sky-500 scale-105' : 'hover:scale-105'
                        }`}
                        title={style.name}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-slate-800" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Tags popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowTagPicker(!showTagPicker);
                setShowColorPicker(false);
                setShowMoreMenu(false);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Add or remove tags"
            >
              <TagIcon className="w-4 h-4" />
            </button>

            {showTagPicker && (
              <div className="absolute right-0 top-full mt-1.5 p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-30 w-56 animate-in fade-in duration-100">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Note Tags
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTagPicker(false);
                      onOpenTagModal();
                    }}
                    className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    + Manage
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {tags.map((tag) => {
                    const cDef = TAG_COLOR_MAP[tag.color];
                    const isChecked = note.tags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors ${
                          isChecked
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-medium'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${cDef.dot}`} />
                          <span>{tag.name}</span>
                        </div>
                        {isChecked && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-sky-400" />}
                      </button>
                    );
                  })}
                  {tags.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-1 px-1">No tags available.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pin Toggle */}
          <button
            type="button"
            onClick={() => onUpdateNote({ isPinned: !note.isPinned, updatedAt: Date.now() })}
            className={`p-1.5 rounded-lg transition-colors ${
              note.isPinned
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={note.isPinned ? 'Unpin note' : 'Pin to top'}
          >
            <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current' : ''}`} />
          </button>

          {/* Favorite Toggle */}
          <button
            type="button"
            onClick={() => onUpdateNote({ isFavorite: !note.isFavorite, updatedAt: Date.now() })}
            className={`p-1.5 rounded-lg transition-colors ${
              note.isFavorite
                ? 'text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* More Actions Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowMoreMenu(!showMoreMenu);
                setShowColorPicker(false);
                setShowTagPicker(false);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1.5 py-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-30 w-48 animate-in fade-in duration-100">
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className="w-full px-3 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>{copiedStatus ? 'Copied!' : 'Copy Markdown'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    downloadNoteMarkdown(note);
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download .md</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDuplicateNote(note);
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                  <span>Duplicate Note</span>
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                <button
                  type="button"
                  onClick={() => {
                    onDeleteNote(note.id);
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 text-xs text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Move to Trash</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tags Chips Bar under Header (if note has tags) */}
      {noteTags.length > 0 && (
        <div className="px-6 pt-3 pb-1 flex items-center gap-1.5 flex-wrap shrink-0">
          {noteTags.map((t) => {
            const cDef = TAG_COLOR_MAP[t.color];
            return (
              <span
                key={t.id}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md ${cDef.bg} ${cDef.text} ${cDef.border} border`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cDef.dot}`} />
                <span>{t.name}</span>
                <button
                  type="button"
                  onClick={() => toggleTag(t.id)}
                  className="hover:opacity-75 cursor-pointer ml-0.5"
                  title="Remove tag"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Note Title Input */}
      <div className="px-6 pt-4 pb-2 shrink-0">
        <input
          ref={titleInputRef}
          type="text"
          value={note.title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="w-full text-2xl lg:text-3xl font-bold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none tracking-tight"
        />
      </div>

      {/* Formatting Toolbar (shown in Edit and Split modes) */}
      {(mode === 'edit' || mode === 'split') && (
        <div className="px-6 py-1.5 border-y border-slate-200/60 dark:border-slate-800/80 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={() => insertFormatting('**', '**', 'bold text')}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Bold (**text**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*', 'italic text')}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Italic (*text*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('~~', '~~', 'strikethrough')}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Strikethrough (~~text~~)"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={() => insertFormatting('# ', '', 'Heading 1')}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Heading 1 (# Heading)"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('## ', '', 'Heading 2')}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Heading 2 (## Heading)"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={() => insertFormatting('- [ ] ', '', 'Task item')}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Checklist item (- [ ] task)"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('- ', '', 'List item')}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Bullet list (- item)"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('1. ', '', 'Step item')}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Numbered list (1. item)"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={() => insertFormatting('> ', '', 'Quote text')}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Blockquote (> quote)"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('```\n', '\n```', 'code block')}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Code block"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('\n---\n')}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Horizontal divider"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting(`_${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}_ `)}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Insert current date"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editor Main Content Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Textarea for Edit mode & Split mode */}
        {(mode === 'edit' || mode === 'split') && (
          <div className={`h-full overflow-y-auto p-6 ${mode === 'split' ? 'w-1/2 border-r border-slate-200/80 dark:border-slate-800' : 'w-full'}`}>
            <textarea
              ref={textareaRef}
              value={note.content}
              onChange={handleContentChange}
              placeholder="Write your note in markdown... Headings (#), tasks (- [ ]), lists (-), quotes (>), or plain thoughts."
              className="w-full h-full min-h-[350px] bg-transparent text-sm leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none resize-none font-sans"
              spellCheck
            />
          </div>
        )}

        {/* Formatted Markdown Preview for Preview mode & Split mode */}
        {(mode === 'preview' || mode === 'split') && (
          <div className={`h-full overflow-y-auto p-6 ${mode === 'split' ? 'w-1/2' : 'w-full max-w-3xl mx-auto'}`}>
            <MarkdownRenderer
              content={note.content}
              onToggleTask={handleToggleTask}
            />
          </div>
        )}
      </div>

      {/* Bottom Metadata Bar */}
      <footer className="h-10 px-6 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono tabular-nums shrink-0 bg-slate-50/30 dark:bg-slate-900/20">
        <div className="flex items-center gap-3">
          <span>{stats.words} {stats.words === 1 ? 'word' : 'words'}</span>
          <span>·</span>
          <span>{stats.characters} chars</span>
          <span>·</span>
          <span>~{stats.readingTimeMin} min read</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Edited {formatFullDateTime(note.updatedAt)}</span>
        </div>
      </footer>
    </div>
  );
};
