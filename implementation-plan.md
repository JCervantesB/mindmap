# Plan de implementación — MindMap

## Objetivo del documento

Este documento define un plan de implementación técnico para llevar a producción la plataforma **MindMap**, tomando como base el PRD del producto y las especificaciones funcionales y de UX ya definidas.[file:18][file:17][file:19]

El objetivo es convertir la visión del producto en una arquitectura ejecutable, con un modelo de datos relacional claro, límites entre módulos, contratos entre capas, estrategia de autorización, lineamientos de sincronización del canvas, integración de IA e investigación, y una estructura de código alineada con **SRP** y **SOLID**.[file:18][file:17][file:19]

Este documento sí incluye estructura técnica, decisiones de implementación, definición de módulos, contratos de dominio, tablas de base de datos, flujo de persistencia y secuencia recomendada de construcción. No busca ser un backlog granular por tarea, pero sí una guía suficientemente precisa para que un equipo humano o un agente de IA pueda ejecutar el sistema sin ambigüedades severas.[file:18][file:17][file:19]

## Principios de arquitectura

### Principios rectores

La implementación debe preservar los principios del producto: mapa primero, pedagogía antes que verbosidad, control editorial total por parte del usuario, investigación contextual y privacidad por defecto.[file:18] Eso implica que el canvas, el contenido pedagógico, la autorización y la trazabilidad de IA deben modelarse como subsistemas separados pero coordinados.[file:18][file:17]

### Aplicación de SRP

Cada módulo debe tener una única responsabilidad dominante:

- El módulo de autenticación resuelve identidad, no permisos de dominio.
- El módulo de autorización resuelve acceso a mapas, no autenticación.
- El módulo de canvas gestiona interacción visual, no persistencia relacional directa.
- El módulo de nodos gestiona reglas de negocio sobre nodos, no llamadas a modelos.
- El módulo de IA genera contenido o estructura, no guarda directamente en base de datos.
- El módulo de investigación consulta proveedores externos y normaliza resultados, no decide pedagogía final.
- El módulo de persistencia implementa repositorios, no reglas de negocio.

### Aplicación de SOLID

- **S**: Cada servicio de aplicación debe encapsular un caso de uso o una familia muy cohesionada de casos de uso.
- **O**: Los proveedores de IA, investigación y notificación deben depender de interfaces para poder extenderse sin reescribir casos de uso.
- **L**: Implementaciones como `OpenRouterTextGenerator` o `ExaResearchProvider` deben poder sustituir sus abstracciones sin romper a los consumidores.
- **I**: Los contratos deben ser pequeños y específicos, por ejemplo `MapReader`, `MapWriter`, `NodeGenerator`, `ResearchProvider`, `PermissionEvaluator`.
- **D**: Los casos de uso dependen de puertos e interfaces, no de Clerk, Exa, OpenRouter, Drizzle o React Flow directamente.

## Stack técnico final

| Capa | Tecnología | Rol en implementación |
|---|---|---|
| App web | Next.js App Router | Shell fullstack, server components, route handlers, server actions controladas.[file:18] |
| UI | React + shadcn/ui + Tailwind | Interfaz del dashboard, chat, paneles y estados visuales.[file:17][file:19] |
| Canvas | React Flow | Renderizado y edición del grafo interactivo.[file:18][file:17] |
| Estado cliente | Zustand | Estado efímero del canvas, selección, paneles, drafts locales y sesión de entrevista.[file:17][file:19] |
| Auth | Clerk | Identidad, sesión y user ID confiable.[file:18] |
| ORM | Drizzle ORM | Schema tipado, migraciones y acceso relacional.[file:18] |
| Base de datos | PostgreSQL / Neon | Persistencia principal del dominio.[file:18] |
| IA generativa | Vercel AI SDK | Orquestación de streaming, tools, prompts y respuestas.[file:18][file:19] |
| Model provider | OpenRouter | Acceso a múltiples LLMs para entrevista, expansión y generación.[file:18][file:17] |
| Investigación | Exa.ai | Búsqueda e investigación contextual por nodo o mapa.[file:18][file:17] |
| Tiempo real | WebSocket o Supabase Realtime compatible | Presencia, sincronización ligera y eventos de colaboración.[file:19] |
| Cola asíncrona | Trigger/background jobs | Investigación, regeneración y tareas costosas. |

## Estilo de arquitectura recomendado

