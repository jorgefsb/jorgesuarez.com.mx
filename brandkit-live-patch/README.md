# Parche para brandkit.jorgesuarez.com.mx

El BrandKit vivo no vive en este repositorio: se publica desde un sitio de ChatGPT con dominio propio. Este paquete es una propuesta para pegar a mano. No despliega nada.

## Contenido

- `original/` — HTML, CSS y JS bajados de https://brandkit.jorgesuarez.com.mx/ (sin imágenes ni ZIP).
- `propuesta/` — la misma base, con los cambios de abajo.
- `cambios.diff` — `diff -ru original propuesta`.

## Qué cambia (todo aditivo)

1. Los wordmarks del header y del footer apuntan a https://jorgesuarez.com.mx.
2. Versión en inglés completa: conmutador ES | EN con `data-es` / `data-en` (y `lang.js`).
3. Regla de marca **Ida y vuelta / Round trip**: toda página o micronegocio de la marca personal liga a jorgesuarez.com.mx con una forma clara de regresar; la principal siempre liga a ellos.
4. Liga a Plantillas de reporte: https://jorgesuarez.com.mx/brandkit/plantillas-reporte/

Archivos nuevos en `propuesta/`: `lang.js` y `ida-vuelta.css`.

## Cómo aplicarlo

1. Abrir el sitio de ChatGPT que publica brandkit.jorgesuarez.com.mx.
2. Sustituir el HTML por `propuesta/index.html`.
3. Sustituir `app.js` y `brand-data.js` por las copias de `propuesta/`.
4. Subir `lang.js` y `ida-vuelta.css` junto a `styles.css` y `app.js`. El HTML ya los enlaza.
5. Comprobar en celular y escritorio:
   - wordmarks del header y del footer, y la barra «← JorgeSuarez.com.mx», llevan a https://jorgesuarez.com.mx
   - ES | EN cambia el contenido
   - la sección Ida y vuelta: al llegar por ancla, la etiqueta de fecha y el título quedan completos debajo del header
   - a 375 px, «In progress» / «En desarrollo» no tapa la línea de fecha del header
   - la tarjeta Plantillas de reporte
6. No tocar DNS, CNAME ni la configuración del dominio.

Vista previa local: servir `propuesta/` con cualquier servidor estático (`python3 -m http.server`) y abrir `/?lang=es` y `/?lang=en`.
