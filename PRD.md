# PRD — Plataforma de mapas mentales con investigación pedagógica asistida por IA

## 1. Visión del producto

Esta plataforma permite transformar una idea, pregunta o tópico de investigación en un **mapa mental vivo**, editable y enriquecido con contenido pedagógico generado por IA. El objetivo no es solo visualizar conceptos, sino convertir cada nodo del mapa en una unidad de estudio con contexto, explicaciones, conexiones, fuentes, síntesis y profundidad didáctica.

El producto está fuertemente inspirado en NotebookLM por su enfoque de investigación asistida, síntesis y estudio guiado, pero se diferencia al poner el **mapa mental** en el centro de la experiencia. En lugar de que el contenido sea únicamente lineal o documental, el conocimiento se organiza espacialmente en nodos y relaciones, permitiendo explorar un tema de manera jerárquica, asociativa y progresiva.

La aplicación debe servir tanto a estudiantes autodidactas como a profesionales, docentes, creadores de cursos e investigadores que necesitan descomponer un tema complejo, comprenderlo por partes, profundizar subtemas y conservar ese conocimiento de forma privada, estructurada y reutilizable.

## 2. Propósito del documento

Este PRD define con claridad la esencia del producto, su propuesta de valor, arquitectura conceptual, capacidades funcionales, restricciones, modelo de datos de alto nivel y stack tecnológico recomendado. Está pensado para ser entendido por humanos y también por agentes de IA que necesiten razonar sobre el producto, generar documentación complementaria o participar en su construcción.

Este documento **no** incluye planificación de implementación, cronogramas, fases, estimaciones, roadmap, TODOs ni desglose de tareas. Esos artefactos deberán vivir en documentos separados.

## 3. Problema a resolver

La mayoría de herramientas de notas, investigación o mapas mentales resuelven solo una parte del problema:

- Los mapas mentales suelen ser buenos para organizar ideas, pero pobres para desarrollar contenido profundo.
- Las herramientas de IA suelen generar texto extenso, pero no ayudan a estructurarlo visualmente en un grafo navegable.
- Las plataformas de estudio priorizan documentos o chat, pero no una representación espacial del conocimiento.
- Las experiencias colaborativas suelen existir, pero no siempre con privacidad, control por usuario y generación contextual por nodo.

Esto genera una fricción importante: el usuario investiga en una herramienta, organiza en otra, redacta en otra y comparte en otra. El resultado es un flujo fragmentado donde el conocimiento se dispersa.

La oportunidad del producto es unificar en una sola experiencia:

1. **Exploración visual** del conocimiento mediante mapas mentales.
2. **Generación asistida** de contenido académico/pedagógico por nodo.
3. **Edición manual completa** para que el usuario mantenga control editorial.
4. **Persistencia privada** por usuario con opciones de compartir y colaborar.
5. **Profundización progresiva** desde una idea central hacia subtemas cada vez más específicos.

## 4. Propuesta de valor

La plataforma permite que cualquier tema se convierta en una estructura de aprendizaje navegable.

Propuesta central:

- Partir de una idea inicial.
- Generar un mapa mental inicial con nodos relevantes.
- Expandir el grafo añadiendo nodos, temas o subtemas en cualquier momento según el criterio del usuario.
- Expandir cada nodo con investigación asistida por IA.
- Redactar contenido pedagógico claro, útil y acumulativo.
- Guardar todo en una base de datos de forma privada.
- Compartir el mapa o colaborar con otros usuarios cuando sea necesario.

La experiencia ideal es que el usuario sienta que está construyendo una **biblioteca de estudio visual**: cada mapa es un dominio de conocimiento, cada nodo es una cápsula pedagógica, y cada conexión representa una relación intelectual significativa.

## 5. Principios del producto

### 5.1 Mapa primero

El centro del producto es el grafo visual. El contenido textual, las investigaciones, las referencias y los resúmenes orbitan alrededor de los nodos y relaciones del mapa.

### 5.2 Pedagogía antes que verbosidad

La IA no debe producir solo texto largo. Debe producir contenido con intención didáctica: definiciones claras, explicaciones por niveles, ejemplos, analogías cuando aporten valor, relaciones entre conceptos, preguntas guía y síntesis útiles para estudiar.

### 5.3 Control editorial del usuario

El usuario puede crear, editar, mover, conectar, eliminar, fusionar o reescribir nodos manualmente. La IA es copiloto, no dueña del contenido.

### 5.4 Investigación contextual

Cada generación debe estar anclada al nodo actual, su posición en el árbol/grafo, el tema raíz, el contexto de nodos vecinos y el objetivo pedagógico del mapa.

