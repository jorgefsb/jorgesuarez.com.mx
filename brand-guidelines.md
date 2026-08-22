# Sistema de marca de Jorge Suárez

Versión 3 · fuente operativa para sitio, GitHub y piezas sociales

Este documento codifica lo que ya existe en `jorgesuarez.com.mx`: no propone una personalidad nueva. La marca parte de una trayectoria real en videojuegos, emprendimiento y construcción de comunidad desde Guadalajara.

## 1. Idea central

**Construyendo juegos, escalando estudios, documentando el viaje.**

Jorge se presenta como veterano de videojuegos y emprendedor, fundador de KaraOkulta y General Manager de Amber México. La autoridad viene de haber construido y aprendido en público, no de sonar como gurú.

La invitación permanente es colaborativa: poner una sonrisa en la cara del jugador y ayudar a que más personas puedan vivir de hacer videojuegos.

## 2. Personalidad

- **Gamer de industria:** habla desde el amor por jugar y por hacer juegos.
- **Builder en la trinchera:** enseña procesos, decisiones y aprendizajes reales.
- **Pionero tapatío:** Guadalajara y México son origen, contexto y comunidad; no decoración folclórica.
- **Operador generoso:** celebra equipos y colaboradores antes que protagonismo individual.
- **Curioso tecnológico:** IA, automatización y nuevas herramientas son parte del loadout, no la identidad completa.

La sensación buscada es: **cálida, energética, juguetona y creíble**. Nunca infantil, solemne o “tech bro” genérica.

## 3. Voz y tono

### Principios

1. **Español primero.** Usar inglés donde sea lenguaje natural de gaming o producto: `build`, `level up`, `co-op`, `loadout`.
2. **Primera persona y verbos activos.** “Fundé”, “aprendí”, “estamos construyendo”, “ven a jugar”.
3. **Documentar, no pontificar.** Compartir la ruta, incluidos los experimentos y el trabajo en progreso.
4. **Comunidad antes que ego.** Invitar a contribuir, conversar o construir juntos.
5. **Hechos antes que adjetivos.** Las métricas o reconocimientos solo aparecen cuando tienen una fuente verificable.

### Frases compatibles

- “Colaborando con el futuro del gaming.”
- “No somos gurús; estamos documentando el viaje.”
- “Bienvenida la partida co-op.”
- “Level up tu carrera en videojuegos.”
- “Ayudar a que más gente pueda vivir de hacer videojuegos.”

### Evitar

- “Visionario”, “revolucionario”, “líder indiscutible” y otros superlativos sin fuente.
- Promesas de resultados garantizados.
- Exceso de jerga corporativa o metáforas gamer en cada oración.
- Presentar forks, mirrors o herramientas privadas como proyectos públicos propios.

## 4. Sistema visual

Los tokens canónicos viven en `styles.css` y se reutilizan en los banners de GitHub.

| Rol | Token | Valor |
|---|---|---|
| Fondo principal | `--bg-primary` | `#0a0a0a` |
| Fondo secundario | `--bg-secondary` | `#111111` |
| Tarjeta | `--bg-card` | `#161616` |
| Acento de marca | `--accent-primary` | `#ff6b35` |
| Acento cálido | `--accent-secondary` | `#ffa500` |
| Texto principal | `--text-primary` | `#ffffff` |
| Texto secundario | `--text-secondary` | `#a0a0a0` |
| Texto discreto | `--text-muted` | `#666666` |
| Borde | `--border-color` | `rgba(255,255,255,.08)` |

### Color por producto

El naranja `#ff6b35` siempre firma la familia. Cada producto puede sumar **un** color funcional:

- Perfil / sitio: ámbar `#ffa500`.
- Master Prompt Builder: violeta IA `#8b5cf6`.
- SparkCrew: usa su sistema de marca propio, manteniendo una firma ámbar discreta del ecosistema.
- Game Industry Resources: verde progreso `#22c55e`.
- LinkedIn Content Automation: azul canal `#0a66c2`.

No usar arcoíris completos. El color secundario identifica el producto; el naranja confirma que pertenece al ecosistema Jorge Suárez.

### Tipografía

- **Titulares:** Outfit, peso 700–800.
- **Cuerpo:** Inter, peso 400–600.
- **Fallback en SVG/GitHub:** `-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif`.
- Monoespaciada solo para labels de interfaz, números de slot o datos técnicos.