La mejor forma de implementar este producto es mediante una **arquitectura modular orientada a casos de uso**, no una separación superficial por framework. El sistema debe dividirse en módulos de dominio con puertos explícitos y adaptadores concretos para DB, IA, auth y providers externos.[file:18][file:19]

Se recomienda una variante práctica de **Clean Architecture / Hexagonal**:

- **Dominio**: entidades, value objects, enums y reglas puras.
- **Aplicación**: casos de uso, políticas de autorización, orquestación de flujos.
- **Infraestructura**: Drizzle repositories, adaptadores Clerk, OpenRouter, Exa, realtime y storage.
- **Presentación**: routes, server actions, hooks, componentes React y stores de Zustand.

## Módulos de dominio

### 1. Identity

Responsabilidad: representar al usuario autenticado dentro del dominio interno a partir del `clerkUserId`.[file:18]

### 2. Maps

Responsabilidad: ciclo de vida del mapa, metadata, visibilidad, preferencias del mapa y ownership.[file:18]

### 3. Nodes

Responsabilidad: creación, edición, borrado, tipado pedagógico y versionado de nodos.[file:18][file:17]

### 4. Edges

Responsabilidad: conexiones del grafo, relaciones conceptuales y validaciones de integridad dentro del mapa.[file:18]

### 5. Canvas Layout

Responsabilidad: posiciones, viewport, selección persistible, colapso de ramas y metadata visual del editor.[file:18][file:17]

### 6. Collaboration

Responsabilidad: invitaciones, roles, permisos por mapa, presencia y autorización contextual.[file:18][file:19]

### 7. Interview

Responsabilidad: entrevista conversacional inicial, recolección de intención y consolidación de briefing del mapa.[file:18][file:17]

### 8. Research

Responsabilidad: disparar tareas de investigación, persistir resultados, normalizar fuentes y adjuntarlas a nodos o mapas.[file:18][file:17]

### 9. Generation

Responsabilidad: generar contenido pedagógico, sugerir nodos, expandir ramas y mantener trazabilidad del contenido generado.[file:18][file:17]

### 10. Audit / Activity

Responsabilidad: registrar eventos relevantes de dominio para trazabilidad operativa y futura observabilidad.[file:18]

## Estructura de carpetas propuesta

```txt
src/
  app/
    (public)/
    (auth)/
    (dashboard)/
      maps/
      maps/[mapId]/
    api/
      maps/
      nodes/
      edges/
      collaborators/
      interview/
      generation/
      research/
      presence/
  modules/
    identity/
      domain/
      application/
      infrastructure/
    maps/
      domain/
      application/
      infrastructure/
      presentation/
    nodes/
      domain/
      application/
      infrastructure/
      presentation/
    edges/
      domain/
      application/
      infrastructure/
    canvas/
      domain/
      application/
      infrastructure/
      presentation/
    collaboration/
      domain/
      application/
      infrastructure/
    interview/
      domain/
      application/
      infrastructure/
      presentation/
    research/
      domain/
      application/
      infrastructure/
    generation/
      domain/
      application/
      infrastructure/
    activity/
      domain/
      application/
      infrastructure/
  shared/
    domain/
    application/
    infrastructure/
    presentation/
  lib/
    db/
    auth/
    ai/
    research/
    realtime/
    validation/
  store/
    canvas/
    ui/
    drafts/
    interview/
```

Esta estructura mejora la propuesta inicial basada en features porque evita mezclar componentes, hooks y servicios sin frontera clara, y facilita aplicar SRP por módulo y DIP por interfaz de aplicación.[file:17][file:19]

## Decisiones clave de modelado

### 1. El mapa es el agregado raíz principal

`MindMap` debe actuar como agregado lógico para ownership, visibilidad, permisos y consistencia global. Nodos, edges, configuraciones, colaboradores y tareas derivadas deben referenciar siempre a `map_id` para mantener aislamiento, autorización y consultas eficientes.[file:18]

### 2. Nodos y edges son entidades explícitas

No deben persistirse como un blob JSON completo del grafo. El canvas puede hidratarse como JSON en la UI, pero la verdad persistente debe mantenerse en tablas relacionales para permitir permisos, auditoría, sincronización, consultas parciales y evolución futura.[file:18][file:17]

### 3. Layout visual separado del contenido pedagógico

