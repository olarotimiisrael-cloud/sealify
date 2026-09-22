import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Type, Quote, Link, Undo, Redo, Code, Image, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3, Strikethrough, Highlighter, Eraser } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  maxLength = 1_000_000,
  className = '',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const updateCounts = useCallback(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
      setCharCount(text.length);
    }
  }, []);

  const execCommand = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value || null);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    updateCounts();
  }, [onChange, updateCounts]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    updateCounts();
  }, [onChange, updateCounts]);

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:', 'https://');
    if (url) execCommand('createLink', url);
  }, [execCommand]);

  const insertImage = useCallback(() => {
    const url = prompt('Enter image URL:', 'https://');
    if (url) execCommand('insertImage', url);
  }, [execCommand]);

  const clearFormatting = useCallback(() => {
    execCommand('removeFormat');
    execCommand('unlink');
  }, [execCommand]);

  const toolbarButtons = [
    { icon: Bold, command: 'bold', label: 'Bold' },
    { icon: Italic, command: 'italic', label: 'Italic' },
    { icon: Underline, command: 'underline', label: 'Underline' },
    { icon: Strikethrough, command: 'strikeThrough', label: 'Strikethrough' },
    { icon: Highlighter, command: 'highlight', label: 'Highlight' },
    { type: 'separator' },
    { icon: Heading1, command: 'formatBlock', value: 'h1', label: 'Heading 1' },
    { icon: Heading2, command: 'formatBlock', value: 'h2', label: 'Heading 2' },
    { icon: Heading3, command: 'formatBlock', value: 'h3', label: 'Heading 3' },
    { type: 'separator' },
    { icon: List, command: 'insertUnorderedList', label: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', label: 'Numbered List' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', label: 'Quote' },
    { type: 'separator' },
    { icon: AlignLeft, command: 'justifyLeft', label: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', label: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', label: 'Align Right' },
    { type: 'separator' },
    { icon: Link, command: () => insertLink(), label: 'Insert Link' },
    { icon: Image, command: () => insertImage(), label: 'Insert Image' },
    { icon: Code, command: 'formatBlock', value: 'code', label: 'Code Block' },
    { icon: Undo, command: 'undo', label: 'Undo' },
    { icon: Redo, command: 'redo', label: 'Redo' },
    { icon: Eraser, command: clearFormatting, label: 'Clear Formatting' },
  ];

  return (
    <div className={`border border-slate-700 rounded-xl bg-slate-950 overflow-hidden ${className}`}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-800 bg-slate-900">
        {toolbarButtons.map((btn, i) => {
          if (btn.type === 'separator') {
            return <div key={i} className="w-px h-5 bg-slate-700 mx-1" />;
          }
          const Icon = btn.icon as React.ComponentType<{ className?: string }>;
          return (
            <button
              key={i}
              type="button"
              title={btn.label}
              onClick={() => {
                if (typeof btn.command === 'function') {
                  btn.command();
                } else {
                  execCommand(btn.command, btn.value);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="w-full min-h-[200px] p-4 text-slate-200 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500/30 prose prose-invert prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
        style={{ maxLength }}
      />
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 bg-slate-900 text-[10px] text-slate-500">
        <span>{wordCount} words, {charCount} characters</span>
        {maxLength && (
          <span className={charCount > maxLength * 0.9 ? 'text-amber-400' : ''}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #64748b;
          pointer-events: none;
          display: block;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
