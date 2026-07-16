# MindMap — Especificaciones de Diseño y Desarrollo

## 1. Visión del Diseño

MindMap es una plataforma de mapas mentales con investigación pedagógica asistida por IA. El diseño prioriza la claridad cognitiva, la fluidez de interacción y el enfoque pedagógico. La experiencia debe sentirse como una **herramienta de pensamiento premium** — minimalista pero rica en funcionalidad, con animaciones naturales que reforzuen el modelo mental del usuario.

## 2. Sistema de Diseño

### 2.1 Principios de Diseño

- **Claridad sobre densidad**: Cada elemento tiene propósito y espacio para respirar.
- **Feedback inmediato**: Toda interacción produce respuesta visual en <100ms.
- **Jerarquía visual clara**: El contenido pedagógico y el canvas son protagonistas; la UI es sutil.
- **Modo oscuro como ciudadano de primera**: El tema oscuro no es un afterthought; ambos temas son ciudadanos de primera clase.
- **Animaciones con propósito**: Física natural, nunca decorativas. Las animaciones comunican estado y relaciones espaciales.

### 2.2 Paleta de Colores

#### Modo Claro

| Token | Hex | Uso |
|-------|-----|-----|
| `background` | `#FFFFFF` | Fondo principal del canvas |
| `foreground` | `#0F172A` | Texto principal |
| `card` | `#F8FAFC` | Fondo de paneles y cards |
| `card-foreground` | `#0F172A` | Texto en cards |
| `muted` | `#F1F5F9` | Fondos sutiles, inputs |
| `muted-foreground` | `#64748B` | Texto secundario |
| `border` | `#E2E8F0` | Bordes y separadores |
| `accent` | `#3B82F6` | Acentos primarios, acciones principales |
| `accent-foreground` | `#FFFFFF` | Texto sobre elementos accent |
| `destructive` | `#EF4444` | Eliminación, errores |
| `destructive-foreground` | `#FFFFFF` | Texto sobre elementos destructivos |

#### Modo Oscuro

| Token | Hex | Uso |
|-------|-----|-----|
| `background` | `#0F172A` | Fondo principal del canvas |
| `foreground` | `#F8FAFC` | Texto principal |
| `card` | `#1E293B` | Fondo de paneles y cards |
| `card-foreground` | `#F8FAFC` | Texto en cards |
| `muted` | `#1E293B` | Fondos sutiles, inputs |
| `muted-foreground` | `#94A3B8` | Texto secundario |
| `border` | `#334155` | Bordes y separadores |
| `accent` | `#60A5FA` | Acentos primarios |
| `accent-foreground` | `#0F172A` | Texto sobre elementos accent |
| `destructive` | `#F87171` | Eliminación, errores |
| `destructive-foreground` | `#0F172A` | Texto sobre elementos destructivos |

### 2.3 Colores de Tipos de Nodo (Paleta Pastel Suave)

| Tipo de Nodo | Color Primario | Color Hover | Descripción |
|---------------|----------------|-------------|-------------|
| `root` | `#DBEAFE` / `#1D4ED8` | `#BFDBFE` | Azul profundo — tema raíz |
| `concept` | `#E0E7FF` / `#4F46E5` | `#C7D2FE` | Índigo — conceptos principales |
| `subtopic` | `#D1FAE5` / `#059669` | `#A7F3D0` | Esmeralda — subtemas |
| `question` | `#FEF3C7` / `#D97706` | `#FDE68A` | Ámbar — preguntas |
| `example` | `#FCE7F3` / `#DB2777` | `#FBCFE8` | Rosa — ejemplos |
| `source` | `#E5E7EB` / `#6B7280` | `#D1D5DB` | Gris — fuentes |

### 2.4 Tipografía

| Token | Valor | Uso |
|-------|-------|-----|
| `font-sans` | `Inter` | Tipografía principal de la UI |
| `font-mono` | `JetBrains Mono` | Código, prompts de IA |
| `font-serif` | `Merriweather` | Contenido pedagógico extenso (opcional) |

| Nivel | Tamaño | Weight | Line Height | Uso |
|-------|--------|--------|-------------|-----|
| `xs` | 12px | 400 | 16px | Labels, badges |
| `sm` | 14px | 400 | 20px | Texto secundario, metadata |
| `base` | 16px | 400 | 24px | Texto de lectura principal |
| `lg` | 18px | 500 | 28px | Títulos de sección |
| `xl` | 20px | 600 | 28px | Títulos de panel |
| `2xl` | 24px | 700 | 32px | Títulos de página |
| `3xl` | 30px | 700 | 36px | Título del mapa |

### 2.5 Sistema de Espaciado

Base: 4px

| Token | Valor | Uso |
|-------|-------|-----|
| `space-1` | 4px | Separación mínima entre elementos inline |
| `space-2` | 8px | Padding interno de elementos pequeños |
| `space-3` | 12px | Padding de inputs, buttons pequeños |
| `space-4` | 16px | Padding estándar de componentes |
| `space-5` | 20px | Separación entre grupos de elementos |
| `space-6` | 24px | Padding de paneles |
| `space-8` | 32px | Separación entre secciones |
| `space-12` | 48px | Separación mayor en layouts |

### 2.6 Radios y Bordes

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-sm` | 4px | Badges, chips |
| `radius-md` | 8px | Buttons, inputs |
| `radius-lg` | 12px | Cards, panels |
| `radius-xl` | 16px | Modals, dialogs |
| `radius-full` | 9999px | Avatares, elementos circulares |

### 2.7 Sombras

| Token | Valor | Uso |
|-------|-------|-----|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Elementos sutiles |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)` | Cards flotantes |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | Modals, dropdowns elevados |
| `shadow-node` | `0 4px 12px rgba(0,0,0,0.15)` | Nodos del mapa |
| `shadow-node-selected` | `0 0 0 3px var(--accent), 0 4px 12px rgba(0,0,0,0.2)` | Nodo seleccionado |

