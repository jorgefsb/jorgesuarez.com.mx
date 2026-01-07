---
description: Guía paso a paso para desplegar en Vercel y configurar el dominio
---

# Workflow: Despliegue en Producción (Vercel)

Este workflow detalla los pasos para poner tu sitio en línea utilizando Vercel y conectar tu dominio personalizado.

## Fase 1: Importar Proyecto en Vercel

1.  **Iniciar Sesión**: Ve a [vercel.com](https://vercel.com) e inicia sesión (preferiblemente con tu cuenta de GitHub).
2.  **Nuevo Proyecto**:
    *   Haz clic en el botón blanco **"Add New..."** y selecciona **"Project"**.
    *   En la lista "Import Git Repository", busca `jorgesuarez.com.mx` (o el nombre de tu repo).
    *   Haz clic en **"Import"**.
3.  **Configurar Despliegue**:
    *   **Framework Preset**: Déjalo en `Other` (Vercel detectará automáticamente que es HTML estático).
    *   **Root Directory**: `./` (Déjalo como está).
    *   Haz clic en **"Deploy"**.
4.  **Esperar**: Vercel construirá el sitio en unos segundos. Deberías ver una pantalla de "Congratulations!".

## Fase 2: Conectar Dominio (jorgesuarez.com.mx)

1.  En el dashboard de tu proyecto en Vercel, ve a la pestaña **Settings**.
2.  En el menú lateral izquierdo, selecciona **Domains**.
3.  En la caja de texto, escribe: `jorgesuarez.com.mx` y haz clic en **Add**.
4.  Vercel te sugerirá añadir también `www.jorgesuarez.com.mx`. Acepta la opción recomendada (Redirect `www.jorgesuarez.com.mx` to `jorgesuarez.com.mx` o viceversa, como prefieras. Se recomienda redirigir la raíz a `www` o viceversa para SEO).

## Fase 3: Configurar DNS (En tu Registrador)

Vercel te mostrará unos valores (Records) que debes configurar donde compraste tu dominio (ej: GoDaddy, Namecheap, Akky, etc.).

Generalmente son:

*   **Type**: `A`
*   **Name**: `@` (o déjalo vacío)
*   **Value**: `76.76.21.21`

*   **Type**: `CNAME`
*   **Name**: `www`
*   **Value**: `cname.vercel-dns.com`

**Nota**: Los cambios de DNS pueden tardar desde unos minutos hasta 48 horas en propagarse.

## Fase 4: Verificación SSL

Vercel generará automáticamente los certificados SSL. Una vez que los DNS se propaguen, verás que tu sitio es accesible vía `https://`.