### Forma, espacio y movimiento

- Radios: 6 / 12 / 20 px; evitar cápsulas en todos los elementos.
- Escala de espacio: 8 / 16 / 24 / 32 / 48 / 64 / 96 px.
- Fondos oscuros, mucho aire y una línea de energía ámbar.
- Glassmorphism y glow con moderación; el contenido debe seguir legible sin efectos.
- En web, el fluido WebGL representa adaptación y movimiento. En assets estáticos se traduce a gradientes, líneas de energía y capas diagonales.

## 5. Lenguaje gamer y pixel art

El gamer-native vive en la arquitectura: player select, slots, builds, achievements, level up y co-op. Se usa para hacer la navegación memorable, no para disfrazar documentación.

Pixel art es un **acento**: esquinas, cursores, íconos de 8–16 px o patrones. No se pixela el retrato, el cuerpo de texto ni todos los logos.

Iconos:

- Trazo simple, esquinas ligeramente redondeadas y alto contraste.
- Emojis solo como señaladores de sección.
- Logos de canales conservan su color reconocido; no se redibujan de forma ambigua.

## 6. Banners de repositorio

Formato canónico: SVG `1200 × 300`, guardado dentro de cada repositorio como `assets/readme-banner.svg`.

Estructura:

1. Firma superior: `JORGESUAREZ.COM.MX // BUILDER LAB`.
2. Nombre del producto, grande y legible a 50% de escala.
3. Promesa de una línea basada en la función real del repositorio.
4. Tres tags máximos.
5. Motivo propio del producto y acento de color secundario.
6. Línea o esquina ámbar común a toda la familia.

Los banners no dependen de fuentes, imágenes o APIs externas. No incluyen JavaScript, tracking ni texto que deba actualizarse con frecuencia.

## 7. READMEs y comunidad open source

Orden recomendado:

1. Banner local.
2. Promesa breve y enlace verificable a demo cuando exista.
3. Estado honesto (`activo`, `experimento`, `trabajo en progreso`).
4. Qué resuelve y para quién.
5. Quick start reproducible.
6. Estructura y decisiones técnicas.
7. Cómo contribuir o abrir una conversación.
8. Licencia solo cuando el repositorio la declare.

No usar badges externos si el mismo dato puede escribirse como texto. No usar tarjetas de estadísticas servidas por terceros.

## 8. Canales sociales

Canales públicos verificados en el sitio/perfil:

- Sitio: `jorgesuarez.com.mx`
- YouTube: `@jorgefsb`
- LinkedIn: `/in/yorgenmeister`
- X: confirmar que el handle del perfil y el marcado del sitio apunten a la misma cuenta antes de producir una campaña.

### Piezas recomendadas

- **YouTube thumbnail:** 1280 × 720, retrato real, máximo 5 palabras, glow ámbar y un solo elemento gamer.
- **LinkedIn / X card:** 1200 × 628, titular Outfit, contexto en una línea, firma `JorgeSuarez.com.mx`.
- **Avatar:** monograma JS existente; no sustituir por ilustración generada.
- **Copy de lanzamiento:** problema real → aprendizaje de la trinchera → invitación concreta. Evitar promesas de crecimiento.

Plantilla corta:

> 🎮 Nuevo build: **[nombre]**<br>
> Lo construimos para **[problema verificable]**.<br>
> Ya puedes probarlo / revisar el código: **[enlace]**<br>
> Si tienes feedback, bienvenida la partida co-op.

Estas son recomendaciones y assets de preparación. Las cuentas sociales no se modifican sin autorización explícita.

## 9. Gobernanza y procedencia

- El sitio, su `styles.css` y este documento son la fuente de verdad personal.
- El sistema Sparkplug solo rige piezas de Sparkplug/SparkCrew; no sustituye la identidad personal de Jorge.
- Material de TecniMoto u otros proyectos no define esta marca.
- Antes de publicar una métrica, premio, puesto o cliente, comprobarlo en una fuente propia u oficial.
- Revisar enlaces y contraste en cada release.
- Los repos archivados y mirrors de terceros no se rebrandizan.
- Evolucionar el sistema por tokens y plantillas compartidas, no con decoraciones aisladas.