### 2.8 Motion y Animaciones

Todas las animaciones siguen principios de **física natural** (spring physics). No hay animaciones lineales ni puramente decorativas.

| Animación | Duración | Easing | Uso |
|-----------|----------|--------|-----|
| `transition-fast` | 100ms | `cubic-bezier(0.2, 0, 0, 1)` | Hover, focus |
| `transition-base` | 200ms | `cubic-bezier(0.2, 0, 0, 1)` | Aparición de elementos |
| `transition-slow` | 300ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Transformaciones grandes |
| `spring-bounce` | ~400ms | Spring `stiffness: 300, damping: 25` | Nodos al crear |
| `spring-gentle` | ~500ms | Spring `stiffness: 200, damping: 20` | Expansión de ramas |
| `drag-physics` | N/A | `@use-gesture` physics | Arrastrar nodos |

#### Comportamientos Específicos

- **Drag de nodos**: Física con `mass: 1`, `stiffness: 300`, `damping: 30`. El nodo debe sentirse con peso.
- **Creación de nodos**: Spring bounce desde scale 0.8 a 1 con opacity 0→1.
- **Eliminación**: Scale 1→0.9 con opacity 1→0, 150ms ease-out.
- **Zoom del canvas**: Transición suave de viewport, no instantáneo.
- **Streaming de texto**: Caracteres aparecen con fade-in sutil, no parpadeo.

## 3. Layout y Estructura

### 3.1 Layout Principal de 3 Columnas

```
┌─────────────────────────────────────────────────────────────────────┐
│  Header: Logo + Actions (Settings, Theme Toggle, User Menu)        │
├────────────┬───────────────────────────────────┬────────────────────┤
│            │                                   │                    │
│  Sidebar   │           Canvas                  │    Panel de        │
│  (280px)   │       (flex: 1)                  │    Detalle         │
│            │                                   │    (400px)         │
│  - Mapas   │   React Flow                     │                    │
│  - Búsqueda│   - Nodos                         │  - Título          │
│  - Acciones│   - Edges                         │  - Contenido       │
│            │   - MiniMap                       │  - Metadata        │
│            │                                   │  - Acciones IA     │
│            │                                   │                    │
└────────────┴───────────────────────────────────┴────────────────────┘
```

### 3.2 Responsive Strategy

| Breakpoint | Layout Adaptativo |
|------------|-------------------|
| `>= 1280px` | 3 columnas completas |
| `>= 1024px` | Sidebar colapsable + Canvas + Panel |
| `>= 768px` | Canvas full + Panel como Sheet lateral |
| `< 768px` | Canvas full + Panel como Modal |

### 3.3 Sidebar

**Ancho**: 280px (colapsable a 64px iconos)

**Contenido**:
- Lista de mapas del usuario
- Búsqueda de mapas
- Crear nuevo mapa (CTA principal)
- Settings de la cuenta

**Estados**:
- Normal: Lista visible con título del mapa, fecha, thumbnail del canvas
- Collapsed: Solo iconos con tooltips
- Hover item: Background sutil, acciones rápidas (duplicar, eliminar)

### 3.4 Canvas (React Flow)

**Características**:
- Pan: Click + drag en fondo vacío
- Zoom: Scroll del mouse, pinch gesture, botones de zoom
- Fit view: Botón para ajustar viewport a contenido visible
- MiniMap: Esquina inferior derecha, muestra overview del grafo

**Toolbar Flotante** (esquina superior izquierda del canvas):
- Crear nodo
- Conectar nodos (toggle)
- Eliminar selección
- Zoom in/out/fit
- Undo/Redo
- Toggle MiniMap
- Toggle Panel lateral

### 3.5 Panel de Detalle

**Ancho**: 400px (colapsable)

**Estructura del contenido**:
```
┌────────────────────────────────────┐
│ [Tipo Badge]           [X] Cerrar  │
├────────────────────────────────────┤
│ Título editable inline              │
│ ─────────────────────────────────  │
│ Resumen corto (excerpt)            │
├────────────────────────────────────┤
│                                    │
│ Contenido desarrollado             │
│ (rich text editor)                 │
│                                    │
├────────────────────────────────────┤
│ 📊 Metadata                        │
│ - Nivel: [Dropdown]                │
│ - Objetivo: [Input]                │
│ - Fuentes: [Lista] [+ Añadir]      │
├────────────────────────────────────┤
│ 🤖 Acciones IA                     │
│ [Generar contenido] [Expandir]     │
│ [Investigación Exa]                │
├────────────────────────────────────┤
│ 💬 Preguntas de estudio            │
│ - Lista de preguntas generadas     │
└────────────────────────────────────┘
```

### 3.6 Modal de Entrevista Inicial

**Tipo**: Dialog centrado

