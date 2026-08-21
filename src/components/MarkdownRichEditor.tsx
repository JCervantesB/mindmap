"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import {
  Editor,
  rootCtx,
  defaultValueCtx,
  commandsCtx,
  parserCtx,
  editorViewCtx,
  serializerCtx,
  prosePluginsCtx,
  type CmdKey,
} from "@milkdown/kit/core";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import { Fragment, Node } from "@milkdown/kit/prose/model";
import { commonmark, paragraphSchema } from "@milkdown/kit/preset/commonmark";
import { gfm } from "@milkdown/kit/preset/gfm";
import { history } from "@milkdown/plugin-history";
import { upload, uploadConfig } from "@milkdown/plugin-upload";
import { nord } from "@milkdown/theme-nord";
import "@milkdown/theme-nord/style.css";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link,
  Minus,
  Undo2,
  Redo2,
  FileCode2,
  FileText,
  ImagePlus,
} from "lucide-react";

import {
  toggleStrongCommand,
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleLinkCommand,
  wrapInBlockquoteCommand,
  createCodeBlockCommand,
  wrapInHeadingCommand,
  wrapInBulletListCommand,
  wrapInOrderedListCommand,
  insertHrCommand,
  insertImageCommand,
} from "@milkdown/kit/preset/commonmark";
import { toggleStrikethroughCommand } from "@milkdown/kit/preset/gfm";
import { undoCommand, redoCommand } from "@milkdown/plugin-history";

interface MarkdownRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const onChangePluginKey = new PluginKey("mindmap-md-onchange");

/**
 * Paragraph serializer without the empty-line `<br />` emission that the
 * default `remarkPreserveEmptyLinePlugin` adds. Empty paragraphs are kept as
 * blank lines instead of literal HTML, so they never leak into the markdown
 * stored or rendered elsewhere.
 */
const paragraphNoBr = paragraphSchema.extendSchema((schema) => {
  return (ctx) => {
    const paragraph = schema(ctx);
    return {
      ...paragraph,
      toMarkdown: {
        ...paragraph.toMarkdown,
        runner: (state, node) => {
          state.openNode("paragraph");
          if (node.childCount >= 1 && node.lastChild?.type.name === "hardbreak") {
            const content: Node[] = [];
            node.content.forEach((n, _offset, index) => {
              if (index !== node.childCount - 1) content.push(n);
            });
            state.next(Fragment.fromArray(content));
          } else {
            state.next(node.content);
          }
          state.closeNode();
        },
      },
    };
  };
});

export function MarkdownRichEditor(props: MarkdownRichEditorProps) {
  return (
    <MilkdownProvider>
      <MarkdownRichEditorInner {...props} />
    </MilkdownProvider>
  );
}

