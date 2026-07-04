# CONTENT MODEL

# CLUB

## Purpose

Información institucional del club.

## Fields

| Field | Type | Required |
|---------|---------|---------|
| history | richtext | yes |
| mission | text | no |
| values | text | no |
| location | text | yes |
| logo_url | image | yes |

---

# NEWS

## Purpose

Noticias institucionales y deportivas.

## Fields

| Field | Type | Required |
|---------|---------|---------|
| title | text | yes |
| excerpt | text | yes |
| content | richtext | yes |
| image_url | image | yes |
| published | boolean | yes |

---

# PLAYER

## Purpose

Jugadores de Primera División.

## Fields

| Field | Type | Required |
|---------|---------|---------|
| name | text | yes |
| surname | text | yes |
| number | integer | yes |
| position | select | yes |
| image_url | image | yes |
| active | boolean | yes |

## Positions

- Arquero
- Defensor
- Mediocampista
- Delantero

---

# STAFF

## Purpose

Personas vinculadas al club.

## Fields

| Field | Type | Required |
|---------|---------|---------|
| name | text | yes |
| role | text | yes |
| category | select | yes |
| image_url | image | no |
| active | boolean | yes |

## Categories

- primera
- infanto
- directivos

---

# MATCH

## Purpose

Partidos del fixture.

## Fields

| Field | Type | Required |
|---------|---------|---------|
| rival | text | yes |
| date | datetime | yes |
| competition | text | yes |
| status | select | yes |
| goals_for | integer | no |
| goals_against | integer | no |

## Status

- upcoming
- finished

---

# GALLERY

## Purpose

Momentos Campito.

## Fields

| Field | Type | Required |
|---------|---------|---------|
| title | text | yes |
| category | select | yes |
| match_date | date | yes |
| cover_image | image | yes |

## Categories

- primera
- infanto
- femenino
- veteranos
- familias
- hinchas

---

# MEDIA

## Purpose

Fotos y videos.

## Fields

| Field | Type | Required |
|---------|---------|---------|
| gallery_id | relation | yes |
| type | select | yes |
| file_url | file | yes |
| thumbnail_url | image | no |

## Types

- image
- video

---

# CMS PRINCIPLE

Todo contenido debe poder gestionarse desde el panel visual.

No requiere conocimientos técnicos.

No requiere modificación de código.