**Estructura**:
```
┌──────────────────────────────────────────────────────────────┐
│                      Crear nuevo mapa                        │
│                      ━━━━━━━━━━━━━━━━━                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  🤖 Asistente                                                │
│                                                               │
│  "Hola, voy a hacerte algunas preguntas para entender        │
│   mejor qué tipo de mapa necesitas..."                       │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ [Avatar] "Cuál es el tema principal que quieres..."    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Usuario: [Input multi-line]                              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  [Omitir entrevista]                    [Continuar →]         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## 4. Componentes UI

### 4.1 shadcn/ui Components Requeridos

```
Button
Dialog
DropdownMenu
Input
Textarea
Select
Tabs
Tooltip
Avatar
Badge
Card
Sheet
Separator
Skeleton
Switch
Toast
ScrollArea
Popover
Command (para slash commands)
ContextMenu
```

### 4.2 Especificaciones de Componentes Custom

#### MindMapNode

**Apariencia**:
- Card con sombra `shadow-node`
- Borde izquierdo de 4px con color del tipo de nodo
- Padding interno: 16px
- Min-width: 200px, Max-width: 320px

**Estados**:
| Estado | Apariencia |
|--------|------------|
| Default | Sombra normal, borde de tipo visible |
| Hover | Sombra elevada `shadow-md`, scale 1.02 |
| Selected | `shadow-node-selected`, borde accent 2px |
| Dragging | Opacity 0.8, sombra grande, scale 1.05 |
| Generating | Skeleton pulse en contenido |
| Error | Borde rojo, icono de error |

**Estructura interna**:
```
┌────────────────────────────────┐
│ [Icon tipo] Título del nodo    │
│ Excerpt del contenido...       │
│ ──────                         │
│ [Badge nivel] [Badge fuentes]  │
└────────────────────────────────┘
```

#### Edge (Conexión entre nodos)

- Stroke width: 2px
- Color: `muted-foreground` con opacity 0.5
- Hover: Stroke width 3px, color accent
- Selected: Color accent, stroke width 3px
- Tipo especial (causal, comparativo): Stipple o dash pattern

#### SlashCommandMenu

**Trigger**: Tecla `/` en el panel de contenido

**Apariencia**:
- Popover con Command de shadcn
- Filtro en tiempo real
- Categorías: Acciones, Nodos, IA, Formato

**Comandos disponibles**:
| Comando | Acción |
|---------|--------|
| `/new-node` | Crear nuevo nodo |
| `/connect` | Entrar en modo conexión |
| `/generate` | Generar contenido con IA |
| `/expand` | Expandir nodo con subnodos |
| `/research` | Investigación con Exa |
| `/question` | Añadir pregunta de estudio |
| `/source` | Añadir fuente |
| `/divider` | Separador visual |
| `/heading` | Título |
| `/list` | Lista con bullets |
| `/quote` | Bloque de cita |

## 5. Especificaciones de Node Types

### 5.1 Definición de Tipos

```typescript
type NodeType = 'root' | 'concept' | 'subtopic' | 'question' | 'example' | 'source';

interface NodeTypeConfig {
  color: {
    light: string;
    dark: string;
    hover: string;
  };
  icon: LucideIcon;
  label: string;
  description: string;
}
```

### 5.2 Metadatos por Tipo

| Tipo | Puede generar contenido | Puede expandirse | Puede tener hijos | Color badge |
|------|------------------------|------------------|-------------------|-------------|
| root | Sí | Sí | Sí | Azul |
| concept | Sí | Sí | Sí | Índigo |
| subtopic | Sí | Sí | Sí | Esmeralda |
| question | No | No | No | Ámbar |
| example | Sí | No | No | Rosa |
| source | No | No | No | Gris |

## 6. Flujos de UX Específicos

### 6.1 Crear Mapa (Entrevista)

1. Usuario hace click en "Nuevo mapa" en sidebar
2. Se abre Dialog de entrevista centrado
3. Agente de IA formula preguntas adaptativas:
   - Pregunta 1: Tema principal
   - Pregunta 2: Objetivo (estudiar, enseñar, investigar, documentar)
   - Pregunta 3: Nivel de conocimiento previo
   - Pregunta 4: Audiencia objetivo
   - Pregunta 5: Profundidad deseada
   - Pregunta 6: Fuentes de preferencia (opcional)
4. Cada respuesta se guarda en contexto de sesión
5. Al completar, usuario puede:
   - "Generar mapa" → Se genera con todo el contexto
   - "Editar contexto" → Modificar respuestas
   - "Omitir" → Generar con mínimo contexto (solo tema)
6. Al generar, Dialog se cierra y canvas muestra el mapa

### 6.2 Expandir Nodo con IA

1. Usuario selecciona nodo
2. Panel de detalle muestra contenido y acciones
3. Usuario clickea "Expandir" o usa `/expand`
4. Loading state en el nodo (skeleton pulse)
5. IA analiza contexto del nodo padre + mapa completo
6. Se generan 2-4 subnodos sugeridos
7. Subnodos aparecen con spring animation desde el padre
8. Conexiones se dibujan automáticamente
9. Usuario puede:
   - Aceptar todos los nodos
   - Eliminar nodos no deseados
   - Regenerar con "otro enfoque"

### 6.3 Drag & Drop de Nodos

1. Usuario inicia drag en nodo
2. Nodo eleva con shadow y scale
3. Canvas sepan/zoom continua funcionando
4. Actualización de posición throttled a 30fps
5. Al soltar:
   - Nodo hace settle animation (spring)
   - Posición se guarda tras debounce de 500ms
   - Edges se actualizan en tiempo real

### 6.4 Streaming de Generación de Contenido

1. Usuario inicia generación de contenido
2. Panel muestra skeleton con cursor de IA
3. Texto aparece palabra por palabra con fade-in
4.如果有错误，显示红色提示和重试按钮
5. 完成时，保存状态和显示完整内容
6. 节点元数据更新（生成时间、模型、令牌）

## 7. Especificaciones Técnicas de Interacción

### 7.1 Auto-Guardado

- **Trigger**: 1.5 segundos tras último cambio (debounce)
- **Feedback**: Toast sutil "Guardado" (no bloqueante)
- **Offline**: Cola de cambios, sincroniza al reconectar
- **Conflictos**: Last-write-wins con notificación si hubo overwrite

### 7.2 Undo/Redo

- **Stack size**: 50 acciones máximo
- **Scope**: Todas las acciones del canvas (crear, mover, editar, eliminar nodos y edges)
- **Keyboard**: Cmd/Ctrl+Z (undo), Cmd/Ctrl+Shift+Z (redo)
- **UI**: Toolbar buttons con disabled state cuando stack vacío

### 7.3 Selección Múltiple

- **Shift+Click**: Añadir a selección
- **Cmd/Ctrl+Click**: Toggle de selección
- **Drag en canvas**: Selección rectangular
- **Acciones批量**: Eliminar, mover, conectar

### 7.4 Shortcuts Globales

| Shortcut | Acción |
|----------|--------|
| `Cmd/Ctrl + N` | Crear nuevo nodo |
| `Cmd/Ctrl + S` | Forzar guardado |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `Cmd/Ctrl + C` | Copiar nodo seleccionado |
| `Cmd/Ctrl + V` | Pegar nodo |
| `Delete/Backspace` | Eliminar selección |
| `Escape` | Deseleccionar / Cerrar panel |
| `Space + Drag` | Pan canvas |
| `+/-` | Zoom in/out |
| `0` | Reset zoom |
| `/` | Slash command menu |

## 8. Diseño de Estados

### 8.1 Estados de Carga

| Escenario | UI |
|-----------|-----|
| Cargando mapa | Skeleton del canvas + shimmer |
| Cargando contenido de nodo | Skeleton en panel |
| Generando contenido IA | Texto con cursor parpadeante + skeleton paragraphs |
| Guardando | Toast sutil "Guardando..." |
| Error de guardado | Toast de error con retry |

### 8.2 Estados Vacíos

| Escenario | UI |
|-----------|-----|
| Sin mapas | Ilustración + "Crea tu primer mapa" CTA |
| Mapa sin nodos | Canvas con hint "Arrastra para crear o usa /new-node" |
| Búsqueda sin resultados | "No se encontraron mapas" + sugerencias |
| Nodo sin contenido | Placeholder con acciones sugeridas |

### 8.3 Estados de Error

| Escenario | UI |
|-----------|-----|
| Error de red | Toast error + retry automático (1 intento) |
| Error de IA | Mensaje en panel + "Reintentar" button |
| Error de autenticación | Redirect a login |
| Error de permisos | Modal: "No tienes acceso a este mapa" |
| Mapa no encontrado | Page 404 con navegación a home |

## 9. Especificaciones de AI (Vercel AI SDK + OpenRouter)

### 9.1 Configuración de Proveedor

```typescript
// .env
OPENROUTER_API_KEY=sk-or-v1-xxx
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

