# Mejoras en el Manejo de Errores

## Fecha: 2025-10-12

## Problema

El servidor MCP mostraba mensajes de error genéricos e inútiles cuando fallaba una operación:

```json
[{"type": "text", "text": "Tool execution failed", "uuid": "..."}]
```

o mensajes poco descriptivos como:

```
Error executing tool: [object Object]
```

## Solución Implementada

### Enfoque Clave: Errores como Contenido en Lugar de Excepciones

**Problema identificado**: Claude Desktop interceptaba las excepciones `McpError` y mostraba su propio mensaje genérico "Tool execution failed" en lugar del mensaje personalizado.

**Solución**: Para errores esperados del API (401, 400, 429, etc.), en lugar de lanzar excepciones, se devuelven como contenido normal de la respuesta. Esto permite que Claude Desktop muestre el mensaje completo al usuario.

```typescript
// ❌ ANTES - Claude Desktop interceptaba esto
if (response.status === 401) {
  throw new McpError(ErrorCode.InternalError, "mensaje de error...");
}

// ✅ AHORA - Se devuelve como contenido
if (response.status === 401) {
  return {
    content: [
      {
        type: "text",
        text: "❌ MVP authentication failed. Your MVP_ACCESS_TOKEN...",
      },
    ],
  };
}
```

### 1. Función Helper para Extraer Mensajes de Error

Se agregó un método privado `getErrorMessage()` en las tres clases principales del servidor:

- `UnifiedActivityReportingServer` (`src/unifiedServer.ts`)
- `MVPActivityReportingServer` (`src/mvpServer.ts`)
- `ActivityReportingServer` (`src/server.ts`)

Esta función extrae mensajes significativos de diferentes tipos de errores:

```typescript
private getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
    if ("error" in error && typeof error.error === "string") {
      return error.error;
    }
    if ("statusText" in error && typeof error.statusText === "string") {
      return error.statusText;
    }
  }
  return JSON.stringify(error);
}
```

### 2. Mensajes de Error Contextualizados por Status Code

Se mejoraron los mensajes de error según el código HTTP de respuesta:

#### Error 401 - Autenticación Fallida

**MVP:**
```
❌ MVP authentication failed. Your MVP_ACCESS_TOKEN may be expired or invalid.

To fix:
1. Log in to https://mvp.microsoft.com/
2. Open DevTools → Network tab
3. Create/edit an activity
4. Export as HAR file
5. Extract the Bearer token from Authorization header
6. Update your configuration
```

**GDE:**
```
❌ GDE authentication failed. Your ADVOCU_ACCESS_TOKEN may be expired or invalid.

Please check your Advocu access token configuration.
```

#### Error 400 - Validación Fallida

**MVP:**
```
❌ MVP API rejected the request:

[mensaje del API]

Please check:
- Activity type is correct for the data provided
- Role is valid for this activity type
- All required fields are present
- Date format is correct (YYYY-MM-DD)
```

**GDE:**
```
❌ GDE API rejected the request:

[mensaje del API]

Please check:
- All required fields are present
- Field values match expected formats
- Tags are valid
- Date format is correct (YYYY-MM-DD)
```

#### Error 429 - Rate Limit

**MVP:**
```
⏱️ MVP API rate limit exceeded. Please wait a moment and try again.
```

**GDE:**
```
⏱️ GDE API rate limit exceeded (30 requests/minute). Please wait and try again.
```

#### Otros Errores HTTP

```
❌ [MVP/GDE] API error (STATUS_CODE):

[mensaje completo del API]
```

### 3. Mensajes de Error en el Handler Principal

Se mejoró el mensaje cuando falla la ejecución de un tool:

**Antes:**
```typescript
throw new McpError(ErrorCode.InternalError, `Error executing tool: ${error}`);
```

**Después:**
```typescript
const errorMsg = this.getErrorMessage(error);
throw new McpError(
  ErrorCode.InternalError,
  `Failed to execute tool '${name}': ${errorMsg}`
);
```

### 4. Mensajes de Error en Catch de Submission

Se agregó contexto sobre la actividad que falló:

**MVP:**
```typescript
throw new McpError(
  ErrorCode.InternalError,
  `❌ Failed to submit MVP activity:\n\n${errorMsg}\n\nActivity type: ${activity.activityTypeName}\nTitle: ${activity.title}`
);
```

**GDE:**
```typescript
throw new McpError(
  ErrorCode.InternalError,
  `❌ Failed to submit GDE activity:\n\n${errorMsg}\n\nEndpoint: ${endpoint}`
);
```

## Archivos Modificados

1. **`src/unifiedServer.ts`**
   - Agregado método `getErrorMessage()`
   - Mejorado manejo de errores en `CallToolRequestSchema` handler
   - Mejorado manejo de errores en `submitMVPActivity()`
   - Mejorado manejo de errores en `submitGDEActivityDraft()`

2. **`src/mvpServer.ts`**
   - Agregado método `getErrorMessage()`
   - Mejorado manejo de errores en `CallToolRequestSchema` handler
   - Mejorado manejo de errores en `submitActivity()`

3. **`src/server.ts`**
   - Agregado método `getErrorMessage()`
   - Mejorado manejo de errores en `CallToolRequestSchema` handler
   - Mejorado manejo de errores en `submitActivityDraft()`

## Beneficios

### Antes

```
❌ Error genérico sin contexto
❌ No indica qué salió mal
❌ No sugiere cómo solucionarlo
❌ Dificulta el debugging
```

### Después

```
✅ Mensaje descriptivo con contexto
✅ Indica exactamente qué falló
✅ Sugiere pasos para solucionar
✅ Incluye detalles de la actividad que falló
✅ Facilita el debugging
```

## Ejemplos de Uso

### Error de Token Expirado (401)

Usuario verá:
```
❌ MVP authentication failed. Your MVP_ACCESS_TOKEN may be expired or invalid.

To fix:
1. Log in to https://mvp.microsoft.com/
2. Open DevTools → Network tab
3. Create/edit an activity
4. Export as HAR file
5. Extract the Bearer token from Authorization header
6. Update your configuration
```

### Error de Validación (400)

Usuario verá:
```
❌ MVP API rejected the request:

Activity role with name of $Author does not exist in type $Video

Please check:
- Activity type is correct for the data provided
- Role is valid for this activity type
- All required fields are present
- Date format is correct (YYYY-MM-DD)

Activity type: Video
Title: Como TERMINAR con el drama de Angular 20
```

### Error de Red

Usuario verá:
```
❌ Failed to submit MVP activity:

fetch failed

Activity type: Video
Title: Como TERMINAR con el drama de Angular 20
```

## Testing

Compilación exitosa:
```bash
npm run build
# ✅ Sin errores TypeScript
# ✅ dist/ actualizado con nuevos cambios
```

## Próximos Pasos (Opcionales)

1. Agregar más validaciones client-side antes de enviar al API
2. Crear mensajes de error personalizados por tipo de actividad
3. Agregar logging estructurado para debugging
4. Implementar retry automático con exponential backoff para errores 429
