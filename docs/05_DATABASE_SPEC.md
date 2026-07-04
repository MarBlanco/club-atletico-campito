# DATABASE SPEC

## Database

Supabase PostgreSQL

---

# USERS

## Purpose

Usuarios internos del sistema.

### Fields

- id
- name
- email
- role
- created_at

### Roles

- admin
- colaborador

---

# CLUB

## Purpose

Información institucional.

### Fields

- id
- history
- mission
- values
- location
- logo_url
- updated_at

---

# NEWS

## Purpose

Noticias del club.

### Fields

- id
- title
- excerpt
- content
- image_url
- published
- created_at
- author_id

---

# PLAYERS

## Purpose

Plantel de Primera.

### Fields

- id
- name
- surname
- number
- position
- image_url
- active
- created_at

---

# STAFF

## Purpose

People System.

### Fields

- id
- name
- role
- category
- image_url
- active

### Categories

- primera
- infanto
- directivos

---

# MATCHES

## Purpose

Fixture.

### Fields

- id
- rival
- date
- competition
- status
- goals_for
- goals_against

---

# GALLERIES

## Purpose

Momentos Campito.

### Fields

- id
- title
- category
- match_date
- cover_image
- created_at

---

# MEDIA

## Purpose

Fotos y videos.

### Fields

- id
- gallery_id
- type
- url
- thumbnail_url
- created_at

### Types

- image
- video

---

# RELATIONS

News
→ User

Gallery
→ Media

Match
→ Gallery (optional)

---

# STORAGE

campito-media

- news
- players
- staff
- galleries
- videos