// Modelo por defecto
DEFAULT_MODEL=anthropic/claude-3.5-sonnet

// Modelos por contexto
MODEL_GENERATION=anthropic/claude-3.5-sonnet
MODEL_INTERVIEW=anthropic/claude-3.5-sonnet
MODEL_EXPANSION=anthropic/claude-3.5-sonnet
MODEL_RESEARCH=openai/gpt-4o
```

### 9.2 Templates de Prompt

#### Prompt de Entrevista (Agente Adaptativo)

```
Eres un entrevistador profesional especializado en comprender las necesidades
de los usuarios para crear mapas mentales pedagógicos.

Tu objetivo es recopilar la siguiente información a través de preguntas precisas:
1. Tema principal
2. Objetivo del mapa (estudiar, enseñar, investigar, documentar)
3. Nivel de conocimiento actual del usuario
4. Audiencia objetivo
5. Profundidad deseada (superficial, medio, profundo)
6. Fuentes o recursos de preferencia (opcional)

Instrucciones:
- Haz una pregunta a la vez
- Adapta las preguntas según las respuestas previas
- Mantén un tono profesional pero amigable
- Si el usuario proporciona información insuficiente, pide clarificación
- Cuando tengas suficiente información, resume y pregunta si quiere generar el mapa

Contexto del usuario hasta ahora:
{conversation_history}

Tu siguiente pregunta o respuesta:
```

#### Prompt de Generación de Contenido por Nodo

```
Genera contenido pedagógico para un nodo de mapa mental.

CONTEXTO:
- Mapa: {map_title}
- Tema raíz: {root_topic}
- Tipo de nodo: {node_type}
- Título del nodo: {node_title}
- Nodo padre: {parent_title}
- Hermanos existentes: {sibling_titles}
- Objetivo pedagógico del mapa: {learning_objective}

REQUISITOS DEL CONTENIDO:
El contenido debe seguir esta estructura:
1. Definición clara del concepto
2. Por qué importa en el contexto del mapa
3. Cómo se relaciona con el nodo padre
4. Subideas o componentes principales
5. Ejemplo práctico o caso de uso
6. Conceptos relacionados
7. Preguntas de estudio o reflexión
8. Resumen breve para repaso

EXTENSIÓN: {depth_level} (1=corto, 3=detallado)

IDIOMA: Español

FORMATO DE RESPUESTA:
Usa markdown estructurado con headers, lists y emphasis.
Incluye \"```json\n{ \"type\": \"generated_content\", ... }\n```\" al final con metadata estructurada.
```

#### Prompt de Expansión de Nodo

```
Analiza el siguiente nodo y sugiere subnodos para expandir el mapa mental.

NODO A EXPANDIR:
- Título: {node_title}
- Tipo: {node_type}
- Contenido: {node_content}

MAPA COMPLETO:
- Tema raíz: {root_topic}
- Nodos existentes: {existing_nodes}

