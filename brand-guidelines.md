# Sistema de marca de Jorge Suárez

Guía operativa v4 · 28 oct 2026 · para este repo, GitHub y piezas sociales

La fuente de verdad es el BrandKit: **https://brandkit.jorgesuarez.com.mx/** (Kit 0.6 · Maestros 1.0 · Cuaderno 1.0). Este documento resume lo que necesitas para trabajar en repos y piezas rápidas. Si algo de aquí choca con el BrandKit, gana el BrandKit.

La v3 (commit `f6b5ed5`) tomaba `styles.css` del sitio v1 como fuente. Desde el 12 de octubre de 2026 el sitio corre en v2 y la marca se decide en el BrandKit. Lo que cambió está en el registro al final.

## Cómo leer los estados

Cada regla lleva el estado que tiene en el BrandKit:

- **Aprobado:** decisión explícita de Jorge.
- **Heredado:** viene de una fuente anterior (PDF v1 o guía v3).
- **Propuesto:** recomendación por validar.
- **Pendiente:** falta una decisión o una prueba.

Una propuesta publicada o un archivo descargable no equivalen a aprobación.

## 1. Idea central

**Construyendo juegos, escalando estudios, documentando el viaje.** (Heredado)

Jorge se presenta como veterano de videojuegos y emprendedor, fundador de KaraOkulta y General Manager de Amber México. La autoridad viene de haber construido y aprendido en público, no de sonar como gurú.

La invitación permanente es colaborativa: poner una sonrisa en la cara del jugador y ayudar a que más personas puedan vivir de hacer videojuegos.

### Valores: Kaizen & Play (Heredado, PDF v1)

- **Kaizen:** mejorar con lo aprendido. Documentar decisiones, pruebas y errores útiles; explicar qué cambió y por qué.
- **Play:** explorar con intención. La energía lúdica abre posibilidades y da calidez, sin convertir todo en un juego.

### Orden de los temas (Aprobado)

Cuando aparecen los tres temas juntos (navegación, descriptores, secciones, carruseles), el orden es **videojuegos → negocios → IA**. Una pieza puede centrarse en uno solo.

### A quién le hablamos (Aprobado, 12 oct 2026)

1. **Gamers:** que consuman nuestros juegos y contenido.
2. **Gamedevs:** que consuman juegos, contenido, cursos y comunidad para hacer juegos.
3. **Emprendedores y empresarios:** contenido, cursos y productos de la marca personal.

Cada pieza puede dirigirse a uno de los tres.

## 2. Personalidad (Heredado)

- **Gamer de industria:** habla desde el amor por jugar y por hacer juegos.
- **Builder en la trinchera:** enseña procesos, decisiones y aprendizajes reales.
- **Pionero tapatío:** Guadalajara y México son origen, contexto y comunidad, no decoración folclórica.
- **Operador generoso:** celebra equipos y colaboradores antes que el protagonismo individual.
- **Curioso tecnológico:** la IA y la automatización son parte del loadout, no la identidad completa.

La sensación buscada: cálida, energética, juguetona y creíble. Nunca infantil, solemne o "tech bro".

Moki es el alter ego explorador de Jorge ("Moki soy yo"): descubre, se equivoca y construye mundos mientras aprende. Ver sección 6.

## 3. Voz y tono

### Principios (Propuesto, concilia v1 y v3)

1. **Comunidad antes que ego.** Dar crédito a los equipos. "Yo" para la experiencia personal y "nosotros" para lo que se hizo en equipo.
2. **Español primero.** El inglés entra donde es lenguaje natural de gaming o producto: `build`, `level up`, `co-op`, `loadout`.
3. **Pruebas sobre adjetivos.** Verificar cifras, cargos y créditos antes de publicarlos. Nada de promesas grandilocuentes.
4. **Documentar, no pontificar.** Compartir la ruta, incluidos los experimentos y el trabajo en progreso.
5. **Verbos activos.** "Fundé", "aprendí", "estamos construyendo", "ven a jugar".

### Frases compatibles (Heredado)

