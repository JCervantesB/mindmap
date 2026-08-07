"use client";

import { useCallback, useEffect, useRef } from "react";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import {
  Editor,
  rootCtx,
  defaultValueCtx,
  commandsCtx,
  parserCtx,
  schemaCtx,
  editorStateCtx,
  editorViewCtx,
  serializerCtx,
} from "@milkdown/kit/core";
import { EditorState } from "@milkdown/kit/prose/state";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { gfm } from "@milkdown/kit/preset/gfm";
import { history } from "@milkdown/plugin-history";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
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
} from "@milkdown/kit/preset/commonmark";
import { toggleStrikethroughCommand } from "@milkdown/kit/preset/gfm";
import { undoCommand, redoCommand } from "@milkdown/plugin-history";

interface MarkdownRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

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
  minHeight = 300,
}: MarkdownRichEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = useRef(value);
  valueRef.current = value;

  const { get } = useEditor((root) => {
    return Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, valueRef.current);
      })
      .config(nord)
      .config((ctx) => {
        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
          onChangeRef.current(markdown);
        });
      })
      .use(commonmark)
      .use(gfm)
      .use(history)
      .use(listener);
  }, []);

  useEffect(() => {
    const editor = get();
    if (!editor) return;

    let needsSync = false;
    editor.action((ctx) => {
      const serializer = ctx.get(serializerCtx);
      const view = ctx.get(editorViewCtx);
      if (!serializer || !view) return;
      const currentMarkdown = serializer(view.state.doc);
      needsSync = currentMarkdown !== value;
      return true;
    });

    if (!needsSync) return;

    editor.action((ctx) => {
      const parser = ctx.get(parserCtx);
      const schema = ctx.get(schemaCtx);
      const editorState = ctx.get(editorStateCtx);
      const view = ctx.get(editorViewCtx);
      const doc = parser(value);
      if (schema && doc && editorState && view) {
        const newState = EditorState.create({ doc, schema });
        view.updateState(newState);
      }
      return true;
    });
  }, [value, get]);

  const exec = useCallback((command: any, payload?: any) => {
    const editor = get();
    if (!editor) return;
    editor.action((ctx) => {
      ctx.get(commandsCtx).call(command.key, payload);
      return true;
    });
  }, [get]);

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
      <Milkdown />
    </div>
  );
}