REQUISITOS:
- Genera entre 2 y 4 subnodos relevantes
- Los subtítulos deben ser concisos (3-5 palabras)
- Cada subnodo debe tener un tipo apropiado
- Considera el contexto pedagógico del mapa

FORMATO DE RESPUESTA:
```json
{
  "subnodes": [
    {
      "title": "string",
      "type": "concept|subtopic|question|example|source",
      "reason": "por qué este subnodo es relevante"
    }
  ]
}
```
```

### 9.3 Manejo de Errores de IA

| Error | Comportamiento |
|-------|----------------|
| Rate limit | Mensaje: "Demasiadas solicitudes. Espera un momento." + retry 10s |
| Model unavailable | Fallback a modelo alternativo si está disponible |
| Invalid response | Mensaje: "No pude generar contenido. Intenta de nuevo." + retry |
| Network error | Mensaje: "Error de conexión. Verifica tu internet." + retry manual |
| Timeout (>30s) | Cancelar y mostrar mensaje: "La generación tardó demasiado." |

### 9.4 Streaming de Respuestas

```typescript
// Patrón de streaming para contenido de nodo
const { complete, isLoading, error } = useCompletion({
  api: '/api/generate',
  streamParams: {
    model: MODEL_GENERATION,
    temperature: 0.7,
    maxTokens: 2000,
  },
  onResponse: (response) => {
    // Tracking de headers si necesario
  },
  onFinish: (prompt, completion) => {
    // Guardar en base de datos
    // Actualizar UI
  },
  onError: (error) => {
    // Mostrar error en UI
  },
});
```

## 10. Especificaciones de Investigación con Exa.ai

### 10.1 Configuración

```typescript
// .env
EXA_API_KEY=xxx
EXA_BASE_URL=https://api.exa.ai

// Límites
MAX_RESULTS_PER_SEARCH=10
MAX_TOKENS_PER_RESULT=500
SEARCH_TIMEOUT_MS=15000
```

### 10.2 Flujo de Investigación

1. Usuario solicita investigación en nodo
2. Se muestra loading state en panel
3. Se construye query con contexto del nodo + mapa
4. Se llama a Exa search API
5. Resultados se procesan y enriquecen
6. Se muestran como sources asociables al nodo
7. Usuario puede convertir resultados en contenido

### 10.3 Estructura de Source

```typescript
interface Source {
  id: string;
  title: string;
  url: string;
  snippet: string;
  provider: 'exa';
  relevanceScore?: number;
  metadata?: {
    publishedDate?: string;
    author?: string;
    domain?: string;
  };
}
```

## 11. Modelo de Datos Visual

### 11.1 Entity Relationship (Conceptual)

```
User (1) ──────< (N) MindMap
MindMap (1) ───< (N) MindMapNode
MindMapNode (1) ──< (N) MindMapNode (parent-child)
MindMapNode (N) ──< (N) MindMapEdge
MindMapNode (1) ──< (N) ResearchTask
MindMapNode (1) ──< (N) NodeSource
MindMap (1) ───< (N) MapCollaborator
MapCollaborator >──── (1) User
```

### 11.2 Estado de Canvas vs Estado Persistido

| Aspecto | Canvas (Zustand) | Persistido (DB) |
|---------|------------------|-----------------|
| Posición de nodos | ✅ Tiempo real | ✅ Guardado inteligente |
| Zoom/Viewport | ✅ Sesión actual | ❌ No se guarda |
| Contenido de nodos | ✅ Draft local | ✅ Solo tras auto-save |
| Nueva conexión | ✅ Inmediato | ✅ Guardado automático |
| Nueva conexión eliminada | ✅ Inmediato | ✅ Guardado automático |

### 11.3 Modelo de Permisos por Mapa

#### Roles y Capacidades

| Acción | Owner | Editor | Commenter | Viewer |
|--------|-------|--------|-----------|--------|
| **Mapa** |
| Eliminar mapa | ✅ | ❌ | ❌ | ❌ |
| Transferir ownership | ✅ | ❌ | ❌ | ❌ |
| Cambiar visibilidad | ✅ | ❌ | ❌ | ❌ |
| Gestionar colaboradores | ✅ | ❌ | ❌ | ❌ |
| **Nodos** |
| Crear nodo | ✅ | ✅ | ❌ | ❌ |
| Editar título | ✅ | ✅ | ❌ | ❌ |
| Editar contenido | ✅ | ✅ | ❌ | ❌ |
| Mover/Reposicionar | ✅ | ✅ | ❌ | ❌ |
| Eliminar nodo | ✅ | ✅ | ❌ | ❌ |
| Regenerar contenido IA | ✅ | ✅ | ❌ | ❌ |
| Expandir nodo | ✅ | ✅ | ❌ | ❌ |
| **Conexiones** |
| Crear edge | ✅ | ✅ | ❌ | ❌ |
| Eliminar edge | ✅ | ✅ | ❌ | ❌ |
| **Fuentes** |
| Añadir fuente a nodo | ✅ | ✅ | ❌ | ❌ |
| Eliminar fuente | ✅ | ✅ | ❌ | ❌ |
| **Comentarios** |
| Añadir comentario | ✅ | ✅ | ✅ | ❌ |
| Responder comentario | ✅ | ✅ | ✅ | ❌ |
| Resolver comentario | ✅ | ✅ | ✅ | ❌ |
| **Investigación** |
| Solicitar investigación | ✅ | ✅ | ❌ | ❌ |
| Ver resultados de investigación | ✅ | ✅ | ✅ | ✅ |

#### Visibilidad del Mapa

| Visibilidad | Descripción | Acceso |
|-------------|-------------|--------|
| `private` | Solo el owner y colaboradores invitados | Invitación explícita |
| `link_readonly` | Cualquiera con el enlace puede ver | Enlace público |
| `link_editable` | Cualquiera con el enlace puede editar (no recomendado) | Enlace público |

#### Reglas de Autorización

1. **Verificación en cada request**: Toda mutación valida `ownership` o `collaborator.role` antes de ejecutar.
2. **Separación estricta de datos**: Queries siempre filtran por `userId` o `mapId` con acceso verificado.
3. **Ownership intransferible por defecto**: Solo el owner puede eliminar o transferir. No hay mecanismo de "abandonar" un mapa sin eliminarlo.
4. **Viewer no puede convertirse en Editor**: La promoción de rol requiere acción del Owner.

### 11.4 Estrategia de Colaboración Concurrente

#### Modelo de Concurrencia

**Decisión**: Optimistic Concurrency Control (OCC) con versionamiento vectorial por nodo.

**Justificación**: Los mapas mentales son dominio de baja concurrencia real (típicamente 1-2 usuarios simultáneos). OCC con last-write-wins es suficiente y evita la complejidad de CRDTs o Operational Transformation.

#### Mecanismo de Sincronización

```
1. Cada nodo tiene un campo `version: number` que se incrementa en cada update.
2. Cuando el cliente envía una actualización:
   - Server compara versión enviada vs versión en DB
   - Si coincide: apply update, increment version
   - Si no coincide: return 409 Conflict
