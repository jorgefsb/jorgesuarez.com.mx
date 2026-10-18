# juice 1.0.0

Motion y sonido de la marca personal. El paquete **no carga fuentes**: no hay `@import` ni `@font-face`.

La página anfitriona debe cargar **Outfit 700** (títulos y sello «Listo») e **Inter 400** (menú, leyenda y cuerpo). El CSS usa:

- Cuerpo (`.juice-sfx`, `.jz-lvl`, `.jz-feel`, `.jz-panel`, leyenda, `.jz-steps`): `font-family: var(--brand-font-body, Inter, system-ui, sans-serif)` peso 400
- Sello (`.jz-stamp`): `font-family: var(--brand-font-heading, Outfit, Inter, system-ui, sans-serif)` peso 700

Si el host ya define `--brand-font-body` y `--brand-font-heading`, se respetan.