### 5.5 Privacidad por defecto

Todo mapa pertenece a un usuario y es privado por defecto. Compartir, publicar o colaborar son capacidades explícitas, no comportamientos implícitos.

### 5.6 Persistencia estructurada

El valor del producto está en conservar no solo el texto final, sino también la estructura del mapa, su historial relevante, sus relaciones, su metadata y sus resultados de investigación.

## 6. Usuarios objetivo

### 6.1 Usuario principal

Persona que desea estudiar o investigar un tema de manera profunda y estructurada:

- Estudiantes.
- Docentes.
- Creadores de cursos.
- Profesionales técnicos.
- Investigadores autodidactas.
- Equipos que exploran dominios complejos.

### 6.2 Usuario secundario

Persona que necesita organizar conocimiento para compartirlo con otros:

- Mentores.
- Equipos de producto o ingeniería.
- Creadores de documentación.
- Equipos educativos.
- Colaboradores en procesos de aprendizaje o investigación.

## 7. Casos de uso principales

### 7.1 Iniciar un mapa mediante entrevista conversacional

El usuario comienza en un chat con un agente de IA que funciona como entrevistador profesional. El agente formula preguntas específicas para entender el tema, el objetivo, el nivel de conocimiento del usuario, el propósito del mapa (estudiar, enseñar, investigar, documentar) y el alcance esperado. Las respuestas del usuario alimentan el contexto que se utilizará para las subsiguientes investigaciones y generaciones.

### 7.2 Crear un mapa a partir de una idea

El usuario introduce un tema inicial como "bases de datos distribuidas", "teoría del color", "arquitectura hexagonal" o "revolución francesa". La aplicación genera un nodo raíz y propone una primera estructura de subtemas. A partir de ahí, el usuario puede añadir nodos, temas o subtemas adicionales en cualquier momento para expandir el grafo según su criterio.

### 7.3 Expandir un nodo con investigación asistida

El usuario selecciona un nodo y solicita una investigación profunda. La plataforma consulta un motor externo de investigación y genera contenido pedagógico y/o propone nuevos subnodos relacionados.

### 7.4 Redactar manualmente el contenido de un nodo

El usuario decide no usar IA o combinarla con edición humana. Puede escribir definiciones, notas, resúmenes, ejemplos, preguntas o referencias directamente.

### 7.5 Reorganizar el conocimiento visualmente

El usuario mueve nodos, cambia jerarquías, reconecta relaciones, crea clusters temáticos y convierte el mapa en una representación más clara de su entendimiento.

### 7.6 Compartir o colaborar

El propietario comparte un mapa en modo solo lectura o invita colaboradores con permisos de edición.

### 7.7 Usar el mapa como fuente de estudio

El usuario recorre el mapa como material de aprendizaje: lee nodos, sigue relaciones, contrae/expande ramas y utiliza el contenido como guía estructurada de estudio.

## 8. Objetivo del producto

Permitir que un usuario convierta un tema complejo en una red de conocimiento editable, investigable y pedagógicamente útil, almacenada de forma persistente y privada, con capacidades opcionales de colaboración y compartición.

## 9. No objetivos del documento

Este PRD no cubre:

- Plan de sprints.
- Tiempos de entrega.
- Fases de implementación.
- Historias técnicas detalladas para desarrollo.
- Estrategia de deployment paso a paso.
- Backlog de tareas.
- Plan QA.
- Métricas de negocio definitivas.
- Estrategia de pricing.

## 10. Experiencia núcleo

La experiencia núcleo debe seguir esta lógica:

1. El usuario inicia con un chat conversacional con un agente de IA especializado.
2. El agente funciona como un entrevistador profesional, realizando preguntas precisas para comprender el objetivo real del usuario, su nivel de conocimiento, el propósito del mapa y el alcance esperado.
3. A partir de las respuestas del usuario, el sistema construye un perfil de intención y selecciona el enfoque pedagógico adecuado.
4. Con ese contexto enriquecido, el sistema genera un mapa mental inicial con nodos relevantes y un contenido base fundamentado en la investigación realizada.
5. El usuario explora el grafo en una interfaz fluida.
6. Cada nodo puede contener contenido redactado manualmente o generado por IA.
7. El usuario puede solicitar investigaciones adicionales por nodo o subárbol.
8. El usuario puede añadir nodos, temas o subtemas en cualquier momento para expandir el grafo según su criterio.
9. El contenido generado se presenta con enfoque pedagógico y organizado.
10. Todo se guarda automáticamente en la base de datos.
11. El mapa permanece privado salvo que el usuario decida compartirlo.
12. El usuario puede invitar colaboradores o compartir una vista pública/privada controlada.