La posición, tamaño, colapso, z-index y viewport pertenecen al problema del editor visual; el contenido pedagógico, fuentes y metadata pertenecen al dominio de conocimiento. Separar ambas capas reduce acoplamiento y simplifica cambios futuros.[file:18][file:17]

### 4. La entrevista es una entidad persistible

Aunque la entrevista inicia como chat, sus respuestas deben consolidarse en una entidad reutilizable, porque alimenta la generación inicial del mapa y puede ser útil para regeneraciones posteriores, auditoría o refinamiento del enfoque pedagógico.[file:18]

### 5. Investigación y generación son procesos distintos

La investigación con Exa no debe mezclarse con la generación pedagógica final. Primero se obtiene evidencia, luego se sintetiza o transforma mediante IA generativa, manteniendo ambas trazas separadas.[file:18][file:17]

## Modelo de base de datos

La implementación debe usar PostgreSQL con UUIDs, timestamps con zona horaria, soft delete solo donde aporte valor real y versionado optimista en entidades mutables críticas.[file:18][file:19]

### Convenciones generales

- Primary keys: `uuid`.
- Foreign keys explícitas.
- `created_at`, `updated_at` en tablas de negocio.
- `version` entero en entidades sujetas a concurrencia.
- `deleted_at` solo para mapas y nodos si se quiere restauración.
- `jsonb` únicamente para metadata flexible, nunca para esconder columnas de dominio importantes.

### Tablas principales

#### users

Representa el usuario de dominio sincronizado con Clerk.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | Identificador interno |
| clerk_user_id | text unique | ID externo confiable |
| email | text nullable | Copia útil para queries |
| display_name | text nullable | Nombre visible |
| avatar_url | text nullable | Avatar |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### mind_maps

Agregado principal del producto.[file:18]

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| owner_id | uuid fk users.id | Owner del mapa |
| title | text | |
| description | text nullable | |
| root_topic | text | |
| purpose | text nullable | estudiar, enseñar, investigar, documentar |
| audience | text nullable | |
| knowledge_level | text nullable | básico, medio, avanzado |
| depth_preference | text nullable | shallow, medium, deep |
| visibility | text | private, shared, link_readonly |
| status | text | draft, active, archived |
| current_version | integer | versión global del mapa |
| settings_json | jsonb | flags pedagógicos y visuales no críticas |
| last_opened_at | timestamptz nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| deleted_at | timestamptz nullable | |

#### map_views

Separa estado del editor visual por mapa y opcionalmente por usuario, resolviendo la tensión entre “guardar viewport” y colaboración.[file:18][file:17]

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| map_id | uuid fk mind_maps.id | |
| user_id | uuid fk users.id | vista por usuario |
| viewport_x | numeric | |
| viewport_y | numeric | |
| zoom | numeric | |
| selected_node_id | uuid nullable | opcional |
| panel_state | text nullable | open, closed |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Regla: el layout del grafo es compartido a nivel mapa, pero el viewport y selección deben ser por usuario para no interferir con colaboradores.

#### map_nodes

Entidad central pedagógica y visual.[file:18][file:17]

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| map_id | uuid fk mind_maps.id | |
| parent_node_id | uuid nullable fk map_nodes.id | jerarquía primaria opcional |
| created_by | uuid fk users.id | |
| updated_by | uuid fk users.id | |
| node_type | text | root, concept, subtopic, question, example, source |
| title | text | |
| slug | text nullable | útil para anchors futuros |
| short_summary | text nullable | excerpt |
| content_markdown | text nullable | fuente principal editable |
| content_json | jsonb nullable | opcional para editor rico futuro |
| learning_objective | text nullable | |
| difficulty_level | text nullable | beginner, intermediate, advanced |
| generation_mode | text | manual, generated, mixed |
| editorial_status | text | draft, reviewed, approved |
| source_count | integer default 0 | denormalización útil |
| child_count | integer default 0 | denormalización útil |
| pos_x | numeric | layout compartido |
| pos_y | numeric | layout compartido |
| width | numeric nullable | opcional |
| height | numeric nullable | opcional |
| is_collapsed | boolean default false | |
| version | integer default 1 | optimistic concurrency |
| last_generated_at | timestamptz nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| deleted_at | timestamptz nullable | |

Índices sugeridos:

- `(map_id)`
- `(map_id, parent_node_id)`
- `(map_id, node_type)`
- full text opcional sobre `title`, `short_summary`, `content_markdown`

