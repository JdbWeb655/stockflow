# Routing Conventions

## Public Routes

- `/:username/catalog` - Catálogo público del vendedor
- Formato: `/:username/` como prefijo para todas las rutas públicas de usuario

## Rationale

- Mejor SEO (username tiene más peso en la URL)
- Escalable para futuras rutas como `/:username/products`, `/:username/about`
- Consistente con implementación actual

## Notes

- La especificación original (2026-05-17) usaba `/catalog/:username`
- La implementación real usa `/:username/catalog` - esta es la versión correcta
- Este documento prevalece sobre cualquier especificación anterior
