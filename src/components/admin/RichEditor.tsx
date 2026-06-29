"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExt from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

// Defined outside to keep stable references — prevents Tiptap duplicate-extension warning in Strict Mode
const EXTENSIONS = [
  StarterKit,
  Underline,
  LinkExt.configure({ openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" } }),
];

const SEP = () => <div style={{ width: 1, height: 22, background: "#e0eaed", margin: "0 2px", flexShrink: 0 }} />;

function TBtn({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button type="button" title={title} onClick={onClick}
      style={{ minWidth: 30, height: 30, display: "grid", placeItems: "center", border: "none", borderRadius: 6, background: active ? "#0c8aa6" : "transparent", color: active ? "#fff" : "#2a4f5b", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "0 4px", flexShrink: 0 }}>
      {children}
    </button>
  );
}

export default function RichEditor({ value, onChange, placeholder = "محتوا را وارد کنید...", minHeight = 220 }: Props) {
  const initial = useRef(value);
  const [htmlMode, setHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(value);

  const editor = useEditor({
    extensions: [
      ...EXTENSIONS,
      Placeholder.configure({ placeholder }),
    ],
    content: initial.current,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setRawHtml(html);
      onChange(html);
    },
    editorProps: {
      attributes: { dir: "rtl", class: "rich-ed" },
    },
    immediatelyRender: false,
  });

  const addLink = () => {
    if (!editor) return;
    const prev = (editor.getAttributes("link").href as string) || "";
    const url = window.prompt("آدرس لینک:", prev);
    if (url === null) return;
    if (!url) { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const toHtml = () => { if (editor) { setRawHtml(editor.getHTML()); setHtmlMode(true); } };
  const toVisual = () => { if (editor) { editor.commands.setContent(rawHtml, { emitUpdate: false }); onChange(rawHtml); setHtmlMode(false); } };

  if (!editor) return null;

  const tb = (active: boolean) => ({
    minWidth: 30, height: 30, display: "grid" as const, placeItems: "center" as const, border: "none",
    borderRadius: 6, background: active ? "#0c8aa6" : "transparent",
    color: active ? "#fff" : "#2a4f5b", fontFamily: "inherit",
    fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "0 4px", flexShrink: 0,
  } as React.CSSProperties);

  return (
    <>
      <style>{`
        .rich-ed{outline:none;min-height:${minHeight}px;font-family:Vazirmatn,system-ui,sans-serif;font-size:15px;line-height:2;color:#1a3540;word-break:break-word}
        .rich-ed p{margin:0 0 10px}
        .rich-ed h2{font-size:21px;font-weight:800;margin:18px 0 8px;color:#133b48}
        .rich-ed h3{font-size:17px;font-weight:700;margin:14px 0 6px;color:#133b48}
        .rich-ed h4{font-size:15px;font-weight:700;margin:12px 0 4px;color:#133b48}
        .rich-ed ul,.rich-ed ol{padding-right:24px;margin:0 0 10px}
        .rich-ed li{margin-bottom:3px}
        .rich-ed blockquote{border-right:4px solid #0c8aa6;padding:8px 14px;margin:14px 0;background:#f0f9fb;border-radius:0 8px 8px 0;color:#2a5f6e}
        .rich-ed code{background:#eef4f6;padding:2px 5px;border-radius:4px;font-family:monospace;font-size:13px;direction:ltr;display:inline-block}
        .rich-ed pre{background:#1a3540;color:#e0eef1;padding:14px;border-radius:10px;overflow-x:auto;direction:ltr;margin:12px 0}
        .rich-ed pre code{background:none;color:inherit;padding:0}
        .rich-ed a{color:#0c8aa6;text-decoration:underline}
        .rich-ed hr{border:none;border-top:2px solid #e7f0f3;margin:18px 0}
        .rich-ed strong{font-weight:800}
        .rich-ed p.is-editor-empty:first-child::before{content:attr(data-placeholder);color:#aac5cc;float:right;pointer-events:none;height:0}
      `}</style>
      <div style={{ border: "1px solid #dceaef", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2, padding: "7px 10px", borderBottom: "1px solid #eef4f6", background: "#f7fbfc" }}>
          {/* Headings */}
          <TBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="عنوان H2">H2</TBtn>
          <TBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="عنوان H3">H3</TBtn>
          <TBtn active={editor.isActive("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} title="عنوان H4">H4</TBtn>
          <SEP />
          {/* Inline */}
          <button type="button" title="ضخیم" onClick={() => editor.chain().focus().toggleBold().run()} style={{ ...tb(editor.isActive("bold")), fontWeight: 900 }}>B</button>
          <button type="button" title="مورب" onClick={() => editor.chain().focus().toggleItalic().run()} style={{ ...tb(editor.isActive("italic")), fontStyle: "italic" }}>I</button>
          <button type="button" title="زیرخط" onClick={() => editor.chain().focus().toggleUnderline().run()} style={{ ...tb(editor.isActive("underline")), textDecoration: "underline" }}>U</button>
          <button type="button" title="خط‌خورده" onClick={() => editor.chain().focus().toggleStrike().run()} style={{ ...tb(editor.isActive("strike")), textDecoration: "line-through" }}>S</button>
          <SEP />
          {/* Lists */}
          <TBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="لیست نقطه‌ای">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
          </TBtn>
          <TBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="لیست شماره‌دار">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/><text x="1" y="8.5" fontSize="6.5" fill="currentColor" stroke="none" fontWeight="bold">1.</text><text x="1" y="14.5" fontSize="6.5" fill="currentColor" stroke="none" fontWeight="bold">2.</text><text x="1" y="20.5" fontSize="6.5" fill="currentColor" stroke="none" fontWeight="bold">3.</text></svg>
          </TBtn>
          <TBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="نقل‌قول">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
          </TBtn>
          <SEP />
          {/* Code & Link */}
          <TBtn active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} title="کد inline">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </TBtn>
          <TBtn active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="بلوک کد">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="3"/><polyline points="9 9 6 12 9 15"/><polyline points="15 9 18 12 15 15"/></svg>
          </TBtn>
          <TBtn active={editor.isActive("link")} onClick={addLink} title="لینک">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
          </TBtn>
          <TBtn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="خط جداکننده">—</TBtn>
          <SEP />
          {/* Undo / Redo */}
          <TBtn active={false} onClick={() => editor.chain().focus().undo().run()} title="واگرد">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg>
          </TBtn>
          <TBtn active={false} onClick={() => editor.chain().focus().redo().run()} title="انجام دوباره">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 014-4h12"/></svg>
          </TBtn>
          {/* HTML toggle — push to end */}
          <div style={{ flex: 1 }} />
          <button type="button" onClick={htmlMode ? toVisual : toHtml}
            style={{ padding: "4px 11px", borderRadius: 7, border: `1px solid ${htmlMode ? "#0c8aa6" : "#c8dde3"}`, fontSize: 12, fontWeight: 700, fontFamily: "monospace", cursor: "pointer", background: htmlMode ? "#0c8aa6" : "#fff", color: htmlMode ? "#fff" : "#0c8aa6", flexShrink: 0 }}>
            {htmlMode ? "ویژوال" : "</>"}
          </button>
        </div>

        {/* Content area */}
        {htmlMode ? (
          <textarea value={rawHtml} onChange={e => { setRawHtml(e.target.value); onChange(e.target.value); }}
            style={{ width: "100%", minHeight: minHeight, padding: "14px 16px", border: "none", fontFamily: "monospace", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", direction: "ltr", lineHeight: 1.7, color: "#1a3540", display: "block" }} />
        ) : (
          <div style={{ padding: "12px 16px" }}>
            <EditorContent editor={editor} />
          </div>
        )}
      </div>
    </>
  );
}
