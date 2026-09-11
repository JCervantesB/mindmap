export interface TemplateNode {
  title: string;
  nodeType: "root" | "concept" | "subtopic" | "question" | "example" | "source";
  hierarchyPath: string;
  depth: number;
}

export interface MapTemplate {
  id: string;
  name: string;
  description: string;
  rootTopic: string;
  nodes: TemplateNode[];
}

export const MAP_TEMPLATES: MapTemplate[] = [
  {
    id: "study-topic",
    name: "Estudio de un tema",
    description: "Estructura clásica para aprender cualquier tema: fundamentos, conceptos, ejemplos y repaso.",
    rootTopic: "Tema de estudio",
    nodes: [
      { title: "Fundamentos", nodeType: "concept", hierarchyPath: "1", depth: 1 },
      { title: "Conceptos clave", nodeType: "concept", hierarchyPath: "2", depth: 1 },
      { title: "Ejemplos prácticos", nodeType: "example", hierarchyPath: "3", depth: 1 },
      { title: "Errores comunes", nodeType: "question", hierarchyPath: "4", depth: 1 },
      { title: "Preguntas de repaso", nodeType: "question", hierarchyPath: "5", depth: 1 },
      { title: "Recursos y fuentes", nodeType: "source", hierarchyPath: "6", depth: 1 },
    ],
  },
  {
    id: "programming-language",
    name: "Aprender un lenguaje de programación",
    description: "Mapa para dominar un lenguaje: sintaxis, estructuras, funciones y un proyecto práctico.",
    rootTopic: "Lenguaje de programación",
    nodes: [
      { title: "Sintaxis básica", nodeType: "concept", hierarchyPath: "1", depth: 1 },
      { title: "Tipos y estructuras de datos", nodeType: "concept", hierarchyPath: "2", depth: 1 },
      { title: "Control de flujo", nodeType: "concept", hierarchyPath: "3", depth: 1 },
      { title: "Funciones y módulos", nodeType: "concept", hierarchyPath: "4", depth: 1 },
      { title: "Manejo de errores", nodeType: "concept", hierarchyPath: "5", depth: 1 },
      { title: "Proyecto práctico", nodeType: "example", hierarchyPath: "6", depth: 1 },
      { title: "Recursos y documentación", nodeType: "source", hierarchyPath: "7", depth: 1 },
    ],
  },
  {
    id: "project-plan",
    name: "Plan de proyecto",
    description: "Organiza un proyecto: objetivos, alcance, tareas, riesgos y cronograma.",
    rootTopic: "Proyecto",
    nodes: [
      { title: "Objetivos", nodeType: "concept", hierarchyPath: "1", depth: 1 },
      { title: "Alcance", nodeType: "concept", hierarchyPath: "2", depth: 1 },
      { title: "Tareas", nodeType: "subtopic", hierarchyPath: "3", depth: 1 },
      { title: "Recursos", nodeType: "source", hierarchyPath: "4", depth: 1 },
      { title: "Riesgos", nodeType: "question", hierarchyPath: "5", depth: 1 },
      { title: "Cronograma", nodeType: "subtopic", hierarchyPath: "6", depth: 1 },
    ],
  },
];