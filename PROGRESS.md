# PROGRESS

## 1. RESUMEN DEL PROYECTO
- **StockFlow** es una aplicación de gestión de inventario y ventas orientada a usuarios con planes freemium. Permite a los usuarios crear productos, ver un catálogo público y registrar ventas.
- **Stack tecnológico**:
  - **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Zustand (state management), React Router.
  - **Backend**: Supabase (PostgreSQL, Auth, Row‑Level Security).
  - **UI**: Componentes personalizados con estilo oscuro y acentos verdes.
  - **Charting**: Recharts para visualización de reportes.

## 2. LO QUE ESTÁ HECHO
- **Componentes** (src/components):
  - `AuthForm.tsx` – formulario de login con Magic Link y soporte de email/password.
  - `ProtectedRoute.tsx` – protege rutas privadas.
  - `ProductForm.tsx` – crear/editar productos (con pre-llenado de campos, feedback de loading y modal con scroll).
  - `ProductList.tsx` – listado de productos con estilos oscuros y acentos verdes.
  - `ProductCard.tsx` – tarjeta de producto (incluye `WhatsAppButton`).
  - `WhatsAppButton.tsx` – genera enlace a WhatsApp con datos del producto.
  - `SearchBar.tsx`, `FilterPanel.tsx` – búsqueda y filtros para el catálogo público.
  - `PublicCatalog.tsx` – vista pública del catálogo (usa DummyJSON - Plan B).
  - `SalesReport.tsx` – reporte de ventas con estadísticas y gráfico de barras.
  - `Dashboard.tsx` – dashboard con métricas, gráfico de ventas y top 5 productos.
  - `SaleModal.tsx` – modal para registrar ventas (validación stock, cálculo subtotal, cierre).
  - `ImageUploader.tsx` – subida de imágenes a Supabase Storage con preview, validación de tamaño y manejo de errores.
- **Stores de Zustand**:
  - `authStore.ts` – manejo de sesión, login, logout y carga del perfil.
  - `productsStore.ts` – CRUD de productos conectado a Supabase real.
- **Rutas configuradas** (src/AppRoutes.tsx):
  - `/` – login.
  - `/dashboard` – dashboard (placeholder).
  - `/products` – gestión de inventario (placeholder).
  - `/sales` – historial de ventas (placeholder).
  - `/:username/catalog` – catálogo público.
  - Ruta comodín que redirige a `/`.
- **Rutas especiales**:
  - `/auth/callback` – componente `AuthCallback` implementado y configurado.
  - Tokens en hash fragment (`#access_token=...`) también manejados.
- **Base de datos** (supabase/schema.sql):
  - Tablas `users`, `products` y `sales` creadas.
  - Políticas RLS separadas por operación.
  - Índices y restricciones de producto limit para plan FREE.
- **Infraestructura**:
  - Vite configurado con `historyApiFallback`.
  - PostCSS en modo CommonJS.
  - Auth config en Supabase Dashboard: Site URL `http://localhost:5173` y Redirect URL `http://localhost:5173/auth/callback`.
  - Bucket `product-images` creado en Supabase Storage (público).

## 3. CORRECCIONES RECIENTES
- **ProductForm.tsx**:
  - Campos se pre-llenan correctamente al editar usando `useEffect` con dependencia `[product]`.
  - Botón "Cancelar" ahora cierra el formulario correctamente.
  - Modal con scroll: overlay `fixed inset-0` con `overflow-y-auto`, contenedor con `max-w-md` y márgenes.
  - Feedback visual de loading en botón submit ("Guardando..." + disabled).
  - Tipos corregidos: `parsed` como `Omit<Product, 'id' | 'userId'>`, `updates` como `Partial<Product>`.
- **uploadImage.ts**:
  - Path de subida: `product-images/{userId}/{filename}` para aislamiento por usuario.
  - Timeout de 15 segundos para evitar uploads colgados.
  - Mensajes de error específicos y validación de URL pública.
- **ImageUploader.tsx**:
  - Recibe `userId` como prop requerida.
  - Retorno corregido a `JSX.Element`.
  - Muestra preview de imágenes subidas con botón de eliminar.
  - Validación de tamaño de archivo y feedback de error con `role="alert"`.
- **models.ts**:
  - `Product.photos` cambiado de `string` a `string[]`.

## 4. PENDIENTES

### Críticos
1. **Implementar `salesStore.ts`** – no existe. Necesario para registrar ventas, listar historial y conectar con `SaleModal.tsx` y `SalesReport.tsx`.
2. **Agregar tabla `sale_items` al schema** – la arquitectura la define como snapshot histórico (`product_name`, `unit_price`). Falta en `schema.sql`.
3. **Políticas RLS para bucket `product-images`** – verificar que permita uploads autenticados con path `product-images/{userId}/...`.
4. **Fix `err: any` en `productsStore.ts`** – líneas 74, 101, 128 usan `any` en catch (viola CODING_STANDARDS #1).

### Testing
5. Probar login completo cuando pase el rate limit de Supabase.
6. Probar flujo completo end‑to‑end (login → dashboard → crear producto con imagen → registrar venta → ver reporte).

### Mejoras
7. Pulir estilos finales y mejorar responsividad global.
8. Agregar paginación a listas grandes (CODING_STANDARDS #8).
9. Verificar que `ProductForm` resetee campos al cerrar y reabrir para crear nuevo producto.

## 5. CÓMO ARRANCAR MAÑANA
1. **Instalar dependencias** (si no están instaladas): `npm install`.
2. **Configurar Supabase**:
   - Crear un proyecto en Supabase.
   - Ejecutar el script `supabase/schema.sql` en la consola de SQL.
   - Copiar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` a `.env` (o `.env.local`).
   - Verificar que el bucket `product-images` exista y sea público.
3. **Iniciar la app**: `npm run dev`.
4. **Probar**:
   - Acceder a `http://localhost:5174/` para login.
   - Navegar a `http://localhost:5174/johndoe/catalog` (reemplazar `johndoe` por username) para ver el catálogo público.
   - Ver el dashboard y reporte de ventas en `/dashboard`.
   - Probar creación/edición de productos con subida de imágenes.

## 6. COMANDOS ÚTILES
- `npm run dev` – iniciar servidor de desarrollo.
- `npm run build` – generar bundle de producción.
- `npm run preview` – previsualizar build.
- `npx supabase start` (si usas Supabase local) – levantar instancia local.
- `git status`, `git add .`, `git commit -m "msg"` – flujo Git habitual.

---

*Este documento refleja el estado actual del proyecto y sirve como guía para continuar el desarrollo.*
