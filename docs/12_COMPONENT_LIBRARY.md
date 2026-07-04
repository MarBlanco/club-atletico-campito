# COMPONENT LIBRARY

## Layout Components

### PublicLayout

Responsabilidad:

Layout principal del sitio público.

Uso:

Todas las páginas públicas.

---

### AdminLayout

Responsabilidad:

Layout principal del CMS.

Uso:

Todas las pantallas administrativas.

---

### Sidebar

Responsabilidad:

Navegación principal del CMS.

---

### Topbar

Responsabilidad:

Acciones globales y usuario.

---

### Footer

Responsabilidad:

Pie institucional.

---

## UI Components

### Button

Botones reutilizables.

---

### Input

Campos de texto.

---

### Select

Listas desplegables.

---

### Textarea

Contenido largo.

---

### Modal

Ventanas emergentes.

---

### Badge

Estados y etiquetas.

---

### EmptyState

Pantallas sin contenido.

---

### LoadingState

Estados de carga.

---

### ConfirmDialog

Confirmaciones.

---

## Content Components

### HeroSection

Cabecera principal.

---

### SectionHeader

Título y descripción.

---

### NewsCard

Noticias.

---

### MatchCard

Partidos.

---

### GalleryCard

Galerías.

---

### PlayerCard

Jugadores.

---

### StaffCard

People.

---

### StatCard

Estadísticas.

---

### TeamCard

Equipos.

---

### ContactCard

Información de contacto.

---

## Media Components

### ImageUploader

Carga de imágenes.

---

### VideoUploader

Carga de videos.

---

### GalleryGrid

Visualización de galerías.

---

### MediaPreview

Vista previa.

---

### CropModal

Recorte de imágenes.

---

### Lightbox

Visualización fullscreen.

---

## Admin Components

### DataTable

Listado de registros.

---

### SearchBar

Búsqueda.

---

### FilterBar

Filtros.

---

### ActionMenu

Acciones por registro.

---

### StatusBadge

Estados.

---

### FormActions

Guardar y cancelar.

---

## Component Rules

Crear componentes nuevos únicamente cuando exista reutilización real.

Priorizar reutilización sobre duplicación.

Mantener responsabilidad única.

---

## Forbidden Patterns

Prohibido:

* componentes duplicados
* componentes gigantes
* lógica de negocio dentro de UI
* estilos inconsistentes
* variantes innecesarias
