[Español](TECHNICAL.md) | [English](TECHNICAL.en.md)

# Notas técnicas: no son un despliegue

Primero [usa el sitio público](../README.md). Este checkout contiene HTML, CSS, JavaScript y recursos; `package.json` ofrece `npm start`, `npm run dev` (ambos invocan `serve .`) y `npm test` (`node scripts/verify-vendor-sha256.mjs`). `serve` debe estar disponible en tu entorno; no se instaló ni cambió ninguna dependencia aquí. El test comprueba hashes de vendor, no funcionalidad completa.

El README anterior menciona fuente privada v2, un build `site/`, GitHub Pages y Cloudflare; conserva también notas de Vercel. No se accedió al repositorio privado ni se comprobó esa cadena de publicación. Verifica checkout, revisión y responsable antes de tocar hosting. No ejecutar push, rollback ni deploy como parte de esta guía. No se modificaron código de producto, assets runtime, tests, workflows ni paquetes.

Consulta `../reports/docs-brandkit-verification.json` para baseline y verificación de bytes. Bitácoras, auditorías y guía de marca antiguas se conservan como registros; para el canon documental vigente usa [esta guía](REPOSITORY-DOCUMENTATION.md) y el [brandkit oficial](https://brandkit.jorgesuarez.com.mx/).