#### map_edges

Relaciones explícitas del grafo.[file:18]

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| map_id | uuid fk mind_maps.id | |
| source_node_id | uuid fk map_nodes.id | |
| target_node_id | uuid fk map_nodes.id | |
| relation_type | text | structural, related, causal, comparative, prerequisite |
| label | text nullable | |
| style_json | jsonb nullable | dash, curvature, color |
| created_by | uuid fk users.id | |
| updated_by | uuid fk users.id | |
| version | integer default 1 | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Restricción sugerida:

- unique `(map_id, source_node_id, target_node_id, relation_type)`

#### map_collaborators

Permisos explícitos por mapa.[file:18][file:19]

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| map_id | uuid fk mind_maps.id | |
| user_id | uuid fk users.id | |
| role | text | owner, editor, commenter, viewer |
| invited_by | uuid fk users.id | |
| accepted_at | timestamptz nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Restricción sugerida:

- unique `(map_id, user_id)`

#### map_share_links

Compartición controlada por enlace.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| map_id | uuid fk mind_maps.id | |
| token | text unique | secreto aleatorio |
| access_mode | text | readonly |
| expires_at | timestamptz nullable | |
| revoked_at | timestamptz nullable | |
| created_by | uuid fk users.id | |
| created_at | timestamptz | |

#### interview_sessions

Sesión de entrevista para crear el mapa.[file:18][file:17]

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| owner_id | uuid fk users.id | |
| map_id | uuid nullable fk mind_maps.id | se llena al materializar mapa |
| status | text | draft, completed, abandoned, materialized |
| intent_summary | text nullable | síntesis del briefing |
| topic | text nullable | |
| objective | text nullable | |
| audience | text nullable | |
| knowledge_level | text nullable | |
| depth_preference | text nullable | |
| preferred_sources | jsonb nullable | |
| conversation_json | jsonb | transcript normalizado |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### research_tasks

Tarea de investigación persistida.[file:18]

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| map_id | uuid fk mind_maps.id | |
| node_id | uuid nullable fk map_nodes.id | |
| requested_by | uuid fk users.id | |
| provider | text | exa |
| status | text | queued, running, completed, failed, canceled |
| query_text | text | |
| prompt_context | jsonb | contexto enviado |
| raw_result_json | jsonb nullable | payload bruto |
| normalized_result_json | jsonb nullable | resultado normalizado |
| error_message | text nullable | |
| started_at | timestamptz nullable | |
| completed_at | timestamptz nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### node_sources

Fuentes asociadas a nodos o investigaciones.[file:18][file:17]

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| map_id | uuid fk mind_maps.id | |
| node_id | uuid fk map_nodes.id | |
| research_task_id | uuid nullable fk research_tasks.id | |
| title | text | |
| url | text | |
| provider | text | exa, manual |
| snippet | text nullable | |
| author | text nullable | |
| domain | text nullable | |
| published_at | timestamptz nullable | |
| relevance_score | numeric nullable | |
| metadata_json | jsonb nullable | |
| created_at | timestamptz | |

#### generation_tasks

Separa generación pedagógica de investigación.[file:18]

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| map_id | uuid fk mind_maps.id | |
| node_id | uuid nullable fk map_nodes.id | |
| requested_by | uuid fk users.id | |
| task_type | text | initial_map, node_content, node_expansion, node_questions, rewrite |
| provider | text | openrouter |
| model_name | text | |
| status | text | queued, running, streamed, completed, failed, canceled |
| prompt_text | text | prompt final |
| prompt_context | jsonb | contexto estructurado |
| response_text | text nullable | texto final |
| response_json | jsonb nullable | objeto normalizado |
| token_usage_json | jsonb nullable | input/output tokens |
| latency_ms | integer nullable | |
| error_message | text nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| completed_at | timestamptz nullable | |

#### node_revisions

Versionado editorial ligero para proteger trabajo manual y colaboración.[file:18][file:19]

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| node_id | uuid fk map_nodes.id | |
| map_id | uuid fk mind_maps.id | |
| version_number | integer | |
| title | text | snapshot |
| short_summary | text nullable | |
| content_markdown | text nullable | |
| generation_mode | text | |
| editorial_status | text | |
| created_by | uuid fk users.id | |
| source_task_id | uuid nullable | generation or manual save |
| created_at | timestamptz | |