- "Colaborando con el futuro del gaming."
- "No somos gurús; estamos documentando el viaje."
- "Bienvenida la partida co-op."
- "Level up tu carrera en videojuegos."
- "Ayudar a que más gente pueda vivir de hacer videojuegos."

Frase de muestra aprobada en el BrandKit: "Ideas que se convierten en mundos."

### Evitar

- "Visionario", "revolucionario", "líder indiscutible" y otros superlativos sin fuente.
- Promesas de resultados garantizados.
- Jerga corporativa o metáforas gamer en cada oración.
- Presentar forks, mirrors o herramientas privadas como proyectos públicos propios.
- Rayas largas como pausa, arranques de cumplido, cierres de resumen y vocabulario típico de IA.

## 4. Sistema visual

### Color

La base oscura conserva el foco, el naranja firma la identidad y el beige aporta una superficie cálida y táctil. La dirección está aprobada; los códigos nuevos siguen propuestos.

| Rol | Valor | Estado |
|---|---|---|
| Fondo | `#0A0A0A` | Heredado |
| Superficie / tarjeta | `#161616` | Heredado |
| Naranja firma | `#FF6B35` | Heredado |
| Ámbar | `#FFA500` | Heredado |
| Blanco | `#FFFFFF` | Heredado |
| Papel | `#F4E8D5` | Propuesto |
| Tinta (texto sobre naranja o papel) | `#22211F` | Propuesto |
| Kraft | `#B99168` | Propuesto |
| Texto secundario | `#B7B3AD` | Propuesto |
| Borde | `#8A7E70` | Propuesto |
| Gris histórico | `#666666` | Heredado, no para texto esencial |
| Colores de estado (éxito, error, aviso) | por definir | Pendiente |

