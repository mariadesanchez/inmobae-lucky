# Guía Rápida: Buenas Prácticas para Portales Inmobiliarios en Next.js

Esta es una lista condensada y directa de mejores prácticas, recomendaciones e ideas para el desarrollo de portales inmobiliarios de alto rendimiento en Next.js.

---

## 🚀 1. Arquitectura y Rendimiento (Next.js)
*   **Renderizado Híbrido:** Usa **ISR (Incremental Static Regeneration)** para la página principal y listados estáticos (revalidando cada 15-30 mins), e **ISR/SSR** para el detalle de propiedades.
*   **Rutas Amigables (SEO Slugs):** Estructura URLs limpias y legibles: `/propiedades/[operacion]-[tipo]-[ubicacion]-[slug]` (ej. `/propiedades/venta-casa-beverly-hills-luxury-oasis`).
*   **Next.js Server Actions:** Utiliza Server Actions para procesar filtros dinámicos, envíos de formularios y acciones de "favoritos" de forma segura desde el servidor.
*   **Server Components (RSC) por Defecto:** Reduce el tamaño del paquete JS del cliente manteniendo los componentes principales en el servidor. Solo usa `'use client'` para interactividad directa (mapas, sliders, filtros interactivos).
*   **Manejo Eficiente de Estados de Carga:** Implementa `loading.tsx` y skeletons de UI específicos para evitar saltos en la pantalla (CLS) durante las consultas pesadas a la base de datos.
*   **Paginación y Limitación en Servidor:** Realiza la paginación y ordenamiento directamente en la consulta de la base de datos (ej. Supabase `.range()`) y no en la memoria del cliente.

---

## 📸 2. Optimización Multimedia y Core Web Vitals
*   **Optimización Automática de Imágenes:** Utiliza el componente `<Image />` de Next.js. Habilita los formatos **AVIF y WebP** en `next.config.ts`.
*   **Prioridad para LCP:** Añade la propiedad `priority` a la imagen principal del hero banner y a la primera foto del detalle de propiedad para reducir el tiempo de primer pintado.
*   **Imágenes Blur/Placeholder:** Usa la propiedad `placeholder="blur"` con una versión LQIP o colores planos para una carga visual progresiva y suave.
*   **Carga Diferida de Contenido 3D (Tours Virtuales):** No cargues iframes de Matterport o videos 3D de inicio. Muestra una previsualización de imagen estática y monta el iframe interactivo solo tras el clic del usuario.
*   **Compresión de Videos de Fondo:** Si usas videos en el hero, comprimelos a formato `.webm` (codec VP9) y limita su tamaño a menos de 5MB.

---

## 🔍 3. Posicionamiento (SEO) y Datos Estructurados
*   **Metadatos Dinámicos por Ficha:** Configura títulos y descripciones únicas utilizando la API `generateMetadata` de Next.js, incluyendo el precio actual, número de dormitorios e inmobiliaria.
*   **JSON-LD Estructurado:** Agrega datos estructurados en formato JSON-LD en cada propiedad utilizando los tipos de Schema.org:
    *   `SingleFamilyResidence` u `ApartmentComplex` para los detalles físicos.
    *   `RealEstateAgent` para la información comercial de contacto.
*   **Sitemap XML Dinámico:** Automatiza la generación del sitemap en la ruta `/sitemap.xml` para notificar instantáneamente a Google cuando se añade o elimina una propiedad.
*   **Canonical Tags:** Utiliza etiquetas `<link rel="canonical" href="..." />` para evitar problemas de contenido duplicado causados por los múltiples parámetros de filtros de búsqueda.

---

## 🎨 4. Experiencia de Usuario (UI/UX)
*   **Sincronización de Filtros con la URL (Query Params):** Asegura que todos los filtros aplicados (precio, habitaciones, ubicación) se guarden en la URL del navegador (`?precio_max=500000&tipo=depto`) para poder compartir o guardar búsquedas.
*   **Buscador con Autocompletado (Debounce):** Implementa un retardo (*debounce* de 300ms) en la barra de búsqueda de texto para evitar peticiones redundantes a la base de datos con cada tecla presionada.
*   **Favoritos sin Registro Obligatorio:** Almacena las propiedades guardadas temporalmente en `localStorage` o cookies. Pide crear una cuenta solo para sincronizar entre dispositivos o recibir alertas.
*   **Accesibilidad (A11y):** Asegura contrastes legibles (cumplimiento WCAG AA), navegación completa por teclado en formularios e información clave, y etiquetas `alt` descriptivas en cada fotografía de propiedades.
*   **Modo Oscuro / Paleta de Colores Premium:** Utiliza colores HSL sobrios y elegantes (grises oscuros, tonos tierra, detalles dorados o verde bosque) acordes al target del sector inmobiliario.

---

## 📍 5. Mapas e Interactividad
*   **Carga Dinámica de Mapas:** Importa los componentes de mapa (Google Maps, Leaflet o Mapbox) de manera diferida usando `next/dynamic` con `{ ssr: false }` para no penalizar la velocidad de carga inicial de la página.
*   **Clustering de Marcadores:** Agrupa marcadores geográficos cuando los resultados de búsqueda en un mismo barrio o ciudad sean numerosos, evitando saturar el rendimiento visual del navegador.
*   **Pops de Previsualización en Mapa:** Al hacer clic en un pin, muestra una tarjeta en miniatura rápida de la propiedad sin forzar la recarga o redirección total de la página.
*   **Filtrado por Mapa ("Dibujar Zona"):** Habilita una herramienta de polígono interactiva para permitir al usuario delimitar manualmente el área de interés directamente sobre el mapa.

---

## ✉️ 6. Conversión y Gestión de Leads
*   **Contacto Directo por WhatsApp:** Crea botones de contacto rápido que abran WhatsApp Web/App pre-cargando un mensaje dinámico que identifique la propiedad por nombre e ID (ej. *"Hola, quiero consultar por la casa Minimalist Oasis (ID: 22)"*).
*   **Formularios Contextuales Sencillos:** Limita los campos del formulario de contacto a 3 obligatorios (Nombre, Email, Teléfono) y autocompleta la información de la propiedad de interés en el mensaje para maximizar la tasa de conversión.
*   **Calculadora de Cuota Mensual:** Incluye una simulación hipotecaria directa en el detalle de la propiedad que calcule cuotas mensuales estimadas según el precio de venta y tasas de interés locales vigentes.
*   **Suscripción a Alertas de Búsqueda:** Permite a los usuarios recibir correos electrónicos semanales con nuevas propiedades que coincidan con sus criterios de búsqueda guardados.
