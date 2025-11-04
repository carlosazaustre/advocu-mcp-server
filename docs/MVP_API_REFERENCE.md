# Microsoft MVP API Reference

## 📋 Formatos y Tipos Esperados

Esta documentación detalla los formatos exactos esperados por el API de Microsoft MVP basándose en pruebas exitosas.

---

## 🎥 Video Activities

### Activity Type
- **Valor correcto**: `"Video"`
- ❌ **NO usar**: `"Webinar/Online Training/Video/Livestream"`

### Roles Válidos para Videos
- ✅ `"Host"`
- ✅ `"Presenter"`
- ✅ `"Speaker"`
- ❌ **NO usar**: `"Author"` (solo válido para Blog/Book)

### Campos Requeridos

```typescript
{
  id: 0,                              // Siempre 0 para nuevas actividades
  activityTypeName: "Video",          // Tipo de actividad
  typeName: "Video",                  // Mismo que activityTypeName
  date: "2025-07-10T00:00:00.000Z",  // ISO 8601 format
  description: string,                // Max 1000 caracteres
  isPrivate: boolean,                 // true/false
  targetAudience: string[],           // Array de audiencias (ver abajo)
  tenant: "MVP",                      // Siempre "MVP"
  title: string,                      // Max 100 caracteres
  url: string,                        // URL del video (https://...)
  userProfileId: number,              // Tu profile ID (ej: 399243)
  role: "Host" | "Presenter" | "Speaker",
  technologyFocusArea: string,        // Área tecnológica principal
  additionalTechnologyAreas: [],      // SIEMPRE array vacío por ahora
  liveStreamViews: number,            // Vistas en livestream (0 si no aplica)
  onDemandViews: number,              // Vistas on-demand
  numberOfSessions: number,           // Número de sesiones (default: 1)
  inPersonAttendees: 0,               // Siempre 0 para videos
  subscriberBase: 0,                  // Siempre 0 para videos
  imageUrl: ""                        // String vacío
}
```

### Target Audience (Audiencias Válidas)

```typescript
[
  "Developer",
  "Technical Decision Maker",
  "Business Decision Maker",
  "Student",
  "IT Pro",
  "End User"
]
```

### Technology Focus Areas (Ejemplos Válidos)

```
"Web Development"
"Cloud & AI"
"Developer Tools"
"Mobile Development"
"Data & Analytics"
"Security"
"DevOps"
"IoT"
```

### Ejemplo Completo - Video

```json
{
  "activity": {
    "id": 0,
    "activityTypeName": "Video",
    "typeName": "Video",
    "date": "2025-07-10T00:00:00.000Z",
    "description": "Video tutorial explicando como resolver problemas comunes en Angular 20 y terminar con los dramas de configuracion y migracion. Incluye best practices y soluciones a los desafios mas frecuentes de la version.",
    "isPrivate": false,
    "targetAudience": ["Developer"],
    "tenant": "MVP",
    "title": "Como TERMINAR con el drama de Angular 20",
    "url": "https://www.youtube.com/watch?v=OXlWMbrGgxk",
    "userProfileId": 399243,
    "role": "Host",
    "technologyFocusArea": "Web Development",
    "additionalTechnologyAreas": [],
    "liveStreamViews": 0,
    "onDemandViews": 8619,
    "numberOfSessions": 1,
    "inPersonAttendees": 0,
    "subscriberBase": 0,
    "imageUrl": ""
  }
}
```

---

## 📝 Blog Activities

### Activity Type
- **Valor correcto**: `"Blog"`

### Roles Válidos para Blogs
- ✅ `"Author"`
- ✅ `"Co-Author"`
- ✅ `"Contributor"`

### Campos Requeridos

```typescript
{
  id: 0,
  activityTypeName: "Blog",
  typeName: "Blog",
  date: string,                       // ISO 8601
  description: string,                // Max 1000 caracteres
  isPrivate: boolean,
  targetAudience: string[],
  tenant: "MVP",
  title: string,                      // Max 100 caracteres
  url: string,
  userProfileId: number,
  role: "Author" | "Co-Author" | "Contributor",
  technologyFocusArea: string,
  additionalTechnologyAreas: [],      // Array vacío
  numberOfViews: number,              // Total de vistas
  subscriberBase: number,             // Opcional (0 si no aplica)
  imageUrl: ""
}
```

---

## 📚 Book/E-book Activities

### Activity Type
- **Valor correcto**: `"Book/E-book"`

### Roles Válidos para Libros
- ✅ `"Author"`
- ✅ `"Co-Author"`

### Campos Requeridos

```typescript
{
  id: 0,
  activityTypeName: "Book/E-book",
  typeName: "Book/E-book",
  date: string,                       // ISO 8601
  description: string,
  isPrivate: boolean,
  targetAudience: string[],
  tenant: "MVP",
  title: string,
  url: string,
  userProfileId: number,
  role: "Author" | "Co-Author",
  technologyFocusArea: string,
  additionalTechnologyAreas: [],
  numberOfViews: number,              // Número de lectores/descargas
  subscriberBase: number,             // Opcional
  copiesSold: number,                 // Copias vendidas (0 si es gratis)
  imageUrl: ""
}
```

---

## 🎤 Speaking Activities

### Activity Types Válidos
- `"Speaking (Conference)"`
- `"Speaking (Local Event / User Group / Meetup)"`
- `"Speaking (Microsoft Event)"`

