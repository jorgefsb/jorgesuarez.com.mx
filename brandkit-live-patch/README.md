# Parche para brandkit.jorgesuarez.com.mx · Juice

El BrandKit vivo no vive en este repositorio: se publica desde un sitio de ChatGPT con dominio propio. Este paquete es una propuesta para pegar a mano. **Solo agrega.** No borra ni cambia lo que ya está. No despliega nada.

## Contenido

- `original/` — HTML, CSS y JS bajados de https://brandkit.jorgesuarez.com.mx/ el 18-oct-2026 (sin imágenes ni ZIP).
- `propuesta/` — la misma base, con el bloque Juice y `juice/1.0.0/`.
- `juice/1.0.0/` — paquete oficial (misma copia que `propuesta/juice/1.0.0/`) para servir en https://brandkit.jorgesuarez.com.mx/juice/1.0.0/.
- `cambios.diff` — `diff -ru original propuesta`.
- `juice-index.css` — estilos aditivos de la tarjeta (también copiado en `propuesta/`).

## Qué cambia (todo aditivo)

1. Liga **Juice** en el rail del índice.
2. Tarjeta **Juice** después de la sección Movimiento, con la bajada y un botón a https://jorgesuarez.com.mx/brandkit/juice/.
3. Paquete `juice/1.0.0/` (juice.js, juice.css, juice-menu.js, juice-menu.css) para que todo sitio importe desde el brandkit, no desde gamedev.

No toca wordmark, footer, tokens, Moki, ni ninguna sección existente.

## Cómo aplicarlo

1. Abrir el sitio de ChatGPT que publica brandkit.jorgesuarez.com.mx.
2. Sustituir el HTML por `propuesta/index.html`.
3. Subir `juice-index.css` junto a `styles.css`. El HTML ya lo enlaza.
4. Subir `juice/1.0.0/` a la raíz del kit, para que quede en `/juice/1.0.0/`.
5. Comprobar en celular y escritorio:
   - la liga Juice del rail
   - la tarjeta Juice
   - el botón lleva a la sección
   - https://brandkit.jorgesuarez.com.mx/juice/1.0.0/juice.js responde
6. No tocar DNS, CNAME ni la configuración del dominio.

Vista previa local: servir `propuesta/` con cualquier servidor estático y abrir `/`.
