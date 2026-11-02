# DESIGN.md · jorgesuarez.com.mx (sitio v2)

Fuente de marca: **BrandKit https://brandkit.jorgesuarez.com.mx/** y `brand-guidelines.md` de este repo. Si algo choca, gana el BrandKit. Este archivo solo resume lo que importa para editar la home y deja escritas las excepciones de marca, para que nadie las "arregle".

## Sistema
- Tokens en `css/v2.css` (`:root` y `[data-theme="papel"]`): fondo `#0A0A0A`, superficie `#161616`, papel `#F4E8D5`, tinta `#22211F`, kraft `#B99168`, borde `#8A7E70`, un solo acento `#FF6B35`.
- Tipografía: Outfit 700 para titulares e Inter 400 para texto. No hay más pesos ni familias.
- Material: papercraft (fibras, cantos, pliegues, sombras de contacto). Dos fondos: papercraft negro y papercraft claro.
- Modo de la superficie: **Persuade**. La home es la portada de la marca personal.

## Excepciones de marca (no se tocan)
- El riel de capítulos de abajo con Moki y banderas (`.quest`) es la firma de navegación del sitio.
- Scrollcraft: secciones fijadas con cues de scroll (`data-sc-*`). El motor `engine/` no se toca.
- El botón «Juega» (juice) con niveles Nada, Poquito, Mucho y Hardcore, y los Mokis escondidos.
- La línea superior de algunas secciones en mayúsculas espaciadas (por ejemplo "VETERANO DE VIDEOJUEGOS & EMPRENDEDOR") es parte del lenguaje heredado del sitio v2. Se conserva hasta que el BrandKit diga otra cosa.
- El texto de la palabra destacada con `.text-gradient` es parte del sistema v2 aprobado.
- Moki: parche MOKI en la oreja derecha anatómica, nunca espejado.

## Reglas al editar
- Textos y afirmaciones no se cambian sin Jorge. Todo texto nuevo en español mexicano y en lectura fácil.
- Movimiento reducido: misma información, sin animación.
- Navegación: todo debe alcanzarse en un clic desde arriba (menú y menú Laboratorio) o desde el mapa del pie.