#### domain_events

Bitácora mínima de eventos importantes.

| Columna | Tipo | Notas |
|---|---|---|
| id | uuid pk | |
| aggregate_type | text | map, node, edge, collaborator, interview |
| aggregate_id | uuid | |
| map_id | uuid nullable | |
| actor_user_id | uuid nullable | |
| event_type | text | node.created, node.content.generated, map.shared, etc. |
| payload_json | jsonb | |
| created_at | timestamptz | |

## Relaciones principales

| Relación | Tipo |
|---|---|
| users -> mind_maps | 1:N |
| mind_maps -> map_nodes | 1:N |
| mind_maps -> map_edges | 1:N |
| mind_maps -> map_collaborators | 1:N |
| mind_maps -> research_tasks | 1:N |
| mind_maps -> generation_tasks | 1:N |
| map_nodes -> node_sources | 1:N |
| map_nodes -> node_revisions | 1:N |
| map_nodes -> map_nodes | 1:N opcional por parent |
| map_nodes -> map_edges | N:N materializada mediante map_edges |

## Autorización y permisos

La autorización no debe vivir dispersa en componentes o routes. Debe existir un servicio explícito `PermissionEvaluator` con reglas por recurso y acción.[file:18][file:19]

### Acciones de dominio sugeridas

- `map.read`
- `map.update`
- `map.delete`
- `map.share`
- `map.manage_collaborators`
- `node.create`
- `node.update`
- `node.delete`
- `edge.create`
- `edge.delete`
- `research.run`
- `generation.run`

### Matriz mínima de permisos

| Rol | Leer mapa | Editar nodos | Gestionar colaboradores | Compartir | Ejecutar IA |
|---|---|---|---|---|---|
| owner | Sí | Sí | Sí | Sí | Sí |
| editor | Sí | Sí | No | No | Sí |
| commenter | Sí | No | No | No | No |
| viewer | Sí | No | No | No | No |

Regla crítica: el owner no debe depender de la tabla `map_collaborators` para sus permisos; su autorización deriva del `owner_id` del mapa.

## Concurrencia y sincronización

Las specs ya anticipan conflicto, offline queue y colaboración, por lo que la implementación no debe quedarse en simple autosave local.[file:17][file:19]

### Estrategia recomendada

1. **Optimistic concurrency** en `map_nodes` y `map_edges` usando columna `version`.[file:19]
2. Cada mutación envía `expectedVersion`.
3. Si la versión actual no coincide, responder `409 Conflict`.
4. El cliente decide entre recargar, fusionar o sobrescribir según tipo de cambio.
5. Crear revisiones editoriales al guardar contenido de nodo, especialmente si proviene de edición manual.

### Tiempo real

Se recomienda tiempo real ligero, no coedición textual completa en la primera versión:

- presencia de usuarios por mapa;
- evento de “nodo siendo editado”; 
- refresco de cambios relevantes del grafo;
- notificación de nuevas fuentes o generaciones completadas.

No se recomienda implementar CRDT para contenido rico en la primera versión. Con versionado optimista + revisiones + presencia ya se cubre gran parte del valor con menor complejidad.

## Diseño de servicios de aplicación

### Maps

- `CreateMapFromInterviewUseCase`
- `CreateEmptyMapUseCase`
- `UpdateMapMetadataUseCase`
- `ArchiveMapUseCase`
- `DuplicateMapUseCase`
- `GetMapWorkspaceUseCase`
- `ListUserMapsUseCase`

### Nodes

- `CreateNodeUseCase`
- `UpdateNodeContentUseCase`
- `UpdateNodeMetadataUseCase`
- `MoveNodeUseCase`
- `DeleteNodeUseCase`
- `DuplicateNodeUseCase`
- `CollapseNodeUseCase`
- `RestoreNodeRevisionUseCase`

### Edges

- `CreateEdgeUseCase`
- `DeleteEdgeUseCase`
- `RelabelEdgeUseCase`

### Interview

- `StartInterviewSessionUseCase`
- `AppendInterviewMessageUseCase`
- `CompleteInterviewSessionUseCase`
- `MaterializeInterviewIntoMapUseCase`

### Research

- `StartResearchTaskUseCase`
- `PollResearchTaskUseCase`
- `AttachResearchSourcesToNodeUseCase`

### Generation