3. Cliente recibe 409 y debe:
   - Mostrar diff de cambios (si applicable)
   - Ofrecer: "Sobrescribir" | "Descartar mis cambios" | "Fusionar manualmente"
```

#### Conflictos de Edición Simultánea

| Escenario | Comportamiento |
|-----------|----------------|
| Dos usuarios_editan título del mismo nodo | Last-write-wins, perdedor recibe notificación |
| Usuario A edita mientras Usuario B mueve el nodo | Ambos cambios se aplican (son ortogonales) |
| Usuario A elimina nodo que Usuario B está editando | Nodo se elimina, panel de B muestra "Nodo eliminado" |
| Usuario A crea edge mientras Usuario B elimina nodo source | Edge se elimina automáticamente (integridad referencial) |

#### Notificaciones de Cambio

| Evento | Receptor | Mensaje |
|--------|----------|---------|
| Colaborador entra al mapa | Owner | "{user} está editando" (presence indicator) |
| Cambio de otro usuario llega | Todos | Toast sutil "Mapa actualizado" + highlight del nodo |
| Conflicto de versión | Solicitante | Modal con opciones de resolución |
| Colaborador cierra el mapa | Owner | "{user} dejó de editar" |

#### Consideraciones de Rendimiento

- **Polling o WebSocket**: WebSocket para presence + cambios en tiempo real (usar Supabase Realtime o Pusher).
- **Throttling de actualizaciones**: Cliente envía cambios cada 500ms máximo, no por cada keystroke.
- **Offline**: Cola de cambios locally, sync on reconnect con OCC.

### 11.5 Política de Versionado de Contenido

#### Estados del Contenido de un Nodo

| Estado | Símbolo | Descripción | Comportamiento |
|--------|---------|-------------|----------------|
| `manual` | ✏️ | Contenido escrito 100% por usuario | No se sobrescribe nunca sin confirmación explícita |
| `generated` | 🤖 | Contenido generado por IA sin revisión | Usuario puede editar; al editar se convierte en `mixed` |
| `mixed` | ✏️🤖 | Mezcla de contenido manual y generado | Considerado como `manual` para sobrescritura |
| `reviewed` | ✅ | Contenido generado que fue aprobado por usuario | No se regenera sin acción explícita |
| `approved` | ✅⭐ | Contenido final ratified | Estado bloqueado, requiere acción de "desbloquear" para editar |

#### Transiciones de Estado

```
manual ──[generar]──> generated
generated ──[usuario edita]──> mixed
generated ──[usuario aprueba]──> reviewed
reviewed ──[usuario ratifica]──> approved
mixed ──[usuario aprueba]──> reviewed
approved ──[usuario edita]──> mixed (desbloqueado)

Any state ──[regenerar con IA]──> ⚠️ Confirmation modal
  - Si "Sobrescribir": Pasa a generated
  - Si "Crear alternativa": Crea versión alternativa en historial
