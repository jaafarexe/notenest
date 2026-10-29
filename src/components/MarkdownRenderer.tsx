import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onToggleTask?: (taskText: string, newCompleted: boolean) => void;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onToggleTask,
  className = '',
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!content.trim()) {
    return (
      <div className={`text-slate-400 dark:text-slate-500 italic py-8 text-sm ${className}`}>
        No content written yet. Start typing to see your note rendered here...
      </div>
    );
  }

  // Parse lines into blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = '';
  let inTable = false;
  let tableRows: string[] = [];

  const flushTable = (keyPrefix: string) => {
    if (tableRows.length === 0) return;
    const headerRow = tableRows[0];
    const dataRows = tableRows.slice(2); // Skip separator row if present
    const headers = headerRow
      .split('|')
      .map((s) => s.trim())
      .filter((s, idx, arr) => (idx > 0 && idx < arr.length - 1) || s.length > 0);

    elements.push(
      <div key={`table-${keyPrefix}`} className="overflow-x-auto my-4 rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
              {headers.map((h, i) => (
                <th key={i} className="px-3.5 py-2 font-semibold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                  {renderInlineFormatting(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {dataRows.map((row, rIdx) => {
              const cells = row
                .split('|')
                .map((s) => s.trim())
                .filter((s, idx, arr) => (idx > 0 && idx < arr.length - 1) || s.length > 0);
              return (
                <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  {cells.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2 text-slate-700 dark:text-slate-300 tabular-nums">
                      {renderInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code block start/end
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const codeText = codeBlockLines.join('\n');
        const blockIdx = i;
        elements.push(
          <div key={`code-${blockIdx}`} className="relative my-4 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-sm text-slate-100">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800/80 border-b border-slate-700/60 text-xs font-mono text-slate-400">
              <span>{codeBlockLang || 'code'}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(codeText, blockIdx)}
                className="flex items-center gap-1 text-[11px] hover:text-slate-200 transition-colors cursor-pointer"
                title="Copy code"
              >
                {copiedIndex === blockIdx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        codeBlockLines = [];
        inCodeBlock = false;
        codeBlockLang = '';
        continue;
      } else {
        if (inTable) flushTable(`before-code-${i}`);
        inCodeBlock = true;
        codeBlockLang = line.trim().slice(3).trim();
        continue;
      }
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Handle Markdown tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      tableRows.push(line.trim());
      continue;
    } else if (inTable) {
      flushTable(`table-end-${i}`);
    }

    // Horizontal Rule
    if (/^(---|___|\*\*\*)$/.test(line.trim())) {
      elements.push(
        <hr key={`hr-${i}`} className="my-5 border-t border-slate-200 dark:border-slate-800" />
      );
      continue;
    }

    // Task Checklist: - [ ] or - [x]
    const taskMatch = line.match(/^(\s*)[-*]\s*\[([ xX])\]\s*(.*)$/);
    if (taskMatch) {
      const isCompleted = taskMatch[2].toLowerCase() === 'x';
      const text = taskMatch[3];
      elements.push(
        <div
          key={`task-${i}`}
          className="flex items-start gap-2.5 my-1.5 group py-0.5 rounded transition-colors"
        >
          <button
            type="button"
            onClick={() => onToggleTask && onToggleTask(text, !isCompleted)}
            className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
              isCompleted
                ? 'bg-slate-900 border-slate-900 text-white dark:bg-sky-500 dark:border-sky-500'
                : 'border-slate-300 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-400 bg-white dark:bg-slate-800'
            }`}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted && <Check className="w-3 h-3 stroke-[2.5]" />}
          </button>
          <span
            className={`text-sm leading-relaxed transition-all select-text ${
              isCompleted
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-800 dark:text-slate-200'
            }`}
          >
            {renderInlineFormatting(text)}
          </span>
        </div>
      );
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-2xl font-bold text-slate-900 dark:text-white mt-5 mb-2.5 tracking-tight">
          {renderInlineFormatting(line.slice(2))}
        </h1>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4 mb-2 tracking-tight">
          {renderInlineFormatting(line.slice(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-semibold text-slate-900 dark:text-slate-200 mt-3.5 mb-1.5">
          {renderInlineFormatting(line.slice(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm font-semibold text-slate-800 dark:text-slate-300 mt-3 mb-1">
          {renderInlineFormatting(line.slice(5))}
        </h4>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <div
          key={`quote-${i}`}
          className="my-3 pl-3.5 py-1 text-slate-600 dark:text-slate-400 italic text-sm border-l-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 rounded-r-md"
        >
          {renderInlineFormatting(line.slice(2))}
        </div>
      );
      continue;
    }

    // Unordered List
    if (/^\s*[-*]\s+(.*)$/.test(line)) {
      const listText = line.replace(/^\s*[-*]\s+/, '');
      elements.push(
        <div key={`li-${i}`} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 my-1 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 mt-2 shrink-0" />
          <span className="leading-relaxed">{renderInlineFormatting(listText)}</span>
        </div>
      );
      continue;
    }

    // Ordered List
    const numMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={`oli-${i}`} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 my-1 pl-1">
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums w-4 shrink-0">
            {numMatch[1]}.
          </span>
          <span className="leading-relaxed">{renderInlineFormatting(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={`empty-${i}`} className="h-3" />);
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${i}`} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-1">
        {renderInlineFormatting(line)}
      </p>
    );
  }

  if (inTable) {
    flushTable('end-of-doc');
  }

  return <div className={`markdown-body space-y-1 ${className}`}>{elements}</div>;
};

// Helper for inline markdown: bold, italic, inline code, links
function renderInlineFormatting(text: string): React.ReactNode {
  // Regex tokenization for code, bold, italic, links
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Inline code: `code`
    const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)$/s);
    if (codeMatch) {
      const before = codeMatch[1];
      const code = codeMatch[2];
      remaining = codeMatch[3];
      if (before) parts.push(renderFormattingTokens(before, keyIndex++));
      parts.push(
        <code
          key={`code-${keyIndex++}`}
          className="px-1.5 py-0.5 rounded text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
        >
          {code}
        </code>
      );
      continue;
    }

    // Links: [label](url)
    const linkMatch = remaining.match(/^(.*?)\[([^\]]+)\]\(([^)]+)\)(.*)$/s);
    if (linkMatch) {
      const before = linkMatch[1];
      const label = linkMatch[2];
      const url = linkMatch[3];
      remaining = linkMatch[4];
      if (before) parts.push(renderFormattingTokens(before, keyIndex++));
      parts.push(
        <a
          key={`link-${keyIndex++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 dark:text-sky-400 underline underline-offset-2 hover:text-sky-800 transition-colors"
        >
          {label}
        </a>
      );
      continue;
    }

    // If no code or link, format the rest with bold/italic
    parts.push(renderFormattingTokens(remaining, keyIndex++));
    break;
  }

  return <>{parts}</>;
}

function renderFormattingTokens(text: string, baseKey: number): React.ReactNode {
  // Bold: **text**
  // Italic: *text* or _text_
  // Strikethrough: ~~text~~
  const boldRegex = /(\*\*([^*]+)\*\*|~~([^~]+)~~|\*([^*]+)\*)/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // Bold
      elements.push(
        <strong key={`b-${baseKey}-${match.index}`} className="font-semibold text-slate-900 dark:text-white">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Strikethrough
      elements.push(
        <span key={`s-${baseKey}-${match.index}`} className="line-through text-slate-400 dark:text-slate-500">
          {match[3]}
        </span>
      );
    } else if (match[4]) {
      // Italic
      elements.push(
        <em key={`i-${baseKey}-${match.index}`} className="italic">
          {match[4]}
        </em>
      );
    }
    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return <React.Fragment key={`fmt-${baseKey}`}>{elements}</React.Fragment>;
}
