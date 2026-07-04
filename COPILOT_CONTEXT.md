# CLUB ATLÉTICO CAMPITO CMS

## Proyecto

Sistema de gestión y sitio institucional para Club Atlético Campito (Colón, Entre Ríos, Argentina).

Este proyecto ya posee documentación aprobada y congelada.

Toda decisión debe respetar dicha documentación.

---

# SOURCE OF TRUTH

Leer siempre primero la carpeta:

docs/

Documentación oficial:

- 01_TRUTH.md
- 02_ARCHITECTURE.md
- 03_DESIGN_SYSTEM.md
- 04_ADMIN_UI_SPEC.md
- 05_DATABASE_SPEC.md
- 06_BUILD_ORDER.md
- 07_CONTENT_MODEL.md
- 08_MEDIA_SPEC.md
- 09_ADMIN_FLOWS.md
- 10_BUILD_READINESS_REVIEW.md
- 11_COPILOT_RULES.md
- 12_COMPONENT_LIBRARY.md
- 13_SUPABASE_REVIEW.md
- 14_PROJECT_FOUNDATION.md

---

# STACK OFICIAL

Frontend

- React
- TypeScript
- Vite

Backend

- Supabase

Database

- PostgreSQL

Authentication

- Supabase Auth

Storage

- Supabase Storage

Hosting

- Vercel

---

# REGLAS OBLIGATORIAS

Nunca:

- rediseñar el producto
- modificar la arquitectura
- cambiar el stack
- agregar funcionalidades no documentadas
- eliminar funcionalidades aprobadas
- crear nuevos roles
- cambiar nombres de módulos

Siempre:

- reutilizar componentes
- escribir código simple
- utilizar TypeScript estricto
- respetar el Design System
- respetar el Build Order
- mantener una arquitectura limpia

---

# ROLES OFICIALES

## Admin

Acceso completo.

## Colaborador

Gestión de contenido.

No existen otros roles.

---

# MÓDULOS DEL SITIO

- Home
- Club
- Equipos
- Primera
- Noticias
- Fixture
- Multimedia
- Momentos Campito
- Contacto

---

# MÓDULOS DEL CMS

- Dashboard
- Club
- Noticias
- People
- Jugadores
- Fixture
- Multimedia
- Momentos Campito
- Usuarios
- Configuración

---

# OBJETIVO

Construir exactamente el sistema aprobado.

No reinterpretar la documentación.

No proponer rediseños.

No avanzar de fase sin aprobación del usuario.