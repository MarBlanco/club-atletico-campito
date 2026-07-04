# CURSOR RULES

## Global Rules

La documentación oficial tiene prioridad absoluta.

Documentos oficiales:

* TRUTH.md
* ARCHITECTURE.md
* DESIGN_SYSTEM.md
* ADMIN_UI_SPEC.md
* DATABASE_SPEC.md
* BUILD_ORDER.md
* CONTENT_MODEL.md
* MEDIA_SPEC.md
* ADMIN_FLOWS.md

Nunca ignorar documentación aprobada.

---

## Product Rules

Roles oficiales:

* Admin
* Colaborador

No existen otros roles.

People es el módulo oficial para:

* Primera Staff
* Infanto
* Directivos

Jugadores es exclusivamente el plantel de Primera.

Nunca duplicar información entre ambos módulos.

No agregar funcionalidades no documentadas.

No eliminar funcionalidades aprobadas.

---

## Architecture Rules

Stack oficial:

Frontend:

* React
* TypeScript
* Vite

Backend:

* Supabase

Database:

* PostgreSQL

Storage:

* Supabase Storage

Auth:

* Supabase Auth

Hosting:

* Vercel

No modificar stack.

---

## UI Rules

Utilizar exclusivamente lo definido en:

DESIGN_SYSTEM.md

No crear estilos alternativos.

No cambiar identidad visual.

No cambiar navegación aprobada.

No cambiar nombres de módulos.

---

## CMS Rules

Respetar:

* ADMIN_UI_SPEC.md
* ADMIN_FLOWS.md
* CONTENT_MODEL.md

No crear CRUDs fuera de los aprobados.

---

## Database Rules

Respetar:

DATABASE_SPEC.md

No crear tablas nuevas.

No crear relaciones nuevas.

No modificar entidades aprobadas.

---

## Media Rules

Respetar:

MEDIA_SPEC.md

No utilizar servicios externos.

Todo archivo debe almacenarse en Supabase Storage.

---

## Development Rules

Utilizar:

* TypeScript estricto
* Componentes reutilizables
* Código simple
* Arquitectura mantenible

Evitar sobreingeniería.

---

## Build Mode

Construir por fases.

No avanzar automáticamente.

Esperar aprobación del usuario al finalizar cada fase.

Fases:

1. Foundation
2. Supabase
3. Admin Shell
4. CMS Modules
5. Public Site
6. Media System
7. Polish

---

## Forbidden Actions

Prohibido:

* rediseñar producto
* cambiar arquitectura
* agregar funcionalidades
* eliminar funcionalidades
* crear nuevos roles
* cambiar stack
* ignorar documentación

---

## Final Rule

La misión es construir exactamente el sistema aprobado.

La documentación siempre prevalece sobre cualquier decisión generada por IA.
