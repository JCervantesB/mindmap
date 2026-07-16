export const NODE_TYPES = {
  root: {
    label: "Raíz",
    color: {
      light: "var(--node-root)",
      dark: "var(--node-root)",
      foreground: "var(--node-root-foreground)",
    },
    icon: "Sparkles",
    canGenerate: true,
    canExpand: true,
    canHaveChildren: true,
  },
  concept: {
    label: "Concepto",
    color: {
      light: "var(--node-concept)",
      dark: "var(--node-concept)",
      foreground: "var(--node-concept-foreground)",
    },
    icon: "Lightbulb",
    canGenerate: true,
    canExpand: true,
    canHaveChildren: true,
  },
  subtopic: {
    label: "Subtema",
    color: {
      light: "var(--node-subtopic)",
      dark: "var(--node-subtopic)",
      foreground: "var(--node-subtopic-foreground)",
    },
    icon: "Folder",
    canGenerate: true,
    canExpand: true,
    canHaveChildren: true,
  },
  question: {
    label: "Pregunta",
    color: {
      light: "var(--node-question)",
      dark: "var(--node-question)",
      foreground: "var(--node-question-foreground)",
    },
    icon: "HelpCircle",
    canGenerate: false,
    canExpand: false,
    canHaveChildren: false,
  },
  example: {
    label: "Ejemplo",
    color: {
      light: "var(--node-example)",
      dark: "var(--node-example)",
      foreground: "var(--node-example-foreground)",
    },
    icon: "BookOpen",
    canGenerate: true,
    canExpand: false,
    canHaveChildren: false,
  },
  source: {
    label: "Fuente",
    color: {
      light: "var(--node-source)",
      dark: "var(--node-source)",
      foreground: "var(--node-source-foreground)",
    },
    icon: "Link",
    canGenerate: false,
    canExpand: false,
    canHaveChildren: false,
  },
} as const;

export type NodeType = keyof typeof NODE_TYPES;

export const CONTENT_STATES = {
  manual: {
    label: "Manual",
    symbol: "✏️",
    description: "Contenido escrito por el usuario",
  },
  generated: {
    label: "Generado",
    symbol: "🤖",
    description: "Contenido generado por IA sin revisión",
  },
  mixed: {
    label: "Mixto",
    symbol: "✏️🤖",
    description: "Mezcla de contenido manual y generado",
  },
  reviewed: {
    label: "Revisado",
    symbol: "✅",
    description: "Contenido generado aprobado por el usuario",
  },
  approved: {
    label: "Aprobado",
    symbol: "✅⭐",
    description: "Contenido final ratificado",
  },
} as const;

export type ContentState = keyof typeof CONTENT_STATES;

export const DIFFICULTY_LEVELS = {
  1: { label: "Básico", description: "Conceptos fundamentales" },
  2: { label: "Intermedio", description: "Ampliación de conceptos" },
  3: { label: "Avanzado", description: "Profundización técnica" },
} as const;

export type DifficultyLevel = keyof typeof DIFFICULTY_LEVELS;

export const MAP_ROLES = {
  owner: {
    label: "Propietario",
    canManage: true,
    canEdit: true,
    canComment: true,
    canView: true,
  },
  editor: {
    label: "Editor",
    canManage: false,
    canEdit: true,
    canComment: true,
    canView: true,
  },
  commenter: {
    label: "Comentador",
    canManage: false,
    canEdit: false,
    canComment: true,
    canView: true,
  },
  viewer: {
    label: "Visor",
    canManage: false,
    canEdit: false,
    canComment: false,
    canView: true,
  },
} as const;

export type MapRole = keyof typeof MAP_ROLES;