```

#### Historial de Versiones

Cada nodo mantiene un historial de versiones:

```typescript
interface NodeVersion {
  id: string;
  nodeId: string;
  version: number;
  content: string;
  contentState: 'manual' | 'generated' | 'mixed' | 'reviewed' | 'approved';
  createdBy: 'user' | 'ai';
  createdAt: Date;
  createdByUserId?: string;
  modelUsed?: string;        // Si fue generado por IA
  promptContext?: string;    // Prompt usado para generar
  isCurrent: boolean;
}
```

**Política de Retención**:
- Versiones ilimitadas para nodos con `contentState: 'approved'`
- Últimas 10 versiones para otros estados
- Versiones se eliminan automáticamente tras 30 días si no son `approved`

#### Regeneración de Contenido

**Trigger**: Usuario solicita `/generate` o `Regenerar` en un nodo existente.

**Comportamiento según estado actual**:

| Estado Actual | Comportamiento |
|---------------|----------------|
| `manual` | Confirmación: "Esto reemplazará tu contenido manual. Continuar?" |
| `generated` | Confirmación: "Regenerar contenido existente?" |
| `mixed` | Confirmación: "Esto reemplazará contenido mixto. Continuar?" |
| `reviewed` | Confirmación强硬: "Regenerar contenido aprobado requiere desbloqueo. Continuar?" |
| `approved` | Modal: "Este contenido está aprobado. Desbloquear para regenerar?" |

**Post-regeneración**:
1. Contenido anterior se mueve a historial con su estado
2. Nuevo contenido se marca como `generated`
3. Badge en nodo muestra "Regenerado {timestamp}"

### 11.6 Criterio de Citación y Fuentes

#### Tipos de Fuente

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `web` | URL externa | https://example.com/article |
| `document` | Documento subido | PDF, texto |
| `ai_generated` | Contenido citado de generación | Referencia interna |
| `research` | Resultado de Exa | Snippet de búsqueda |
| `user_note` | Nota personal del usuario | "Ver clase delProf. X" |

#### Estructura de Citación en Nodo

```typescript
interface NodeCitation {
  id: string;
  nodeId: string;
  sourceId: string;
  quotedText?: string;       // Texto exacto citado (opcional)
  location?: {
    start: number;            // Posición inicio en contenido
    end: number;              // Posición fin en contenido
  };
  pageReference?: string;     // Para PDFs: "p. 42"
  accessedAt: Date;
  citedAt: Date;              // Cuándo se añadió la cita
  addedBy: 'user' | 'ai';
}
```

#### Integración con Contenido del Nodo

El contenido del nodo es un bloque de texto (markdown) donde las citas se marcan con sintaxis especial:

```markdown
Las bases de datos NoSQL permiten escalabilidad horizontal[^1], a diferencia
de las relacionales que escalan verticalmente[^2].

[^1]: Smith, J. (2023). *Introduction to NoSQL*. TechPress.
[^2]: Ver: https://wikipedia.org/wiki/SQL#Scalability
```

**Parsing**:
- Las marcas `[^N]` se parsean y se renderizan como superscripts clickeables
- Hover muestra preview de la fuente
- Click abre panel lateral con detalles completos de la fuente

#### Panel de Fuentes del Nodo

```
┌─────────────────────────────────────────┐
│ 📚 Fuentes ({count})                     │
├─────────────────────────────────────────┤
│ [Web] The NoSQL Debate - TechCrunch     │
│     https://techcrunch.com/nosql       │
│     Citado en párrafos 2, 4             │
│     [Ir a fuente] [Eliminar]            │
├─────────────────────────────────────────┤
│ [AI] Generación inicial del nodo       │
│     Modelo: claude-3.5-sonnet          │
│     Prompt: "Genera contenido sobre..." │
│     [Ver prompt] [Ver respuesta]        │
├─────────────────────────────────────────┤
│ [+ Añadir fuente manualmente]            │
│ [🔍 Buscar en Exa]                      │
└─────────────────────────────────────────┘
```

#### Metadata de Fuente

```typescript
interface Source {
  id: string;
  mapId: string;
  nodeIds: string[];          // Nodos que referencian esta fuente
  type: 'web' | 'document' | 'ai_generated' | 'research' | 'user_note';
  title: string;
  url?: string;               // Para web y research
  fileId?: string;            // Para documentos subidos
  snippet?: string;           // Preview del contenido
  metadata: {
    author?: string;
    publishedDate?: string;
    domain?: string;
    accessedAt: Date;
    // Para AI
    model?: string;
    prompt?: string;
    // Para research (Exa)
    relevanceScore?: number;
    exaId?: string;
  };
  createdAt: Date;
  createdBy: string;          // User ID
}
```

#### Reglas de Citación

1. **Trazabilidad**: Toda generación de IA debe guardar el prompt y modelo usado como `source` de tipo `ai_generated`.
2. **Exa attribution**: Resultados de Exa se marcan con `source.type: 'research'` y se citan automáticamente si el usuario los usa.
3. **Consolidación**: Misma URL en diferentes nodos = misma `Source` entity con `nodeIds` múltiple.
4. **Eliminación en cascada**: Eliminar un nodo no elimina la fuente, solo desvincula (`nodeIds`).
5. **Preview de fuente**: Hover en cita muestra snippet + metadata sin abandonar el nodo.

## 12. Arquitectura de Archivos (Feature-Based)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/
│   │   ├── page.tsx                 # Lista de mapas
│   │   └── [mapId]/
│   │       ├── page.tsx             # Editor del mapa
│   │       └── layout.tsx           # Layout con sidebar/panel
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.ts             # POST: Generación de contenido
│   │   ├── research/
│   │   │   └── route.ts            # POST: Investigación Exa
│   │   └── maps/
│   │       └── route.ts             # CRUD de mapas
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                          # shadcn components
│   ├── canvas/
│   │   ├── MindMapCanvas.tsx
│   │   ├── CanvasToolbar.tsx
│   │   ├── nodes/
│   │   │   ├── MindMapNode.tsx
│   │   │   └── NodeContent.tsx
│   │   ├── edges/
│   │   │   └── MindMapEdge.tsx
│   │   └── MiniMap.tsx
│   ├── panels/
│   │   ├── Sidebar.tsx
│   │   ├── DetailPanel.tsx
│   │   └── NodeMetadata.tsx
│   ├── interview/
│   │   ├── InterviewDialog.tsx
│   │   ├── InterviewChat.tsx
│   │   └── InterviewAgent.tsx
│   └── shared/
│       ├── ThemeToggle.tsx
│       └── UserMenu.tsx
├── features/
│   ├── maps/
│   │   ├── hooks/
│   │   │   └── useMaps.ts
│   │   ├── services/
│   │   │   └── mapsService.ts
│   │   └── types/
│   │       └── map.ts
│   ├── nodes/
│   │   ├── hooks/
│   │   │   └── useNodes.ts
│   │   ├── services/
│   │   │   └── nodesService.ts
│   │   └── types/
│   │       └── node.ts
│   ├── ai/
│   │   ├── hooks/
│   │   │   ├── useGenerate.ts
│   │   │   └── useInterview.ts
│   │   ├── services/
│   │   │   └── aiService.ts
│   │   └── prompts/
│   │       ├── interview.ts
│   │       └── generation.ts
│   └── research/
│       ├── hooks/
│       │   └── useResearch.ts
│       ├── services/
│       │   └── exaService.ts
│       └── types/
│           └── research.ts
├── lib/
│   ├── db/
│   │   ├── schema.ts                # Drizzle schema
│   │   └── index.ts
│   ├── ai/
│   │   ├── provider.ts              # OpenRouter config
│   │   └── models.ts                # Model configs
│   ├── utils/
│   │   ├── canvas.ts
│   │   ├── debounce.ts
│   │   └── cn.ts
│   └── constants.ts
├── store/
│   ├── useCanvasStore.ts            # Zustand: nodes, edges, viewport
│   ├── useInterviewStore.ts         # Zustand: interview state
│   └── useUIStore.ts                # Zustand: panels, dialogs
├── types/
│   └── index.ts
└── env.ts                           # Environment validation
```

