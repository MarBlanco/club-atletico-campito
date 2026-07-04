# PROJECT FOUNDATION

## Repository Structure

campito/

* docs
* public-site
* admin-panel
* supabase

---

## Frontend Architecture

### Public Site

Organización:

* layouts
* pages
* components
* services
* hooks
* types

Responsabilidad:

Sitio público institucional.

---

## Admin Architecture

Organización:

* dashboard
* modules
* routes
* components
* services

Responsabilidad:

Administración completa del CMS.

---

## Shared Architecture

Elementos reutilizables:

* types
* services
* constants
* utilities

Objetivo:

Evitar duplicación.

---

## Supabase Architecture

### Auth

Supabase Auth.

### Database

PostgreSQL.

### Storage

Supabase Storage.

### Services

Acceso centralizado.

---

## Routing Strategy

### Public Site

* Home
* Club
* Equipos
* Primera
* Noticias
* Fixture
* Multimedia
* Momentos Campito
* Contacto

### Admin Panel

* Dashboard
* Club
* Noticias
* People
* Jugadores
* Fixture
* Multimedia
* Momentos Campito
* Usuarios
* Configuración

---

## Type Strategy

Utilizar:

* interfaces
* types

Tipado estricto.

Evitar any.

---

## State Strategy

Mantener simplicidad.

Estado local cuando sea posible.

No introducir complejidad innecesaria.

---

## Environment Strategy

Variables de entorno separadas.

Configuración centralizada.

Credenciales fuera del código.

---

## Build Strategy

Fase 1

Foundation

---

Fase 2

Supabase

---

Fase 3

Admin Shell

---

Fase 4

CMS Modules

---

Fase 5

Public Site

---

Fase 6

Media System

---

Fase 7

Polish

---

## Foundation Approval

APPROVED

El proyecto cuenta con una base documental suficiente para iniciar construcción.