### Roles Válidos para Speaking
- ✅ `"Speaker"`
- ✅ `"Panelist"`
- ✅ `"Moderator"`
- ✅ `"Presenter"`

### Campos Requeridos

```typescript
{
  id: 0,
  activityTypeName: "Speaking (Conference)" | "Speaking (Local Event / User Group / Meetup)" | "Speaking (Microsoft Event)",
  typeName: "Speaking",
  date: string,
  description: string,
  isPrivate: boolean,
  targetAudience: string[],
  tenant: "MVP",
  title: string,
  url: string,
  userProfileId: number,
  role: "Speaker" | "Panelist" | "Moderator" | "Presenter",
  technologyFocusArea: string,
  additionalTechnologyAreas: [],
  inPersonAttendees: number,          // Asistentes presenciales
  numberOfSessions: number,           // Número de sesiones
  liveStreamViews: number,            // Opcional (vistas livestream)
  onDemandViews: number,              // Opcional (vistas on-demand)
  imageUrl: ""
}
```

---

## 🔧 Todos los Activity Types Disponibles

```typescript
enum MVPActivityType {
  BLOG = "Blog",
  BOOK_EBOOK = "Book/E-book",
  CODE_PROJECT = "Code Project/Sample",
  CONFERENCE_BOOTH = "Conference (booth)",
  CONFERENCE_ORGANIZER = "Conference (organizer)",
  FORUM_MODERATOR = "Forum Moderator",
  FORUM_PARTICIPATION = "Forum Participation (3rd Party Forums)",
  FORUM_PARTICIPATION_MICROSOFT = "Forum Participation (Microsoft Forums)",
  MENTORSHIP = "Mentorship",
  OPEN_SOURCE = "Open Source Project(s)",
  OTHER = "Other",
  PRODUCT_GROUP_FEEDBACK = "Product Group Feedback",
  SITE_OWNER = "Site Owner",
  SPEAKING_CONFERENCE = "Speaking (Conference)",
  SPEAKING_LOCAL_EVENT = "Speaking (Local Event / User Group / Meetup)",
  SPEAKING_MICROSOFT_EVENT = "Speaking (Microsoft Event)",
  TECHNICAL_SOCIAL_MEDIA = "Technical Social Media (Twitter, Facebook, LinkedIn...)",
  TRANSLATION_REVIEW = "Translation Review, Feedback and Editing",
  VIDEO = "Video",
  WORKSHOP = "Workshop"
}
```

---

## 🎯 Roles por Tipo de Actividad

| Activity Type | Roles Válidos |
|--------------|---------------|
| Video | Host, Presenter, Speaker |
| Blog | Author, Co-Author, Contributor |
| Book/E-book | Author, Co-Author |
| Speaking (todos) | Speaker, Panelist, Moderator, Presenter |
| Workshop | Organizer, Presenter |

---

## ⚠️ Errores Comunes

### 1. Token Truncado
**Error**: `BearerReadAccessTokenFailed`
**Solución**: Usar archivo HAR exportado, no copiar del DevTools directamente

### 2. Activity Type Incorrecto
**Error**: `Activity type with name of $... does not exist`
**Solución**: Usar valores exactos del enum MVPActivityType

### 3. Rol Inválido para el Tipo
**Error**: `Activity role with name of $... does not exist in type $...`
**Solución**: Verificar tabla de roles válidos por tipo

### 4. Additional Technology Areas
**Error**: `TechnologyArea with name ... does not exist`
**Solución**: Por ahora usar array vacío `[]`

---

## 📊 Response Exitoso

```json
{
  "contributionId": 351180
}
```

**Status Code**: `201 Created`

---

## 🔑 Autenticación

### Headers Requeridos

```
Authorization: Bearer <token_completo>
Content-Type: application/json
Referer: https://mvp.microsoft.com/
Origin: https://mvp.microsoft.com
```

### Endpoint

```
POST https://mavenapi-prod.azurewebsites.net/api/Activities/
```

### Body Format

```json
{
  "activity": {
    // ... campos de la actividad
  }
}
```

**Nota**: El objeto activity debe estar envuelto en `{ "activity": {...} }`

---

## 📅 Formato de Fechas

Todas las fechas deben estar en formato **ISO 8601**:

```javascript
new Date("2025-07-10").toISOString()
// "2025-07-10T00:00:00.000Z"
```

---

## 🔄 Refresh de Token

El token MVP expira cada pocas horas. Para renovarlo:

```bash
npm run capture-mvp-token
```

1. Abre el navegador en el portal MVP
2. Navega a DevTools → Network
3. Edita/crea una actividad
4. Exporta como HAR
5. Busca el header `Authorization`
6. Copia el token completo
7. Actualiza el config de Claude Desktop

---

## ✅ Checklist Pre-Envío

- [ ] Token válido y completo
- [ ] Activity type correcto del enum
- [ ] Rol válido para ese tipo de actividad
- [ ] `additionalTechnologyAreas` = `[]`
- [ ] Fecha en formato ISO 8601
- [ ] `tenant` = `"MVP"`
- [ ] `userProfileId` correcto
- [ ] Campos numéricos son números, no strings
- [ ] URL comienza con `https://`
- [ ] Título ≤ 100 caracteres
- [ ] Descripción ≤ 1000 caracteres