## 11. Capacidades funcionales

### 11.1 Gestión de mapas mentales

El sistema debe permitir:

- Crear mapas mentales.
- Renombrar mapas.
- Describir el propósito de un mapa.
- Definir tema raíz o idea principal.
- Guardar estado de viewport y disposición visual.
- Eliminar o archivar mapas.
- Duplicar mapas.

### 11.2 Edición del grafo

El sistema debe permitir:

- Crear nodos manualmente en cualquier momento para expandir el grafo.
- Editar título, tipo y contenido del nodo.
- Arrastrar nodos libremente en el canvas.
- Conectar nodos con edges.
- Eliminar nodos y relaciones.
- Reubicar nodos dentro de la estructura conceptual.
- Crear nodos hijos, hermanos o relacionados.
- Colapsar y expandir ramas si el producto lo requiere a nivel de UX.
- Guardar metadata visual del canvas.

### 11.3 Contenido del nodo

Cada nodo debe poder contener al menos:

- Título.
- Resumen corto.
- Contenido desarrollado.
- Objetivo pedagógico.
- Nivel de profundidad o dificultad.
- Estado de edición (manual, generado, mixto).
- Referencias o fuentes asociadas.
- Timestamp de actualización.
- Metadata de IA asociada a la última generación.

### 11.4 Generación asistida por IA

El sistema debe permitir:

- Generar mapa inicial desde un tema.
- Generar contenido de un nodo específico.
- Generar subnodos sugeridos.
- Expandir una rama completa.
- Regenerar contenido con otro enfoque.
- Elegir entre escritura manual o generación asistida.
- Mantener trazabilidad del origen del contenido cuando aplique.

### 11.5 Investigación externa

La integración con Exa.ai debe permitir, de forma conceptual:

- Investigar un tema o subtema a partir de instrucciones contextuales.
- Recuperar información útil para enriquecer nodos.
- Obtener resultados suficientemente estructurados para convertirlos en contenido didáctico.
- Asociar fuentes o artefactos de investigación a un nodo.
- Ejecutar investigaciones asincrónicas si la operación es larga.

### 11.6 Privacidad, acceso y colaboración

El sistema debe soportar:

- Mapas privados por defecto.
- Ownership claro por usuario.
- Compartición mediante enlaces o invitaciones.
- Colaboradores con roles.
- Restricciones de acceso por mapa.
- Separación estricta de datos entre usuarios.

### 11.7 Persistencia y recuperación

El sistema debe garantizar:

- Almacenamiento persistente de mapas, nodos, relaciones y contenido.
- Recuperación íntegra del estado del mapa.
- Rehidratación del canvas con posiciones y viewport.
- Lectura eficiente del mapa completo y de sus nodos relacionados.

### 11.8 Agente de entrevista conversacional

El sistema debe proporcionar un agente de IA que funcione como entrevistador profesional antes de generar el mapa inicial:

- Mantener una conversación en lenguaje natural con el usuario.
- Realizar preguntas precisas sobre el tema, objetivo, nivel de conocimiento, propósito del mapa y alcance esperado.
- Construir un perfil de intención a partir de las respuestas.
- Transferir ese contexto enriquecido a la generación del mapa y las investigaciones subsiguientes.
- Permitir que el usuario responda en cualquier momento sin perder el hilo de la conversación.
- Soportar tanto flujo completo de entrevista como opción de saltar la entrevista e introducir el tema directamente.
- Utilizar Vercel AI SDK con OpenRouter como proveedor para gestionar la conversación y la construcción del contexto.

## 12. Enfoque pedagógico del contenido

Este punto es esencial para diferenciar el producto.

La generación de contenido no debe parecer una simple respuesta de chat. Cada nodo debe poder transformarse en una unidad de aprendizaje clara. La IA debe redactar con una estructura pedagógica consistente, por ejemplo:

- Qué es el concepto.
- Por qué importa.
- Cómo se relaciona con el nodo padre.
- Qué subideas lo componen.
- Ejemplo o caso de uso.
- Errores comunes o malentendidos frecuentes.
- Preguntas de estudio o reflexión.
- Resumen breve para repaso.

El sistema debe favorecer contenidos útiles para:

- Comprender.
- Enseñar.
- Repasar.
- Profundizar.
- Navegar entre niveles de abstracción.

## 13. Entidades conceptuales del dominio

### 13.1 Workspace personal

Representa el espacio privado del usuario autenticado. Puede contener múltiples mapas.

### 13.2 Mind map