- `GenerateInitialMapUseCase`
- `GenerateNodeContentUseCase`
- `ExpandNodeWithAIUseCase`
- `GenerateStudyQuestionsUseCase`
- `RewriteNodeContentUseCase`

### Collaboration

- `InviteCollaboratorUseCase`
- `ChangeCollaboratorRoleUseCase`
- `RemoveCollaboratorUseCase`
- `CreateShareLinkUseCase`
- `RevokeShareLinkUseCase`

## Interfaces recomendadas

### Repositorios

```ts
interface MapRepository {
  create(input: CreateMapRecord): Promise<MindMap>;
  findById(id: string): Promise<MindMap | null>;
  findAccessibleMap(mapId: string, userId: string): Promise<MindMapAccessView | null>;
  update(input: UpdateMapRecord): Promise<MindMap>;
}

interface NodeRepository {
  create(input: CreateNodeRecord): Promise<Node>;
  findById(id: string): Promise<Node | null>;
  listByMapId(mapId: string): Promise<Node[]>;
  updateContent(input: UpdateNodeContentRecord): Promise<Node>;
  updatePosition(input: UpdateNodePositionRecord): Promise<Node>;
  softDelete(input: DeleteNodeRecord): Promise<void>;
}

interface EdgeRepository {
  create(input: CreateEdgeRecord): Promise<Edge>;
  delete(id: string): Promise<void>;
  listByMapId(mapId: string): Promise<Edge[]>;
}
```

### Providers

```ts
interface CurrentUserProvider {
  getCurrentUser(): Promise<AuthenticatedUser | null>;
}

interface PermissionEvaluator {
  ensureCan(userId: string, action: DomainAction, resource: ResourceRef): Promise<void>;
}

interface ResearchProvider {
  startResearch(input: StartResearchInput): Promise<ResearchProviderTask>;
  getResearchResult(taskId: string): Promise<ResearchProviderResult>;
}

interface TextGenerationProvider {
  generateText(input: GenerateTextInput): Promise<GenerateTextOutput>;
  generateObject<T>(input: GenerateObjectInput<T>): Promise<T>;
  streamText(input: StreamTextInput): Promise<ReadableStream>;
}
```

Estas interfaces permiten sustituir Exa por otro proveedor, o OpenRouter por otro backend de modelos, sin romper los casos de uso.

## Flujo de creación del mapa mediante entrevista

1. Usuario autenticado inicia sesión de entrevista.[file:18][file:17]
2. `StartInterviewSessionUseCase` crea `interview_sessions` con estado `draft`.[file:18]
3. El chat usa Vercel AI SDK con el prompt de entrevistador y mantiene el transcript normalizado.[file:17][file:18]
4. Al completarse, `CompleteInterviewSessionUseCase` consolida `topic`, `objective`, `knowledge_level`, `audience` y `depth_preference`.[file:17][file:18]
5. `CreateMapFromInterviewUseCase` crea `mind_maps`, nodo raíz y primer `generation_task`.
6. `GenerateInitialMapUseCase` produce estructura inicial de nodos y edges.
7. El resultado se persiste transaccionalmente en tablas relacionales.
8. El usuario entra al editor con canvas hidratado.

## Flujo de expansión de nodo con IA

1. Usuario selecciona nodo y pulsa expandir.[file:17]
2. `PermissionEvaluator` valida `generation.run` y `node.update`.
3. `ExpandNodeWithAIUseCase` construye contexto con mapa, nodo padre, hermanos y objetivo pedagógico.[file:17][file:18]
4. Se crea `generation_tasks` en estado `running`.
5. El proveedor devuelve subnodos estructurados.
6. El caso de uso valida tipos, normaliza datos y persiste nodos + edges en una transacción.
7. Se registra `domain_event` y se actualiza `child_count`.
8. El cliente sincroniza el store de Zustand y anima la inserción visual.[file:17]

## Flujo de generación de contenido pedagógico por nodo

1. Usuario solicita generar contenido para un nodo.[file:17][file:18]
2. Se construye prompt contextual con nodo, mapa, parent, siblings y objetivo pedagógico.[file:17]
3. Se inicia `generation_task` con provider OpenRouter mediante Vercel AI SDK.[file:18][file:17]
4. El streaming llega al panel de detalle.
5. Al finalizar, `UpdateNodeContentUseCase` guarda el contenido, incrementa `version`, crea `node_revision` y registra metadata de generación.
6. Si hay conflicto de versión, se responde con `409` y opción de recargar o guardar como nueva revisión.[file:19]