function MarkdownRichEditorInner({
  value,
  onChange,
  placeholder,
  minHeight = 300,
}: MarkdownRichEditorProps) {
  const [mode, setMode] = useState<"rich" | "markdown">("rich");

  const onChangeRef = useRef(onChange);
  const lastEmittedRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const { get } = useEditor((root) => {
    return Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, lastEmittedRef.current);
      })
      .config(nord)
      .config((ctx) => {
        ctx.update(prosePluginsCtx, (plugins) => [
          ...plugins,
          new Plugin({
            key: onChangePluginKey,
            appendTransaction: (_transactions, _oldState, newState) => {
              try {
                const serializer = ctx.get(serializerCtx);
                const markdown = serializer(newState.doc);
                lastEmittedRef.current = markdown;
                onChangeRef.current(markdown);
              } catch {
                // serializer not ready yet, ignore
              }
              return null;
            },
          }),
        ]);
      })
      .config((ctx) => {
        ctx.update(uploadConfig.key, (options) => ({
          ...options,
          enableHtmlFileUploader: true,
          uploader: async (files, schema) => {
            const nodes: Node[] = [];
            for (let i = 0; i < files.length; i++) {
              const file = files.item(i);
              if (!file || !file.type.startsWith("image/")) continue;
              try {
                const formData = new FormData();
                formData.append("file", file);
                const response = await fetch("/api/uploads", {
                  method: "POST",
                  body: formData,
                });
                if (!response.ok) {
                  throw new Error("Error subiendo imagen");
                }
                const data = await response.json();
                const imageNode = schema.nodes.image?.createAndFill({
                  src: data.url,
                  alt: file.name || "imagen",
                  title: file.name || undefined,
                });
                if (imageNode) nodes.push(imageNode);
              } catch (e) {
                console.error("Error subiendo imagen:", e);
              }
            }
            return nodes;
          },
        }));
      })
      .use([...commonmark, ...paragraphNoBr])
      .use(gfm)
      .use(history)
      .use(upload);
  }, []);

  useEffect(() => {
    const editor = get();
    if (!editor) return;
    // The editor is the source of truth for its own edits. Only sync the
    // document when the value changed from outside (generate, node switch…).
    if (value === lastEmittedRef.current) return;

    editor.action((ctx) => {
      const serializer = ctx.get(serializerCtx);
      const view = ctx.get(editorViewCtx);
      if (!serializer || !view) return true;

      if (serializer(view.state.doc) === value) {
        lastEmittedRef.current = value;
        return true;
      }

      const parser = ctx.get(parserCtx);
      const doc = parser(value);
      if (!doc) return true;

      lastEmittedRef.current = value;
      // Replace the content through a transaction so all plugins (history,
      // onChange…) stay intact. Using `view.updateState` here would drop them
      // and break editing/undo afterwards.
      const tr = view.state.tr;
      tr.replaceWith(0, view.state.doc.content.size, doc.content);
      tr.setMeta("addToHistory", false);
      view.dispatch(tr);
      return true;
    });
  }, [value, get]);

  const exec = useCallback(
    function <T>(command: { key: CmdKey<T> }, payload?: T) {
      const editor = get();
      if (!editor) return;
      editor.action((ctx) => {
        ctx.get(commandsCtx).call(command.key, payload);
        return true;
      });
    },
    [get]
  );

  const handleToggleMode = useCallback(() => {
    setMode((m) => (m === "rich" ? "markdown" : "rich"));
  }, []);

  const handleMarkdownChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const md = e.target.value;
      lastEmittedRef.current = md;
      onChange(md);
    },
    [onChange]
  );

  const uploadRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const uploadImageToCloudinary = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Error subiendo imagen");
    return (await response.json()) as { url: string };
  }, []);

  const handleUploadImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !file.type.startsWith("image/")) return;

      let data: { url: string } | null = null;
      try {
        data = await uploadImageToCloudinary(file);
      } catch (err) {
        console.error("Error subiendo imagen:", err);
        return;
      }
      if (!data) return;

      if (mode === "markdown") {
        const textarea = textareaRef.current;
        const start = textarea?.selectionStart ?? value.length;
        const end = textarea?.selectionEnd ?? value.length;
        const snippet = `![${file.name || "imagen"}](${data.url})`;
        const md = value.slice(0, start) + snippet + value.slice(end);
        lastEmittedRef.current = md;
        onChange(md);
        return;
      }

      const editor = get();
      if (!editor) return;
      editor.action((ctx) => {
        ctx.get(commandsCtx).call(insertImageCommand.key, {
          src: data.url,
          alt: file.name || "imagen",
        });
        const view = ctx.get(editorViewCtx);
        if (view) view.focus();
        return true;
      });
    },
    [get, mode, value, onChange, uploadImageToCloudinary]
  );

  return (
    <div className="markdown-editor rounded-lg border bg-background">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b bg-background px-2 py-1.5 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => exec(undoCommand)}
          title="Deshacer"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => exec(redoCommand)}
          title="Rehacer"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => exec(toggleStrongCommand)}
          title="Negrita"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => exec(toggleEmphasisCommand)}
          title="Cursiva"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => exec(toggleStrikethroughCommand)}
          title="Tachado"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => exec(wrapInHeadingCommand, 1)}
          title="Título 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => exec(wrapInHeadingCommand, 2)}
          title="Título 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => exec(wrapInHeadingCommand, 3)}
          title="Título 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => exec(wrapInBulletListCommand)}
          title="Lista"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => exec(wrapInOrderedListCommand)}
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => exec(wrapInBlockquoteCommand)}
          title="Cita"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => exec(toggleInlineCodeCommand)}
          title="Código en línea"
        >
          <Code2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => exec(createCodeBlockCommand)}
          title="Bloque de código"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => exec(toggleLinkCommand)}
          title="Enlace"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => exec(insertHrCommand)}
          title="Línea separadora"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => uploadRef.current?.click()}
          title="Subir imagen"
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUploadImage}
        />
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          onClick={handleToggleMode}
          title={mode === "rich" ? "Cambiar a modo Markdown" : "Cambiar a modo enriquecido"}
        >
          {mode === "rich" ? (
            <>
              <FileCode2 className="h-4 w-4" />
              Markdown
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Rico
            </>
          )}
        </Button>
      </div>

      <style>{`
        .markdown-editor .milkdown {
          min-height: ${minHeight}px;
          padding: 1rem;
        }
        .markdown-editor .ProseMirror {
          min-height: ${minHeight}px;
          outline: none;
          font-size: 0.95rem;
          line-height: 1.7;
          color: hsl(var(--foreground));
        }
      `}</style>

      {mode === "rich" ? (
        <Milkdown />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleMarkdownChange}
          placeholder={placeholder}
          style={{ minHeight }}
          className="w-full resize-y bg-transparent px-4 py-3 font-mono text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
        />
      )}
    </div>
  );
}