Es la unidad principal del producto. Contiene el tema raíz, metadata general, permisos, colaboradores y la red de nodos.

### 13.3 Node

Es la unidad pedagógica y visual principal. Tiene contenido, posición, relaciones y contexto.

### 13.4 Edge

Representa la relación entre dos nodos. Puede ser estructural, temática, causal, comparativa u otra categoría futura.

### 13.5 Research task

Representa una investigación generada por el sistema sobre un nodo o mapa. Puede ser asincrónica y conservar estado, input, output y fuentes.

### 13.6 Source reference

Representa una referencia, resultado externo o evidencia utilizada para enriquecer un nodo.

### 13.7 Collaboration membership

Representa la relación entre un mapa y un usuario invitado, junto con su rol.

## 14. Requisitos funcionales de alto nivel

### 14.1 Mapas

- Un usuario autenticado puede crear múltiples mapas.
- Cada mapa tiene un propietario.
- Cada mapa puede ser privado o compartido.
- Cada mapa debe poder cargarse con su estado visual completo.

### 14.2 Nodos

- Un nodo pertenece a un mapa.
- Un nodo puede existir sin contenido desarrollado al inicio.
- Un nodo puede contener contenido manual, generado o mixto.
- Un nodo debe poder actualizarse sin romper su identidad visual ni sus relaciones.

### 14.3 Relaciones

- Las relaciones deben persistirse como entidades explícitas.
- El sistema debe soportar múltiples conexiones entre nodos dentro del mismo mapa.
- Las relaciones no deben depender únicamente de una estructura de árbol; el producto debe permitir comportamiento de grafo.

### 14.4 Investigación

- Una investigación debe poder dispararse desde un nodo o desde el mapa raíz.
- Su resultado debe vincularse al contexto exacto desde el que nació.
- Debe ser posible reutilizar o transformar el resultado en contenido del nodo.

### 14.5 Seguridad

- Todo acceso debe resolverse por autenticación y autorización.
- Los datos de un usuario no deben ser visibles para otro salvo por permisos explícitos.
- Toda mutación debe validar ownership o rol de colaboración.

## 15. Requisitos no funcionales

### 15.1 Rendimiento percibido

La navegación del canvas debe sentirse fluida aun con mapas medianos o grandes. La edición de nodos, drag & drop y zoom/pan no deben degradarse de forma evidente.

### 15.2 Escalabilidad conceptual

El producto debe poder evolucionar desde mapas simples hacia grafos complejos, múltiples tipos de nodo, mejores permisos, historial y capacidades avanzadas de investigación.

### 15.3 Consistencia de datos

La estructura del mapa y su contenido deben conservar consistencia incluso si existen sesiones concurrentes, colaboradores o investigaciones asíncronas.

### 15.4 Privacidad

El diseño del sistema debe asumir aislamiento por usuario desde la base del modelo de datos y la autorización.

### 15.5 Auditabilidad mínima

Sin convertir este PRD en una especificación de observabilidad, sí conviene prever entidades y metadata suficientes para rastrear quién creó o modificó mapas, nodos e investigaciones relevantes.

## 16. UX conceptual

### 16.1 Tres superficies principales

La experiencia del producto gira alrededor de tres superficies coordinadas:

- **Chat de entrevista** para iniciar el contexto mediante conversación con el agente.
- **Canvas visual** para el mapa mental.
- **Panel de detalle** para leer, editar o generar contenido del nodo seleccionado.

### 16.2 Flujo de inicio

La experiencia de inicio prioriza la entrevista conversacional:

1. El usuario accede a la aplicación y selecciona crear un nuevo mapa.
2. En lugar de introducir un tema directamente, entra en un chat con el agente entrevistador.
3. El agente formula preguntas progresivas para comprender el objetivo, nivel y alcance.
4. Una vez completada la entrevista, el sistema genera el mapa con el contexto enriquecido.
5. El usuario transiciona al canvas visual para explorar y editar el mapa generado.

### 16.3 Modo de trabajo

La UX debe favorecer ciclos rápidos de:

- Seleccionar nodo.
- Leer contexto.
- Editar o generar contenido.
- Crear nuevos subnodos.
- Reorganizar el mapa.
- Guardar automáticamente.

### 16.4 Relación entre mapa y contenido

El mapa no es solo navegación; es también estructura semántica. La selección de un nodo debe influir claramente en el contenido, las acciones disponibles y el contexto que recibe la IA.

### 16.5 Sensación de producto

La aplicación debe sentirse como una herramienta de pensamiento y estudio, no como un simple editor de diagramas. La prioridad visual y funcional debe estar en la claridad, el foco y la profundidad del conocimiento.

