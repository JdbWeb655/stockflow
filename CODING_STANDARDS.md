# Coding Standards for StockFlow

## 1. TYPESCRIPT
- Nunca usar "any". Siempre definir interfaces o types.
- Todas las funciones deben tener tipos de retorno explícitos.
- Usar "unknown" en vez de "any" cuando el tipo es incierto.

## 2. REACT
- Todos los componentes deben tener sus Props tipadas con interface.
- Nunca usar índices como key en listas, usar IDs únicos.
- Separar lógica de UI: hooks para lógica, componentes para UI.

## 3. ZUSTAND
- Cada store debe tener su interface de estado bien definida.
- Nunca mutar el estado directamente, siempre usar set().
- Las operaciones asíncronas del store deben manejar errores y loading.

## 4. GENERAL
- No hardcodear valores. Usar constantes o variables de entorno.
- Manejar siempre los estados de loading y error.
- No dejar console.log en el código final.
- Nunca renombrar campos existentes sin verificar todos los lugares donde se usan. Antes de cambiar el nombre de cualquier propiedad, buscar todas sus referencias en el proyecto.

## 5. SUPABASE
- Nunca exponer la service key en el frontend.
- Siempre usar RLS para proteger los datos.
- Usar el cliente `supabase.ts` para todas las queries a la base de datos.

## 6. MANEJO DE ERRORES
- Nunca silenciar errores con catch() {} vacío.
- Siempre mostrar feedback al usuario cuando algo falla.
- Usar tipos específicos para errores, no catch(e: any).
- Mostrar feedback específico para errores de autenticación (Magic Link vs email/password).

## 7. SEGURIDAD
- Nunca commitear el archivo .env.
- Validar inputs del usuario antes de enviarlos a la DB.
- Sanitizar datos que se muestran en el DOM para evitar XSS.

## 8. PERFORMANCE
- Usar useCallback y useMemo cuando sea necesario.
- No hacer fetch dentro de loops.
- Paginar listas grandes, nunca traer todos los registros.

## 9. ESTRUCTURA DE ARCHIVOS
- Un componente por archivo, nombre igual al componente.
- Interfaces y types en /types, no inline en componentes.
- Constantes globales en /utils/constants.ts.

## 10. GIT
- Commits descriptivos: feat:, fix:, refactor:.
- Nunca commitear node_modules.
- Una feature por branch, no mezclar cambios.

## 11. ACCESIBILIDAD
- Siempre agregar alt en imágenes.
- Usar elementos semánticos (button, nav, main).
- Asegurar contraste mínimo en colores.