## Flujo de investigación con Exa

1. Usuario dispara investigación sobre mapa o nodo.[file:18][file:17]
2. `StartResearchTaskUseCase` crea `research_tasks` con query contextual.[file:18]
3. Un adaptador Exa ejecuta la búsqueda y guarda resultado bruto + normalizado.[file:17]
4. El usuario revisa resultados antes de convertirlos en contenido.
5. Las fuentes aceptadas se guardan en `node_sources`.
6. Opcionalmente, una generación posterior usa esas fuentes como contexto pedagógico.[file:18]

## API surface recomendada

### Rutas de lectura

- `GET /api/maps`
- `GET /api/maps/:mapId`
- `GET /api/maps/:mapId/workspace`
- `GET /api/maps/:mapId/nodes/:nodeId`
- `GET /api/maps/:mapId/research/:taskId`
- `GET /api/maps/:mapId/generation/:taskId`

### Rutas de escritura

- `POST /api/maps`
- `PATCH /api/maps/:mapId`
- `POST /api/maps/:mapId/nodes`
- `PATCH /api/maps/:mapId/nodes/:nodeId/content`
- `PATCH /api/maps/:mapId/nodes/:nodeId/position`
- `DELETE /api/maps/:mapId/nodes/:nodeId`
- `POST /api/maps/:mapId/edges`
- `DELETE /api/maps/:mapId/edges/:edgeId`
- `POST /api/interviews`
- `POST /api/interviews/:sessionId/messages`
- `POST /api/interviews/:sessionId/materialize`
- `POST /api/maps/:mapId/nodes/:nodeId/generate`
- `POST /api/maps/:mapId/nodes/:nodeId/expand`
- `POST /api/maps/:mapId/nodes/:nodeId/research`
- `POST /api/maps/:mapId/collaborators`
- `PATCH /api/maps/:mapId/collaborators/:collaboratorId`
- `DELETE /api/maps/:mapId/collaborators/:collaboratorId`
- `POST /api/maps/:mapId/share-links`
- `DELETE /api/maps/:mapId/share-links/:shareLinkId`

## Store strategy con Zustand

Las specs proponen Zustand para canvas, UI y entrevista, lo cual es correcto si se mantiene el store limitado a estado efímero y de interacción.[file:17][file:19]

### Stores recomendados

- `useCanvasStore`: nodes renderizables, edges renderizables, selección, dragging, minimap, viewport local.
- `useDraftStore`: drafts de edición de contenido por nodo, flags dirty, autosave local.
- `useUIStore`: sidebars, dialogs, toasts, slash menu, modales.
- `useInterviewStore`: sesión de entrevista en curso.
- `usePresenceStore`: usuarios presentes y locks suaves de edición.

Regla de diseño: ningún store debe contener reglas de negocio complejas. La lógica de negocio vive en casos de uso o hooks adaptadores que llaman a la capa de aplicación.

## Estrategia de persistencia del canvas

La mejor separación es esta:

| Tipo de estado | Persistencia |
|---|---|
| Posiciones de nodos | Compartida por mapa |
| Edges | Compartida por mapa |
| Viewport | Por usuario + mapa |
| Selección actual | Solo cliente o por usuario si se desea restauración |
| Draft de contenido aún no guardado | Cliente temporal + autosave |
| Colapso de nodo | Compartido por mapa o por usuario, decidir una vez y mantener consistencia |

Recomendación: `is_collapsed` debe ser compartido por mapa si representa estructura, mientras panel abierto/cerrado y viewport deben ser por usuario.

## Validaciones de dominio críticas

### Maps

- Título obligatorio.
- `owner_id` inmutable tras creación.
- `visibility` solo puede transicionar mediante casos de uso autorizados.

### Nodes

- Un nodo solo puede pertenecer a un mapa.
- `parent_node_id`, si existe, debe pertenecer al mismo mapa.
- No permitir mover un nodo bajo uno de sus descendientes.
- Un nodo `root` debe ser único por mapa.
- No permitir que `source` o `question` se expandan si esa es la regla de producto activa.[file:17]

### Edges