## 17. Stack tecnológico recomendado

La selección tecnológica debe favorecer productividad, tipado fuerte, buen DX, componentes modernos y una base robusta para auth, persistencia y canvas interactivo.

| Capa | Tecnología recomendada | Justificación |
|---|---|---|
| Frontend / Fullstack | Next.js | Buen encaje para aplicaciones modernas con React, rutas de aplicación, server actions y rendering híbrido. Clerk y Neon documentan integraciones específicas con Next.js y Drizzle ORM.[web:1][web:2] |
| UI de grafo | React Flow | Está diseñado para nodos y edges interactivos, y su documentación recomienda usar Zustand cuando el grafo crece y se requiere modificar estado desde nodos o componentes distribuidos.[page:1] |
| Estado cliente | Zustand | React Flow tiene una guía oficial usando Zustand para centralizar nodes, edges y acciones como cambios o conexiones, lo que encaja con un editor de mapas mentales persistente.[page:1] |
| Autenticación | Clerk | Clerk ofrece guías concretas para integrarse con Next.js y Neon, protegiendo rutas y usando el user ID autenticado en la capa de datos.[web:1][web:2] |
| ORM | Drizzle ORM | Está presente en las guías de Clerk + Neon para definir schema y operar PostgreSQL con tipado fuerte dentro de Next.js.[web:1] |
| Base de datos | Neon Postgres o PostgreSQL | Neon ofrece una ruta directa documentada para Next.js + Clerk + Drizzle; PostgreSQL estándar mantiene portabilidad si más adelante se migra fuera de Neon.[web:1][web:2] |
| Investigación externa | Exa.ai | Exa expone endpoints para investigaciones asíncronas y recuperación del estado/resultados de tareas de research, útiles para enriquecer nodos sin bloquear la interfaz.[web:4] |
| IA generativa | Vercel AI SDK | Proporciona una capa unificada para generación de contenido, herramientas y agentes de IA. Soporta OpenRouter como proveedor, facilitando la creación de flujos de generación contextual por nodo con trazabilidad y streaming. |
| Proveedor de IA | OpenRouter | Agregador de modelos de IA que permite acceder a múltiples proveedores (Claude, GPT-4, Mistral, etc.) desde una única API. Se utiliza como proveedor detrás de Vercel AI SDK para toda generación de contenido pedagógico. |

## 18. Recomendación técnica principal

La recomendación principal para este producto es:

- **Next.js** como columna vertebral de la aplicación.
- **React Flow** como motor del canvas de mapas mentales.
- **Zustand** como estado cliente del grafo y estado transitorio del editor.
- **Clerk** para autenticación, gestión de sesión y base de autorización.
- **Drizzle ORM** para modelado tipado del dominio.
- **Neon Postgres** como opción inicial por su excelente encaje con Next.js + Clerk + Drizzle.
- **PostgreSQL** como abstracción de base de datos subyacente para mantener independencia conceptual.
- **Vercel AI SDK** como capa unificada para toda integración de IA generativa.
- **OpenRouter** como proveedor de modelos de IA para generación de contenido pedagógico.
- **Exa.ai** para investigación enriquecida por nodo o por mapa.

Esta combinación equilibra velocidad de construcción, claridad arquitectónica, portabilidad razonable y buen alineamiento con la naturaleza interactiva del producto.[web:1][web:2][page:1][web:4]

## 19. Argumento de arquitectura conceptual

### 19.1 Separar estado visual de estado persistido

React Flow trabaja muy bien con nodos y edges interactivos, y su documentación muestra cómo centralizar estos elementos y sus acciones en Zustand para apps que necesitan cambios desde varias partes de la UI.[page:1] En este producto, esa separación es clave porque el canvas necesita velocidad local, mientras que la base de datos debe guardar una representación estable y autorizada del mapa.[page:1]

### 19.2 Autenticación y ownership fuerte

Las guías de Clerk con Neon muestran un enfoque claro donde el ID del usuario autenticado se usa para leer y escribir registros propios en PostgreSQL desde una app Next.js.[web:1][web:2] Ese patrón encaja muy bien con una plataforma donde cada mapa es privado por defecto y toda colaboración debe derivar de permisos explícitos.[web:1][web:2]

### 19.3 Investigación como proceso asíncrono

Exa documenta tareas de research recuperables por ID y con estados de ejecución, lo que favorece tratar la investigación como un job persistible y no como una simple llamada bloqueante de generación.[web:4] Para este producto, eso permite disparar investigaciones profundas por nodo, almacenar resultados y convertirlos después en contenido pedagógico sin comprometer la experiencia del canvas.[web:4]

