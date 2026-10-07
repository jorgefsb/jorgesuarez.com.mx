# Productos y experimentos

Catálogo estático en `index.html#products`, con estilos compartidos en `styles.css` y traducción ES/EN en `scripts.js`. No requiere framework, backend ni build. Las empresas, el portafolio de Amber y las comunidades conservan sus propias secciones.

## Evidencia y alcance (7 de octubre de 2026)

| Ficha | Estado mostrado | Fuente |
|---|---|---|
| Master Prompt Builder | Disponible | [README público](https://github.com/jorgefsb/master-prompt-builder): activo, wizard y exportación |
| EchoMentor AI | Beta · Club UETC | [Landing pública](https://github.com/jorgefsb/echomentor-ai); beta y alcance conservados del sitio/perfil existentes. Código público de la landing, no de la plataforma |
| SparkCrew | Idea · lista de espera | [README público](https://github.com/jorgefsb/sparkcrew-landing): propuesta, landing y waitlist; experimento de Sparkplug Technologies |
| Game Industry Resources | Disponible · en desarrollo | [README público](https://github.com/jorgefsb/game-industry-resources): landing y recursos principales disponibles; demás herramientas en desarrollo |
| PapacitoOS | En construcción | Descripción pública existente del perfil y brief autorizado: implementación parcial, código privado |
| RichLife | En construcción | Brief autorizado: nombre provisional, landing sin publicar, lista de espera cerrada. Ficha descriptiva sin enlace ni registro |
| PlayPitch | En pausa | Estado ya presente en `index.html` |

Los cuatro enlaces públicos de producto respondieron HTTP 200 durante la revisión. No se enviaron formularios ni se validó acceso de miembros, ventas o resultados comerciales. No se anuncian fechas de lanzamiento. No se enlazan repositorios privados.

## Agregar una ficha

1. Confirmar nombre, colaboración/propiedad, alcance actual y fuente pública o texto autorizado.
2. Copiar un `<article class="card product-card">` dentro de `.product-grid`. Asignar IDs únicos al artículo y título; enlazar `aria-labelledby` al título.
3. Completar estado, descripción, alcance y etiquetas ES/EN con `data-es` y `data-en`. No poner estos atributos en el artículo ni en un contenedor con enlaces: el traductor reemplaza `innerHTML`.
4. Agregar solo enlaces públicos comprobados. Sin acceso público, usar una nota y omitir la acción. Un código público de landing debe identificarse como tal.
5. Actualizar la tabla del README del perfil con el mismo estado y registrar la fuente aquí.
6. Revisar ambos idiomas, móvil/escritorio, foco/teclado y enlaces; abrir PR para revisar el contenido antes de publicar.

Vocabulario: **Idea** para propuesta, **Lista de espera** para interés previo al acceso, **Piloto/Beta** para acceso limitado confirmado, **Disponible** para un alcance concreto accesible, **En construcción** para implementación incompleta y **En pausa** para un proyecto detenido. Combinar etiquetas cuando la landing y el producto tengan estados distintos. No inferir disponibilidad a partir de un repositorio, CNAME o respuesta HTTP.

## Publicación pendiente

No se ejecutó merge, despliegue, cambio de DNS, login ni modificación de permisos. La siguiente acción requiere revisar el contenido de ambos PRs y comprobar el canal de publicación activo.

El README histórico menciona Vercel y el repositorio conserva `CNAME`, pero no demuestran el runtime actual. No hay workflows en `.github` en esta copia. El estado Vercel del commit base `94c50b5df36dfec02a0a7aa861acc6cec8862044` devuelve `failure`, con descripción `Account is blocked.` (2 de octubre de 2026). `main` no está protegido según la lectura de su configuración. Los headers de Cloudflare no identifican por sí solos el origen. No se modificaron estos controles.

Antes de autorizar publicación: confirmar origen y mecanismo efectivo; resolver el bloqueo de Vercel si sigue siendo el canal; revisar checks del PR y acordar merge/publicación por separado. Crear un PR puede disparar integraciones automáticas existentes; no equivale a una publicación autorizada en producción.

## Validación de esta actualización

- Navegador Chromium mediante Playwright, emulación de escritorio/tablet/móvil: 1440, 1024, 768, 390 y 320 px en ES y EN, sin desbordamiento horizontal.
- Siete fichas y ocho enlaces conservados al cambiar ES ↔ EN; traducciones del catálogo comparadas con su marcado normalizado. RichLife, PapacitoOS y PlayPitch no contienen enlaces de acceso.
- Teclado: Enter abre el menú, Escape lo cierra y devuelve el foco; el enlace Productos enfoca la sección; Tab recorre las acciones del producto. Foco visible y estado `aria-expanded`.
- Inspección visual de capturas ES/EN en escritorio y móvil. El catálogo queda por encima del canvas decorativo existente para mantener contraste. Movimiento reducido desactiva la transformación de sus tarjetas.
- `node --check scripts.js` y `git diff --check` en ambos repositorios sin errores.
- Límite conocido: el muro externo bloquea la petición desde localhost por CORS; la sección existente se oculta según su fallback. No se cambió ese servicio. Prueba móvil emulada, no dispositivo físico. HTTP 200 no valida registros, acceso privado ni funcionalidades completas.
