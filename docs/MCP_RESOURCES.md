# Recursos MCP de Documentación

## ¿Qué son los Recursos MCP?

Los recursos MCP (Model Context Protocol Resources) permiten que las IAs accedan a documentación, archivos y datos directamente del servidor sin necesidad de copiar y pegar manualmente.

## Recursos Disponibles

El servidor MCP expone 4 recursos de documentación:

### 1. `docs://api-reference`
**Nombre**: API Reference
**Descripción**: Documentación completa de los APIs de Microsoft MVP y Google GDE (Advocu)
**Archivo**: `API.md`

Contiene:
- Especificaciones completas de ambos APIs
- Formatos de request y response
- Tipos de actividades soportados
- Ejemplos de uso

### 2. `docs://mvp-api-reference`
**Nombre**: MVP API Reference
**Descripción**: Referencia detallada del API de Microsoft MVP
**Archivo**: `MVP_API_REFERENCE.md`

Contiene:
- Formatos exactos por tipo de actividad (Video, Blog, Speaking, Book)
- Roles válidos por tipo de actividad
- Target audiences disponibles
- Technology focus areas
- Errores comunes y soluciones
- Checklist pre-envío

### 3. `docs://mvp-fixes-changelog`
**Nombre**: MVP Integration Fixes Changelog
**Descripción**: Changelog completo de fixes aplicados a la integración MVP
**Archivo**: `CHANGELOG_MVP_FIXES.md`

Contiene:
- Problemas encontrados y soluciones
- Cambios en el código
- Test exitoso con contributionId
- Archivos modificados
- Próximos pasos

### 4. `docs://error-handling`
**Nombre**: Error Handling Improvements
**Descripción**: Mejoras en el manejo de errores y buenas prácticas
**Archivo**: `ERROR_HANDLING_IMPROVEMENTS.md`

Contiene:
- Problemas de manejo de errores
- Soluciones implementadas
- Mensajes contextualizados por status code
- Ejemplos de uso

## Cómo Usar los Recursos

### Desde Claude Desktop

Las IAs que usan el servidor MCP pueden acceder a estos recursos automáticamente:

```
"Muéstrame la documentación del API MVP"
"¿Cuáles son los roles válidos para videos en MVP?"
"Dame un ejemplo de cómo enviar un blog post"
```

La IA usará automáticamente el recurso `docs://api-reference` o `docs://mvp-api-reference` para responder.

### Desde Código (Cliente MCP)

```typescript
// Listar recursos disponibles
const resources = await client.listResources();

// Leer un recurso específico
const apiDoc = await client.readResource("docs://api-reference");
console.log(apiDoc.contents[0].text);
```

### Listar Todos los Recursos

```typescript
const resources = await client.listResources();

resources.forEach(resource => {
  console.log(`URI: ${resource.uri}`);
  console.log(`Name: ${resource.name}`);
  console.log(`Description: ${resource.description}`);
  console.log(`MIME Type: ${resource.mimeType}`);
  console.log('---');
});
```

## Ventajas

### ✅ Siempre Actualizado
Los recursos se leen directamente de los archivos, por lo que cualquier actualización en `/docs` se refleja inmediatamente.

### ✅ Sin Copiar/Pegar
La IA accede a la documentación directamente sin que el usuario tenga que copiarla manualmente.

### ✅ Contexto Completo
Las IAs pueden consultar toda la documentación para dar respuestas más precisas.

### ✅ Versionado
Los recursos están versionados junto con el código del servidor.

## Implementación Técnica

### Estructura

```
docs/
├── API.md                           # Documentación completa de ambos APIs
├── MVP_API_REFERENCE.md             # Referencia detallada MVP
├── CHANGELOG_MVP_FIXES.md           # Changelog de fixes
└── ERROR_HANDLING_IMPROVEMENTS.md   # Mejoras de errores
```

### URI Schema

Todos los recursos usan el esquema `docs://` seguido de un identificador único:

```
docs://api-reference
docs://mvp-api-reference
docs://mvp-fixes-changelog
docs://error-handling
```

### MIME Type

Todos los recursos son archivos Markdown:
```
mimeType: "text/markdown"
```

## Agregando Nuevos Recursos

Para agregar un nuevo recurso:

1. **Crear el archivo de documentación** en `/docs`:
```bash
touch docs/NEW_DOCUMENTATION.md
```

2. **Agregar la entrada en `DOCUMENTATION_RESOURCES`** (`src/unifiedServer.ts`):
```typescript
const DOCUMENTATION_RESOURCES = [
  // ... recursos existentes
  {
    uri: "docs://new-documentation",
    name: "New Documentation",
    description: "Description of the new documentation",
    mimeType: "text/markdown",
    file: "NEW_DOCUMENTATION.md",
  },
];
```

3. **Recompilar**:
```bash
npm run build
```

4. **Reiniciar Claude Desktop** para que cargue los nuevos recursos.

## Troubleshooting

### Recurso no encontrado

Si obtienes `Unknown resource: docs://...`:
- Verifica que el URI esté correctamente escrito
- Verifica que el recurso esté en `DOCUMENTATION_RESOURCES`
- Reinicia Claude Desktop

### Error al leer archivo

Si obtienes `Failed to read resource`:
- Verifica que el archivo existe en `/docs`
- Verifica que el nombre del archivo en `DOCUMENTATION_RESOURCES` coincida
- Verifica permisos de lectura del archivo

### Recursos no aparecen

Si los recursos no aparecen en Claude Desktop:
- Verifica que `capabilities.resources` esté habilitado
- Verifica que `setupResourceHandlers()` se llame en el constructor
- Reinicia Claude Desktop completamente (Cmd+Q)

## Ejemplo de Uso Completo

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

const client = new Client(/* ... */);

// Listar recursos
const { resources } = await client.listResources();
console.log(`Found ${resources.length} resources`);

// Leer API reference
const apiRef = await client.readResource("docs://api-reference");
console.log("API Documentation:");
console.log(apiRef.contents[0].text);

// Leer MVP reference
const mvpRef = await client.readResource("docs://mvp-api-reference");
console.log("MVP API Reference:");
console.log(mvpRef.contents[0].text);
```

## Beneficios para las IAs

1. **Contexto Rico**: Acceso instantáneo a toda la documentación
2. **Precisión**: Respuestas basadas en documentación oficial
3. **Actualizado**: Siempre la última versión
4. **Eficiencia**: Sin necesidad de incluir docs en cada prompt
5. **Escalabilidad**: Fácil agregar más recursos

## Próximos Pasos

Ideas para expandir los recursos MCP:

- [ ] Agregar ejemplos de código como recursos separados
- [ ] Exponer esquemas JSON de validación
- [ ] Agregar recursos dinámicos (ej: últimas actividades enviadas)
- [ ] Agregar recursos de configuración
- [ ] Exponer logs recientes como recursos