- Source y target deben pertenecer al mismo mapa.
- Evitar duplicados exactos por tipo.
- Validar que un edge estructural no rompa invariantes básicas del árbol primario si usas `parent_node_id` como jerarquía principal.

### Collaboration

- No permitir remover el último owner; idealmente solo existe uno en v1.
- Un editor no puede invitar ni cambiar roles.
- Share links no otorgan permisos de escritura en v1.

## Estrategia de testing

### Dominio

- Tests unitarios de validaciones de nodos, edges y permisos.

### Aplicación

- Tests de casos de uso con repositorios fake.
- Tests de conflicto de versión.
- Tests de autorización por rol.

### Infraestructura

- Tests de repositorios Drizzle contra DB de prueba.
- Tests de adaptadores Exa/OpenRouter con mocks o sandbox.

### Presentación

- Tests de componentes clave: canvas shell, detail panel, interview chat.
- E2E de flujos críticos: crear mapa, expandir nodo, generar contenido, compartir mapa.

## Observabilidad mínima

El producto necesita visibilidad operativa desde el inicio aunque no sea una plataforma enterprise todavía.[file:18]

Registrar como mínimo:

- errores por provider de IA;
- latencia por generación;
- latencia por investigación;
- frecuencia de conflictos de versión;
- número de mapas creados;
- número de nodos generados vs manuales;
- uso de compartir y colaboración.

## Secuencia recomendada de implementación

### Etapa 1. Fundaciones

- Bootstrap Next.js, Clerk, Drizzle y PostgreSQL.[file:18]
- Crear schema base: users, mind_maps, map_nodes, map_edges.
- Implementar `CurrentUserProvider`, `PermissionEvaluator` y repositorios base.
- Configurar layout shell del dashboard.[file:17]

### Etapa 2. Editor base del mapa

- React Flow + Zustand.[file:18][file:17]
- Carga e hidratación de mapa.
- Crear, mover, editar y eliminar nodos.
- Crear y eliminar edges.
- Autosave + optimistic concurrency básico.

### Etapa 3. Entrevista y creación inicial

- `interview_sessions`.
- Chat inicial con Vercel AI SDK y OpenRouter.[file:18][file:17]
- Materialización del interview briefing a mapa inicial.
- Generación de nodo raíz y subnodos básicos.

### Etapa 4. Generación pedagógica por nodo

- `generation_tasks`.
- Streaming al panel de detalle.[file:17]
- Versionado y revisiones de nodo.
- Generación de preguntas y expansión de ramas.

### Etapa 5. Investigación y fuentes

- `research_tasks` + `node_sources`.[file:18][file:17]
- Integración Exa.
- Asociación de resultados y reutilización como contexto.

### Etapa 6. Colaboración y compartición

- `map_collaborators`, `map_share_links`.[file:18]
- Roles y políticas de autorización.
- Presencia básica y sincronización ligera.[file:19]

### Etapa 7. Hardening

- observabilidad;
- performance del canvas;
- manejo de conflictos 409;
- recuperación ante fallos;
- archivado, duplicado y refinamiento UX.

## Decisiones explícitas para reducir ambigüedad

1. La fuente editable principal del nodo será `content_markdown`.
2. `content_json` será opcional y no bloquea la primera versión.
3. `map_nodes` y `map_edges` son la fuente de verdad del grafo; React Flow es solo representación.
4. El viewport se guarda por usuario en `map_views`.
5. La coedición de texto en tiempo real no forma parte de la primera versión.
6. La autorización se resuelve en capa de aplicación, no en componentes.
7. Investigación y generación se almacenan en tablas separadas.
8. Todo cambio importante de contenido crea `node_revision`.
9. La entrevista inicial persiste como entidad reutilizable.
10. El sistema debe poder operar con un único owner por mapa en v1.

## Resultado esperado de la implementación

Al finalizar este plan, el producto debe poder:

- autenticar usuarios y aislar sus datos de manera estricta;[file:18]
- crear mapas desde entrevista o desde un inicio más directo;[file:18][file:17]
- persistir grafos complejos con nodos, edges, layout y contenido pedagógico;[file:18]
- generar contenido y subnodos con trazabilidad completa;[file:18][file:17]
- ejecutar investigación contextual con Exa y asociar fuentes;[file:18][file:17]
- soportar colaboración con roles claros;[file:18][file:19]
- mantener una arquitectura limpia y extensible alineada con SRP y SOLID.[file:18][file:19]
