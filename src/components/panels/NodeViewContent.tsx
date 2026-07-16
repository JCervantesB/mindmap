"use client";

import { Badge } from "@/components/ui/badge";
import type { CanvasNode } from "@/store/canvas";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const nodeTypes = [
  { value: "root", label: "Raíz" },
  { value: "concept", label: "Concepto" },
  { value: "subtopic", label: "Subtema" },
  { value: "question", label: "Pregunta" },
  { value: "example", label: "Ejemplo" },
  { value: "source", label: "Fuente" },
];

const editorialStatuses = [
  { value: "draft", label: "Borrador" },
  { value: "review", label: "En revisión" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Archivado" },
];

interface NodeViewContentProps {
  node: CanvasNode;
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mt-6 mb-3 border-b pb-2 text-xl font-bold text-foreground first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-5 mb-3 border-b pb-1 text-lg font-semibold text-foreground first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-2 text-base font-semibold text-foreground first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-3 mb-2 text-sm font-semibold text-foreground first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="mb-4 leading-7 text-foreground last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-1 pl-5 text-foreground">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-1 pl-5 text-foreground">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-7 marker:text-muted-foreground">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-border pl-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-6 border-border" />,
  table: ({ children }) => (
    <div className="my-4 w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
  th: ({ children }) => (
    <th className="px-3 py-2 text-left font-semibold text-foreground">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 align-top text-foreground">{children}</td>
  ),
  code(props) {
    const { inline, className, children, ...rest } = props as {
      inline?: boolean;
      className?: string;
      children?: React.ReactNode;
    };

    if (inline) {
      return (
        <code
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
          {...rest}
        >
          {children}
        </code>
      );
    }

    return (
      <code
        className="block overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm text-foreground"
        {...rest}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className="my-4 overflow-x-auto">{children}</pre>,
};

export function NodeViewContent({ node }: NodeViewContentProps) {
  const nodeTypeLabel =
    nodeTypes.find((t) => t.value === node.data.nodeType)?.label || node.data.nodeType;

  const statusLabel =
    editorialStatuses.find((s) => s.value === node.data.editorialStatus)?.label ||
    node.data.editorialStatus;

  const hasContent = !!(node.data.shortSummary || node.data.contentMarkdown);

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">{node.data.title}</h2>
        <div className="mt-2 flex gap-2">
          <Badge variant="secondary">{nodeTypeLabel}</Badge>
          <Badge variant="outline">{statusLabel}</Badge>
        </div>
      </div>

      {node.data.shortSummary && (
        <div className="pt-2">
          <h4 className="text-sm font-medium text-muted-foreground">Resumen</h4>
          <p className="mt-1 text-sm">{node.data.shortSummary}</p>
        </div>
      )}

      {node.data.contentMarkdown && (
        <div className="pt-2">
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">Contenido</h4>

          <div
            className="
              prose prose-sm dark:prose-invert max-w-none
              prose-headings:text-foreground
              prose-p:text-foreground
              prose-strong:text-foreground
              prose-em:text-foreground
              prose-li:text-foreground
              prose-blockquote:text-muted-foreground
              prose-code:text-foreground
              prose-pre:bg-transparent
            "
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {node.data.contentMarkdown}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {!hasContent && (
        <div className="py-4 text-center text-sm italic text-muted-foreground">
          Este nodo aún no tiene contenido. Usa &quot;Generar con IA&quot; para crear
          contenido automáticamente.
        </div>
      )}

      <div className="space-y-2 border-t pt-4">
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>
            <span className="font-medium">ID:</span> {node.id.slice(0, 8)}...
          </p>
          <p>
            <span className="font-medium">Versión:</span> {node.data.version}
          </p>
          <p>
            <span className="font-medium">Generado:</span>{" "}
            {node.data.generationMode === "generated" ? "IA" : "Manual"}
          </p>
          {node.data.parentNodeId && (
            <p>
              <span className="font-medium">Nodo padre:</span>{" "}
              {node.data.parentNodeId.slice(0, 8)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}