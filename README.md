# MindMap

Plataforma de mapas mentales con investigación pedagógica asistida por IA.

## Qué es

MindMap permite crear mapas mentales estructurados donde cada nodo es una unidad de estudio con contenido pedagógico generado por IA. Combina:

- **Canvas interactivo** con React Flow para visualizar y editar la jerarquía
- **Generación de contenido** con streaming en tiempo real
- **Investigación contextual** usando Exa.ai para fundamentar el contenido
- **Colaboración** con roles y compartición por enlaces

## Stack técnico

| Capa | Tecnología |
|------|-------------|
| App web | Next.js 16 (App Router) |
| UI | React 19 + shadcn/ui + Tailwind CSS |
| Canvas | React Flow |
| Estado | Zustand |
| Auth | Clerk |
| ORM | Drizzle ORM |
| DB | PostgreSQL (Neon) |
| IA | Vercel AI SDK + OpenRouter |
| Investigación | Exa.ai |

## Estructura del proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── maps/          # Mapas, nodos, edges
│   │   ├── interviews/     # Sesiones de entrevista
│   │   ├── share/         # Acceso público compartido
│   │   └── ...
│   ├── dashboard/         # Dashboard del usuario
│   │   └── [mapId]/       # Editor de mapa
│   ├── share/             # Página pública de mapas
│   └── sign-in/           # Auth pages
├── components/
│   ├── canvas/             # Componentes del canvas (MindMapCanvas, nodes, edges)
│   ├── panels/            # Paneles (NodeDetail, etc)
│   └── ui/                # Componentes shadcn/ui
├── lib/
│   ├── agents/            # Agentes de IA (researcher, editor, nodePlanner)
│   ├── ai/                # Configuración de OpenRouter y modelos
│   ├── db/                # Drizzle schema y configuración
│   └── permissions.ts      # Sistema de permisos
└── store/                 # Stores Zustand
    ├── canvas.ts           # Estado del canvas
    ├── ui.ts              # Estado de UI
    └── drafts.ts          # Drafts de edición
```

## Modelos de IA disponibles

| Modelo | Uso |
|--------|-----|
| Gemma 4 31B | Entrevista, generación, expansión |
| DeepSeek V4 Pro | Investigación |
| GPT-4o Mini | Generalista |
| Claude 3.5 Sonnet | Redacción pedagógica |

## Funcionalidades

### Creación de mapas
1. **Entrevista inicial**: Agente conversacional que hace preguntas para entender el objetivo
2. **Generación de estructura**: El planner crea nodos con jerarquía (1, 1.1, 1.2, etc.)
3. **Canvas interactivo**: Visualización y edición del mapa

### Generación de contenido por nodo
1. **Investigación**: Exa.ai busca fuentes relevantes
2. **Evaluación QA**: Valida calidad de la investigación
3. **Generación streaming**: Contenido aparece en tiempo real
4. **Versionado**: Cada cambio crea una revisión

### Colaboración
- Invitar colaboradores por email con roles (editor, comentarista, viewer)
- Generar links de compartición públicos
- Permisos granulares por acción

### Persistencia de viewport
- Posición y zoom se guardan por usuario
- Se restaura al abrir el mapa

## Configuración de entorno

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# OpenRouter (API global del sistema)
OPENROUTER_API_KEY=sk-or-...

# Exa.ai
EXA_API_KEY=...
```

## Scripts

```bash
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run lint         # Linting
npx drizzle-kit push # Push migraciones a DB
```

## Modelo de datos

### Tablas principales

- **users**: Usuarios sincronizados con Clerk
- **mind_maps**: Mapas con metadata y ownership
- **map_nodes**: Nodos con contenido pedagógico
- **map_edges**: Conexiones entre nodos
- **interview_sessions**: Sesiones de entrevista
- **node_revisions**: Versionado de nodos
- **map_views**: Viewport por usuario
- **map_collaborators**: Permisos de colaboración
- **map_share_links**: Links públicos de compartición

## API endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/maps` | Listar mapas del usuario |
| POST | `/api/maps` | Crear mapa |
| GET | `/api/maps/[id]` | Obtener mapa con nodos |
| DELETE | `/api/maps/[id]` | Eliminar mapa |
| POST | `/api/maps/[id]/nodes` | Crear nodo |
| PATCH | `/api/maps/[id]/nodes/[nodeId]` | Actualizar nodo |
| POST | `/api/maps/[id]/nodes/[nodeId]/generate` | Generar contenido |
| POST | `/api/interviews` | Iniciar entrevista |
| POST | `/api/interviews/[id]/messages` | Enviar mensaje |
| POST | `/api/maps/[id]/collaborators` | Invitar colaborador |
| POST | `/api/maps/[id]/share-links` | Crear link público |

## Permisos y roles

| Rol | Leer | Editar | Generar | Colaboradores | Eliminar |
|-----|------|--------|---------|--------------|----------|
| owner | Sí | Sí | Sí | Sí | Sí |
| editor | Sí | Sí | Sí | No | No |
| commenter | Sí | No | No | No | No |
| viewer | Sí | No | No | No | No |

## Estado del proyecto

En desarrollo activo. Infraestructura core implementada:

- Canvas interactivo ✅
- Generación con streaming ✅
- Versionado de nodos ✅
- Viewport por usuario ✅
- Colaboración básica ✅
- Compartición por links ✅

Pendiente:

- Tests automatizados
- Panel de configuración de modelos por usuario
- Observabilidad y logs