## 13. Design Tokens (CSS Variables)

### 13.1 Tokens Base (Light)

```css
:root {
  /* Colors */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 210 40% 98%;
  --card-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  --accent: 221.2 83.2% 53.3%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-node: 0 4px 12px rgb(0 0 0 / 0.15);

  /* Font */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### 13.2 Tokens Oscuros (Override)

```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 217.2 32.6% 17.5%;
  --card-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --border: 217.2 32.6% 17.5%;
  --accent: 217.2 91.2% 59.8%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 62.8% 70.6%;
  --destructive-foreground: 210 40% 98%;
}
```

## 14. Checklist de Implementación de Diseño

### 15.1 Sistema de Diseño
- [ ] Configurar Tailwind CSS con shadcn/ui
- [ ] Implementar diseño de tokens (CSS variables)
- [ ] Configurar TemaProvider para light/dark
- [ ] Implementar todos los componentes shadcn necesarios
- [ ] Crear componentes custom (MindMapNode, Edge, etc.)
- [ ] Implementar sistema de animaciones (framer-motion o motion)

### 15.2 Layout
- [ ] Layout principal de 3 columnas
- [ ] Sidebar con lista de mapas
- [ ] Canvas con React Flow
- [ ] Panel de detalle colapsable
- [ ] Responsive breakpoints

### 15.3 Canvas
- [ ] Configurar React Flow con Zustand
- [ ] Implementar drag & drop de nodos
- [ ] Implementar conexiones entre nodos
- [ ] Toolbar flotante
- [ ] MiniMap
- [ ] Zoom y pan controls
- [ ] Undo/Redo stack

### 15.4 Nodos
- [ ] Renderizado de nodos por tipo
- [ ] Estados de nodo (default, hover, selected, dragging, generating, error)
- [ ] Badges de tipo y nivel
- [ ] Excerpt de contenido
- [ ] Edición inline de título
- [ ] Panel de detalle con contenido completo

### 15.5 Estados de Contenido y Versionado
- [ ] Implementar campo `contentState` en modelo de nodo
- [ ] Sistema de transiciones de estado (manual → generated → mixed → reviewed → approved)
- [ ] Historial de versiones por nodo
- [ ] Modal de confirmación para regenerar según estado
- [ ] UI badges visuales para cada estado

### 15.6 Fuentes y Citación
- [ ] Modelo de Source con tipos (web, document, ai_generated, research, user_note)
- [ ] Parser de markdown para sintaxis de citas `[^N]`
- [ ] Panel de fuentes por nodo
- [ ] Hover preview de cita
- [ ] Consolidación de fuentes duplicadas
- [ ] Atribución automática de Exa y IA

### 15.7 Permisos y Colaboración
- [ ] Modelo MapCollaborator con roles (owner, editor, commenter, viewer)
- [ ] Middleware de autorización en API routes
- [ ] Visibilidad del mapa (private, link_readonly)
- [ ] Gestión de colaboradores (invitar, cambiar rol, eliminar)
- [ ] Presence indicator (quién está editando)

### 15.8 Concurrencia
- [ ] Versionamiento de nodos con optimistic concurrency
- [ ] Manejo de 409 Conflict con modal de resolución
- [ ] WebSocket para sincronización en tiempo real
- [ ] Cola de cambios para offline
- [ ] Throttling de actualizaciones (500ms)

### 15.9 Entrevista
- [ ] Dialog de entrevista
- [ ] Componente de chat con mensajes
- [ ] Integración con Vercel AI SDK
- [ ] Streaming de respuestas del agente
- [ ] Manejo de contexto de conversación
- [ ] Transición a generación de mapa

### 15.10 IA
- [ ] Configuración de OpenRouter como provider
- [ ] Hook de generación de contenido
- [ ] Hook de expansión de nodos
- [ ] Streaming de respuestas
- [ ] Manejo de errores con retry
- [ ] Tracking de metadata (modelo, tokens, tiempo)

### 15.11 Investigación
- [ ] Integración con Exa.ai
- [ ] Búsqueda contextual por nodo
- [ ] Presentación de resultados
- [ ] Asociación de sources a nodos

### 15.12 UX
- [ ] Auto-guardado con debounce
- [ ] Shortcuts de teclado
- [ ] Slash commands
- [ ] Estados de carga (skeletons)
- [ ] Estados vacíos
- [ ] Estados de error

### 15.13 Interacción
- [ ] Drag & drop throttled 30fps
- [ ] Spring physics en animaciones
- [ ] Selección múltiple de nodos
- [ ] Fit view functionality