### 19.4 Generación de contenido con Vercel AI SDK

Vercel AI SDK proporciona una abstracción unificada sobre proveedores de IA, permitiendo crear agentes, herramientas y flujos de generación de forma coherente. Para este producto, el SDK actúa como la capa principal para toda generación de contenido pedagógico por nodo, incluyendo generación del mapa inicial, expansión de ramas, redacción de contenido y reformulación.

OpenRouter se utiliza como proveedor detrás del SDK, ofreciendo acceso a múltiples familias de modelos desde una única API. Esto permite cambiar o combinar modelos según el tipo de contenido requerido sin modificar la lógica de aplicación.

El patrón recomendado es utilizar `generateText` para generaciones simples por nodo y `generateObject` cuando se requiere contenido estructurado (por ejemplo, para autocompletar metadata pedagógica o validar que la generación respeta la plantilla de contenido definida en el sección 25).

La trazabilidad del origen del contenido generado se mantiene mediante la entidad `ResearchTask` o entidades derivadas, almacenando el proveedor utilizado, el modelo, el prompt enviado y la respuesta completa para auditoría y posible regeneración.

## 20. Decisiones de modelado recomendadas

### 20.1 El mapa debe modelarse como grafo persistido

Aunque muchos mapas mentales parten de una estructura jerárquica, este producto debe almacenar explícitamente nodos y relaciones para permitir asociaciones transversales. Un subtema puede conectarse con múltiples conceptos, y esa riqueza conceptual se pierde si el modelo queda reducido a un árbol rígido.

### 20.2 El contenido no debe vivir solo en el canvas

La posición de un nodo y su contenido pedagógico son dimensiones distintas. El canvas debe reflejar el conocimiento, pero la persistencia debe separar claramente layout visual, identidad conceptual y contenido generado/manual.

### 20.3 La investigación debe ser una entidad propia

Una investigación no es solo texto pegado en un nodo. Tiene input, contexto, estado, resultados, posibles fuentes y relación con uno o más nodos. Modelarla como entidad separada evita perder trazabilidad y habilita futuras capacidades.

## 21. Modelo de datos de alto nivel

A nivel conceptual, el dominio puede organizarse así:

### 21.1 User

Representa al usuario autenticado, normalmente enlazado al identificador de Clerk.

Campos conceptuales sugeridos:

- id interno.
- clerkUserId.
- email primaria si se requiere duplicación local.
- nombre y metadata opcional.
- timestamps.

### 21.2 MindMap

Representa el mapa como agregado principal.

Campos conceptuales sugeridos:

- id.
- ownerId.
- title.
- description.
- rootTopic.
- visibility.
- viewportState.
- settings pedagógicos opcionales.
- createdAt / updatedAt.

### 21.3 MindMapNode

Representa un nodo del mapa.

Campos conceptuales sugeridos:

- id.
- mapId.
- parentNodeId opcional para jerarquía primaria.
- title.
- shortSummary.
- content.
- nodeType.
- learningObjective.
- difficultyLevel.
- generationMode.
- positionX.
- positionY.
- visualMetadata JSON.
- createdBy.
- updatedBy.
- createdAt / updatedAt.

### 21.4 MindMapEdge

Representa una relación entre dos nodos.

Campos conceptuales sugeridos:

- id.
- mapId.
- sourceNodeId.
- targetNodeId.
- relationType.
- label opcional.
- metadata JSON.
- createdAt / updatedAt.

### 21.5 ResearchTask

Representa una investigación iniciada desde el sistema.

Campos conceptuales sugeridos:

- id.
- mapId.
- nodeId opcional.
- requestedBy.
- provider.
- promptContext.
- status.
- rawResult.
- normalizedResult.
- createdAt / updatedAt / completedAt.

### 21.6 NodeSource

Representa una fuente asociada a un nodo o investigación.

Campos conceptuales sugeridos:

- id.
- mapId.
- nodeId.
- researchTaskId opcional.
- title.
- url.
- provider.
- snippet.
- metadata JSON.
- createdAt.

### 21.7 MapCollaborator

Representa acceso de terceros a un mapa.

Campos conceptuales sugeridos:

- id.
- mapId.
- userId.
- role.
- invitedBy.
- createdAt.

## 22. Tipos de nodo sugeridos

Aunque no es obligatorio cerrar esto desde el inicio, el PRD puede declarar tipos conceptuales posibles para guiar la evolución del producto:

- Topic raíz.
- Concepto.
- Subtema.
- Pregunta.
- Explicación.
- Ejemplo.
- Comparación.
- Fuente.
- Ejercicio o repaso.
- Insight personal.