Tokens descargables: [JSON y CSS en el BrandKit, sección 02 · Color](https://brandkit.jorgesuarez.com.mx/#color).

Cómo se aplica:

- Blanco o papel sobre oscuro. Tinta sobre naranja.
- El papel acompaña piezas editoriales e ilustración; no vuelve toda la interfaz un tema claro.
- El naranja guía la acción. Nada de neón, RGB ni acabados plásticos para comunicar videojuegos.

### Contraste medido (BrandKit, 11 oct 2026)

| Combinación | Ratio | Uso |
|---|---|---|
| Blanco sobre naranja `#FFFFFF / #FF6B35` | 2.84:1 | No para texto ni borde esencial |
| Tinta sobre naranja `#22211F / #FF6B35` | 5.67:1 | Texto normal |
| Naranja sobre negro `#FF6B35 / #0A0A0A` | 6.98:1 | Texto normal |
| Papel sobre tinta `#F4E8D5 / #22211F` | 13.29:1 | Texto normal |
| Secundario sobre superficie `#B7B3AD / #161616` | 8.67:1 | Texto normal |
| Gris histórico sobre negro `#666666 / #0A0A0A` | 3.45:1 | Solo texto grande o UI |
| Kraft sobre papel `#B99168 / #F4E8D5` | 2.37:1 | No para texto ni borde esencial |

Umbrales: 4.5:1 para texto normal y 3:1 para texto grande o UI esencial. Texto sobre imágenes, transparencias y estados se prueban en contexto.

### Color por producto (Heredado de v3, por revisar)

El naranja `#FF6B35` siempre firma la familia. Un producto puede sumar **un** color funcional, sin arcoíris:

- Perfil / sitio: ámbar `#FFA500`.
- Master Prompt Builder: violeta `#8B5CF6`.
- Game Industry Resources: verde `#22C55E`.
- LinkedIn Content Automation: azul `#0A66C2`.

SparkCrew sale de esta lista: es de Sparkplug y usa la marca de Sparkplug.

### Tipografía (Aprobado como base del kit)

- **Titulares:** Outfit 700.
- **Texto:** Inter 400.
- Solo esos dos pesos. No se sintetizan otros (la v3 permitía 700–800 y 400–600; ya no).
- Monoespaciada solo para datos técnicos.
- Caveat y Kalam solo dentro de la plantilla Cuaderno de campo.
- Fallback en SVG y GitHub, donde no se cargan fuentes: `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`.
- Space Grotesk, Manrope y Space Mono fueron sustitutos provisionales de v1. No se usan.

Escala web (Propuesto): título principal 56/60 px (móvil 36/40), sección 40/46 (móvil 28/34), cuerpo 18/28, interfaz 16/24, notas 14/20, etiquetas de estado 12/18.

### Forma y espacio (Propuesto, candidatos del design system)

- Espaciado: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 px.
- Radios: 6 / 12 / 18 / 24 px y 999 px para pills. Evitar pills en todos los elementos.
- Controles de al menos 44 px, foco visible por teclado y texto visible para cada estado.

### Material: papercraft

El mundo de la marca se puede tocar: fibras, cantos, pliegues, grosor y sombras de contacto. Dos fondos, una misma marca: papercraft negro y papercraft claro.

**Sin glow, sin neón y sin capas de glassmorphism.** La v3 los permitía "con moderación"; el BrandKit los quita. El fluido WebGL fue parte del sitio v1 y no se traduce a brillos en piezas estáticas.

## 5. Firma y favicon (Aprobado, 12 oct 2026)

Firma tipográfica **JorgeSuarez.com.mx** con las curvas de Outfit. No se redibuja ni se deforma; se usan los SVG maestros.

| Variante | Uso |
|---|---|
| A · bicolor | Fondo oscuro |
| B · bicolor | Fondo claro |
| C · monocroma | Fondo oscuro |

- Protección: 1x, igual a la altura de las letras.
- Mínimo digital: 240 px de ancho visible.
- Impresión: 50 mm a 300 ppp. Prueba física pendiente.
- En la variante B el naranja sobre papel mide 2.34:1. Vale para la firma, no para párrafos ni enlaces.

Descarga: [Maestros 1.0](https://brandkit.jorgesuarez.com.mx/#firma-vectorial).

**Favicon:** monograma JS, naranja `#FF6B35` sobre `#0A0A0A`, esquinas 20/100, legible a 16 px. Va en toda página de la marca personal, sin excepción. También es el avatar de la marca.

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

## 6. Moki (diseño aprobado, 12 oct 2026)

Cartón naranja, casco crema, visor oscuro, motas de tinta, botas negras y emblema de control en el pecho. Curioso y cercano: nunca experto infalible ni alumno torpe.

Reglas que no se rompen:

- Parche **MOKI sobre la oreja derecha del personaje** (no la derecha de quien mira).
- Nunca se espeja, ni para corregir una escena.
- Sin cara en el visor.
- Acompaña al retrato de Jorge; no sustituye automáticamente avatar, firma ni retrato.
- Se respetan diseño y proporciones de la hoja de cinco vistas. Se revisa la imagen exportada, no solo el prompt.
- Nunca tapa cifras, botones ni texto que alguien esté leyendo.
- No va en documentos formales, legales, páginas de pago ni en nada de Amber, Arden, Sparkplug o Tecni Moto.

Assets: [Moki con parche derecho, Biblia de Moki 0.1 y kit de producción](https://brandkit.jorgesuarez.com.mx/#moki). Modelado 3D, rig y animación siguen pendientes. La escena 05 está bloqueada para producción por el parche en el lado equivocado.

### Juega y Moki escondido (Aprobado, juice 1.2.0, 19 oct 2026)

Todos los sitios de la marca traen el botón «Juega» con cuatro niveles: Nada, Poquito, Mucho y Hardcore (se desbloquea encontrando a los Mokis del día). El movimiento reducido fuerza Nada. El sonido viene prendido y solo suena después del primer clic.

Código canónico: `jorgefsb/game-industry-resources/juice/1.2.0/`. Los sitios copian la carpeta tal cual y revisan el sha256 contra el manifest. Detalle completo en el BrandKit, sección 07.

## 7. Fotografía

- **Jorge al frente.** El retrato real sostiene su presencia profesional. Se preservan rostro, lentes, piel y proporciones. (Heredado)
- **Jorge + Moki:** composición seleccionada para esta edición (con IA; la camisa conserva el contexto Amber). (Aprobado como aplicación)
- **Retrato neutral para todos los contextos:** pendiente. No asumir que un retrato con logo de Amber sirve para todo.
- **Luz naranja:** contorno naranja para separar a Jorge del fondo negro. Guía para piezas futuras. (Propuesto)
- Sin piel pictórica, halos digitales ni decoración acumulada.

## 8. Movimiento (Propuesto, por probar)

- 180–320 ms para entradas e interacciones.
- 600–900 ms para un ensamblaje narrativo puntual.
- Sin flotación permanente, sin loops infinitos y sin glow.
- Con movimiento reducido, versión estática con el mismo contenido. Sin video automático.

## 9. Lenguaje gamer y pixel art (Heredado de v3)

Lo gamer vive en la arquitectura: player select, slots, builds, achievements, level up y co-op. Sirve para que la navegación se recuerde, no para disfrazar la documentación.

El pixel art es un **acento** (esquinas, cursores, íconos de 8 a 16 px). No se pixela el retrato, el texto ni los logos. El material principal ahora es papercraft; el pixel art queda por validar contra esa dirección.

Íconos de trazo simple, esquinas ligeramente redondeadas y alto contraste. Emojis solo como señaladores. Los logos de canales conservan su color reconocido.

## 10. Plantillas

| Pieza | Plantilla | Estado |
|---|---|---|
| Social 1080 × 1350 | Maestros 1.0 (SVG editable + PNG) | Aprobado |
| Presentación 1920 × 1080 | Maestros 1.0 | Aprobado |
| Vertical 1080 × 1920 | Maestros 1.0, con zonas seguras | Aprobado |
| Reportes, documentos y ebooks | [Cuaderno de campo 1.0](https://brandkit.jorgesuarez.com.mx/plantillas-reporte/) (Typst) con 3 o 4 Mokis nuevos | Canon desde 15 oct 2026 |

Se trabaja desde el archivo editable real. No se sustituye la plantilla por un diseño genérico con los colores de la marca.

## 11. Banners de repositorio (Heredado, colores actualizados)

Formato: SVG de `1200 × 300` en `assets/readme-banner.svg` de cada repo.

1. Firma superior: `JORGESUAREZ.COM.MX // BUILDER LAB`.
2. Nombre del producto, legible al 50% de escala.
3. Promesa de una línea basada en lo que hace el repo.
4. Máximo tres tags.
5. Fondo `#0A0A0A` o superficie `#161616`, firma en naranja `#FF6B35` y, si aplica, el color funcional del producto.
6. Una línea o esquina ámbar `#FFA500` común a la familia.
7. Texto claro con `#FFFFFF` o papel `#F4E8D5`; secundario `#B7B3AD`.

Sin glow, sin fuentes, imágenes ni APIs externas, sin JavaScript ni tracking, y sin texto que haya que actualizar seguido. Moki no entra al banner hasta que exista una versión vectorial aprobada.

## 12. READMEs y comunidad open source (Heredado)

Orden recomendado:

1. Banner local.
2. Promesa breve y enlace verificable a la demo cuando exista.
3. Estado honesto: `activo`, `experimento` o `trabajo en progreso`.
4. Qué resuelve y para quién.
5. Quick start reproducible.
6. Estructura y decisiones técnicas.
7. Cómo contribuir o abrir una conversación.
8. Licencia, solo si el repo la declara.

No usar badges externos si el dato cabe como texto ni tarjetas de estadísticas de terceros.

**Ida y vuelta (Aprobado, 15 oct 2026):** todo sitio o subdominio de la marca personal liga de regreso a https://jorgesuarez.com.mx en header o footer, visible en celular y escritorio. La principal liga a cada uno.

## 13. Canales sociales

- Sitio: `jorgesuarez.com.mx`
- YouTube: `@jorgefsb` (principal) y `@JorgeSuarezGM` (secundario)
- LinkedIn: `/in/yorgenmeister`
- X e Instagram: `@jorgefsb`. Antes de una campaña, confirmar que el marcado del sitio apunte a esas cuentas.

### Piezas recomendadas

- **Miniatura de YouTube:** 1280 × 720, retrato real, máximo 5 palabras, contorno naranja (sin glow) y un solo elemento gamer.
- **Tarjeta para compartir (LinkedIn / X / Open Graph):** 1200 × 630, titular Outfit 700, contexto en una línea y firma JorgeSuarez.com.mx.
- **Historias y lecciones:** un aprendizaje por pieza (problema, proceso, aprendizaje, siguiente paso), con Moki y la escena haciendo visible la idea.
- **Avatar:** monograma JS. No se sustituye por Moki ni por una ilustración generada.
- **Copy de lanzamiento:** problema real → aprendizaje de la trinchera → invitación concreta. Sin promesas de crecimiento.

Plantilla corta:

> Nuevo build: **[nombre]**<br>
> Lo construimos para **[problema verificable]**.<br>
> Ya puedes probarlo o revisar el código: **[enlace]**<br>
> Si tienes feedback, bienvenida la partida co-op.

Estas son recomendaciones. Las cuentas sociales no se tocan sin autorización explícita de Jorge.

## 14. Fronteras de marca

- Este sistema rige la marca personal y todo lo que no sea Amber, Arden, Sparkplug o Tecni Moto.
- Esas cuatro usan su propia marca, su propio favicon y su propia mascota o ninguna. Ni Moki ni este kit van ahí.
- La cara de Jorge no vende Sparkplug.
- En piezas de marca personal, las empresas se nombran como proyectos de Jorge, sin mezclar su identidad visual.

## 15. Gobernanza

- El BrandKit es la fuente de verdad. Este archivo se actualiza cuando el BrandKit cambia, no al revés.
- Lo aprobado después del PDF 0.6 (12 oct, 02:37 y 02:48; 15 y 19 oct) manda sobre el PDF.
- Antes de publicar una métrica, premio, puesto o cliente, comprobarlo en una fuente propia u oficial.
- Revisar enlaces y contraste en cada release.
- Los repos archivados y los mirrors de terceros no se rebrandean.
- El sistema evoluciona por tokens y plantillas compartidas, no con decoraciones sueltas.

### Pendientes del sistema (según el BrandKit)

- Colores de estado.
- Aprobar o ajustar los tokens 0.6 que siguen propuestos.
- Retratos neutrales y variantes por contexto.
- Prueba física de impresión de la firma.
- Moki en 3D, rig y animación; versión vectorial para banners.
- Versión en inglés del BrandKit.

## Registro de cambios

**v4 · 28 oct 2026.** Se alinea con BrandKit 0.6, Maestros 1.0, Cuaderno 1.0 y juice 1.2.0.

- La fuente de verdad pasa de `styles.css` del sitio v1 al BrandKit.
- Se agregan estados (Aprobado, Heredado, Propuesto, Pendiente) a cada regla.
- Se agregan orden de temas, prioridad de públicos, Kaizen & Play y regla de "yo" y "nosotros".
- Color: se suman papel, tinta, kraft, secundario `#B7B3AD` (antes `#A0A0A0`) y borde `#8A7E70`; `#666666` deja de usarse para texto esencial; se agrega contraste medido.
- Tipografía: solo Outfit 700 e Inter 400.
- Se quitan glow y glassmorphism; entra el material papercraft.
- Radios y espaciado pasan a los candidatos del design system.
- Nuevas secciones: firma A/B/C, favicon JS, Moki, Juega, fotografía, movimiento, plantillas, ida y vuelta y fronteras de marca.
- SparkCrew sale del color por producto; se marca la lista como por revisar.
- Canales: se agregan `@JorgeSuarezGM`, X e Instagram `@jorgefsb`; la miniatura de YouTube cambia glow ámbar por contorno naranja; la tarjeta para compartir pasa a 1200 × 630.

**v3 · commit `f6b5ed5`.** Primera guía operativa: tokens del sitio v1, banners, READMEs y canales.
