# Auditoría del rollout de marca en GitHub

Fecha: 22 de agosto de 2026

## Procedencia

La marca personal se derivó exclusivamente de fuentes propiedad de Jorge:

1. Sitio y source de `jorgesuarez.com.mx`.
2. Tokens de `styles.css`: carbón `#0a0a0a`, naranja `#ff6b35`, ámbar `#ffa500`, Outfit e Inter.
3. La guía preexistente `brand-guidelines.md`, consolidada como sistema operativo v3.
4. Para SparkCrew únicamente, `Sparkplug_Design_System_and_Brand_Book_v1.md`: Cosmos, Sparkplug Red, Ignition, Plasma, órbita y chispa.

No se usó material de TecniMoto ni de otras marcas para definir la identidad personal.

## Repositorios modificados

| Repositorio | Resultado | Commit inicial del rollout |
|---|---|---|
| `jorgefsb` | Hero gamer, player-select de canales y telemetría local | `bd512a1` |
| `jorgesuarez.com.mx` | Banner, README y sistema de marca reusable | `f6b5ed5` |
| `master-prompt-builder` | Banner IA + intro/quick start comunitario | `4bfa2a1` |
| `sparkcrew-landing` | Banner fiel a Sparkplug + README nuevo | `fae0142` |
| `game-industry-resources` | Banner comunidad/LATAM + claims y enlaces saneados | `a8ccd0f` |
| `linkedin-automation-template` | Banner canal + métricas reformuladas como validación | `b981aea` |

## Exclusiones deliberadas

- `lobsterpad-site`: sin cambios; el source se atribuye a DAMediaCo y enlaza repositorios de otro owner.
- `GhostLNK-App`, `GusiMoji-Android`, `yuppics2.0`, `WTA`, `common`, `beam-interactive-node`: sin cambios; archivados.
- Forks: fuera de alcance.
- Cuentas sociales externas: no se modificaron. La guía contiene formatos y copy recomendados para una activación posterior.

## Infraestructura y enlaces

| Dominio | Resultado |
|---|---|
| `mpb.jorgesuarez.com.mx` | Restaurado en Cloudflare Workers; HTTP 200. |
| `sparkcrew.jorgesuarez.com.mx` | Restaurado en Cloudflare Workers; HTTP 200. |
| `gamedev.jorgesuarez.com.mx` | Restaurado en Cloudflare Workers desde el `CNAME` del repositorio; HTTP 200. |

Los Workers deshabilitan `workers.dev` y preview URLs. Los despliegues usan artefactos limpios, sin `.git` ni configuración local.

## QA final

- 24 URLs únicas retenidas en los READMEs respondieron HTTP 200.
- Todos los SVG pasan validación XML.
- Todos los READMEs pasan el renderer de Markdown de GitHub.
- Se verificó públicamente en GitHub que los seis banners cargan desde cada repositorio con su tamaño natural.
- En el perfil, las cuatro barras sociales y la telemetría cargan desde `jorgefsb/jorgefsb`, sin dependencias de tarjetas externas.