Esto ayuda a que humanos y agentes entiendan que no todos los nodos tienen la misma finalidad pedagógica.

## 23. Roles y permisos conceptuales

Roles sugeridos por mapa:

| Rol | Capacidades |
|---|---|
| Owner | Control total del mapa, contenido, permisos y colaboración. |
| Editor | Puede editar nodos, contenido y estructura del mapa. |
| Commenter o reviewer futuro | Puede revisar o comentar sin alterar todo el mapa. |
| Viewer | Solo lectura. |

La autorización debe resolverse por mapa, no únicamente a nivel global de aplicación.

## 24. Flujos conceptuales clave

### 24.1 Crear mapa mediante entrevista

1. Usuario autenticado inicia la creación de un nuevo mapa.
2. El sistema presenta el chat de entrevista con el agente de IA.
3. El agente formula preguntas para comprender el tema, objetivo, nivel y propósito del mapa.
4. El usuario responde a las preguntas del agente.
5. El agente construye un perfil de intención y contexto enriquecido.
6. El sistema genera el mapa inicial con nodos y contenido base fundamentado en la investigación y el contexto recopilado.
7. El mapa se guarda con estado inicial privado.

### 24.2 Profundizar un nodo

1. Usuario selecciona un nodo.
2. Decide editar manualmente o generar investigación.
3. El sistema usa el contexto del nodo y del mapa.
4. Se crea una investigación o una generación contextual.
5. El resultado se transforma en contenido del nodo y/o sugerencia de subnodos.

### 24.4 Compartir un mapa

1. Owner elige compartir.
2. Configura enlace o invitación por usuario.
3. Define rol de acceso.
4. El mapa sigue controlado por permisos explícitos.

## 25. Estructura sugerida del contenido generado por IA

Para mantener consistencia pedagógica, el sistema debe orientar la IA a producir contenido con estructura reconocible. Una plantilla conceptual por nodo podría incluir:

- Definición del concepto.
- Contexto dentro del tema principal.
- Explicación profunda.
- Relación con nodos cercanos.
- Ejemplo práctico o ilustrativo.
- Conceptos relacionados.
- Preguntas para estudiar.
- Resumen breve.

Esto no obliga a una UI concreta, pero sí deja claro que la generación debe ser pedagógica, no meramente enciclopédica.

## 26. Consideraciones sobre investigación con Exa

Exa documenta una capa de research por tareas recuperables, lo que sugiere una integración adecuada para investigaciones que pueden tardar y luego ser consultadas por estado o resultado.[web:4] Además, su documentación de Websets describe búsquedas estructuradas, verificación y enriquecimiento de resultados, lo que encaja con una futura evolución hacia recopilación de fuentes más confiables y normalizadas para nodos complejos.[web:15]

A nivel de producto, Exa debe entenderse como motor de adquisición y enriquecimiento de información, no como la capa final de pedagogía. El resultado bruto de investigación debe pasar por una fase de transformación editorial o generación pedagógica antes de convertirse en contenido del nodo.[web:4][web:15]

## 26.2 Consideraciones sobre generación de contenido con Vercel AI SDK

Vercel AI SDK está diseñado para facilitar la creación de aplicaciones con IA, con soporte nativo para streaming, herramientas y agentes. Su documentación enfatiza el uso de Providers (como OpenRouter) para abstraer la comunicación con modelos de lenguaje, y Hooks como `useChat` o `useCompletion` para integrar generaciones en componentes React de forma reactiva.

Para este producto, las capacidades clave del SDK que deben aprovecharse son:

- **Streaming de respuestas**: Permite mostrar contenido generado progresivamente en el panel del nodo, mejorando la percepción de velocidad y permitiendo al usuario cancelar o redirigir la generación.
- **Herramientas y funciones**: El SDK soporta la definición de herramientas que la IA puede invocar. En este producto, las herramientas pueden representar acciones como crear un subnodo, conectar nodos, consultar Exa o almacenar contenido.
- **Agentes**: El SDK proporciona primitivas para crear agentes que pueden usar herramientas de forma autónoma. Un agente podría encargarse de la expansión automática de ramas del mapa siguiendo el contexto pedagógico.
- **Memoria y contexto**: El SDK permite pasar historial de conversación o contexto estructurado a cada generación, lo que facilita mantener coherencia pedagógica entre nodos relacionados.

El flujo de generación por nodo utilizando Vercel AI SDK sigue este patrón conceptual:

1. El usuario solicita una generación en un nodo específico.
2. Se construye un prompt contextual que incluye: título del nodo, contenido existente, posición en el grafo, tema raíz del mapa y plantilla pedagógica del sección 25.
3. Se invoca `generateText` o `generateObject` a través de OpenRouter usando Vercel AI SDK.
4. El resultado se almacena en la entidad correspondiente (`MindMapNode.content` y `ResearchTask` para trazabilidad).
5. La UI actualiza el panel del nodo con streaming o al completarse.

Este patrón mantiene al usuario en control: toda generación es solicitable bajo demanda, auditable por contexto y editable tras su creación.

## 27. Consideraciones sobre canvas y estado

React Flow describe un comportamiento de viewport inspirado en slippy maps, con pan por arrastre y zoom por scroll o gesto, lo que encaja naturalmente con la exploración de mapas mentales amplios.[page:2] También documenta configuraciones alternativas similares a herramientas de diseño, algo útil si el producto desea acercarse a una UX más tipo Figma en el futuro.[page:2]

Su guía de uso con Zustand enfatiza centralizar `nodes`, `edges` y acciones como cambios, conexiones o actualizaciones dentro de un store, especialmente cuando el estado debe modificarse desde múltiples nodos o componentes.[page:1] Ese enfoque es especialmente apropiado en este producto porque el panel lateral, el canvas, los comandos de IA y la colaboración pueden querer tocar el mismo estado conceptual del mapa.[page:1]

## 28. Estrategia de persistencia recomendada

A nivel conceptual, conviene dividir la persistencia en tres grupos:

- **Dominio principal**: mapas, nodos, edges, colaboradores.
- **Contenido e investigación**: contenido pedagógico, tareas de research, fuentes.
- **Estado visual**: posiciones, viewport, preferencias específicas del mapa.

Esta separación mantiene limpio el modelo mental del producto y ayuda a distinguir qué pertenece a la semántica del conocimiento y qué pertenece a la experiencia visual del editor.

## 29. Riesgos de producto que el PRD debe dejar claros

### 29.1 Riesgo de contenido superficial

Si la IA produce contenido demasiado genérico o verboso, el producto pierde su propuesta pedagógica. El PRD debe enfatizar claridad didáctica, contextualización y profundidad real.

### 29.2 Riesgo de caos visual

Si el mapa crece sin buenos patrones de organización, el usuario puede perder comprensión. El producto debe tratar el mapa como herramienta cognitiva, no solo como lienzo infinito.

### 29.3 Riesgo de mezcla entre dato persistido y estado efímero

Si no se separan bien el estado de React Flow y el modelo persistido, aumentará la complejidad de sincronización, edición y colaboración.

### 29.4 Riesgo de autorización deficiente

Dado que el producto es privado por defecto pero colaborativo opcionalmente, el diseño de permisos es central, no accesorio.

## 30. Métricas conceptuales de éxito del producto

Aunque este documento no define analítica operativa final, sí conviene expresar qué indicaría valor real del producto:

- Usuarios crean mapas que vuelven a visitar.
- Los mapas crecen en profundidad y no se abandonan tras la creación inicial.
- Los nodos generados se editan y reutilizan, señal de que la IA sirve como borrador útil.
- Los usuarios usan el mapa como material de estudio, no solo como experimento visual.
- La compartición y colaboración ocurren sin comprometer la privacidad por defecto.

## 31. Lenguaje recomendado para describir el producto

Para mantener consistencia entre humanos y agentes, el producto puede describirse así:

> Aplicación web de mapas mentales con investigación asistida por IA y enfoque pedagógico. El usuario inicia con un chat conversacional donde un agente de IA realiza preguntas precisas para comprender su objetivo y contexto, para luego generar un mapa mental rico y fundamentado en investigación. Permite expandir nodos con contenido manual o generado, investigar subtemas con fuentes externas, almacenar todo de forma privada por usuario y compartir o colaborar sobre mapas de conocimiento estructurado.

## 32. Síntesis final del producto

Este producto es una plataforma de pensamiento visual y estudio profundo. Toma la inspiración de NotebookLM en investigación asistida, síntesis y aprendizaje, pero desplaza el centro de gravedad hacia un editor de mapas mentales persistente, privado y enriquecido por IA. El diferenciador clave es el agente de entrevista conversacional que recopila contexto antes de generar el mapa, permitiendo investigaciones más precisas y contenidas.

La mejor decisión estratégica para este PRD es describir la aplicación no como “un generador de mapas” ni como “un chat con nodos”, sino como un **sistema de conocimiento visual pedagógico**. Su núcleo es la combinación de entrevista conversacional con IA, mapa mental interactivo, investigación contextual, edición humana total, persistencia robusta y colaboración controlada.
