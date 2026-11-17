# Euskara Praktika

App para practicar euskera entre clases (A1 y A2 completos): repaso espaciado frase a frase, dictados con voz, gramática, retos con tu círculo y ranking semanal. Node + Express + SQLite, PWA instalable; pensada para publicarse en las stores como TWA.

## Desplegar en Railway

1. Nuevo proyecto desde este repo. Añadir un **volumen** montado en `/data`.
2. Variables:
   - `DB_PATH=/data/app.db` · `NODE_ENV=production`
   - `APP_SECRET` — cadena larga aleatoria (firma los códigos de acceso).
   - `ADMIN_KEY` — clave del panel `/admin`.
   - `RESEND_API_KEY` y `MAIL_FROM` (p. ej. `Euskara Praktika <kaixo@tudominio.eus>`) — envío de los códigos de acceso. Sin ellas la app funciona en modo pruebas y muestra el código en pantalla.
   - `GOOGLE_TTS_KEY` — voz en euskera (Google Cloud Text-to-Speech, `eu-ES-Standard-A`). Opcional: `TTS_PROVIDER`, `GOOGLE_VOICE`.
   - `VAPID_PUBLIC`, `VAPID_PRIVATE`, `VAPID_SUBJECT` — avisos push (`npx web-push generate-vapid-keys`).
   - `STRIPE_SECRET_KEY` — activa Premium (suscripciones mensual/trimestral/semestral; producto, precios y webhook se crean solos por API). Opcionales: `STRIPE_WEBHOOK_SECRET` (si el webhook se crea a mano), `STRIPE_TAX=0` (desactiva Stripe Tax), `APP_URL` (URL pública, para las vueltas del checkout), `FREE_MODULES` (módulos gratis, por defecto 1).
   - `ANDROID_SHA256` (y opcional `ANDROID_PACKAGE`) — huellas de la app Android para `/.well-known/assetlinks.json`.
3. Dominio propio en Settings → Domains (CNAME en el registrador).

## Cuentas

Email + código de 6 cifras (10 minutos, 5 intentos, máximo 5 códigos por hora y correo). Sesión en cookie `httpOnly` durante un año. El nombre es solo para mostrar y no es único: la gente se busca por nombre en Taldea y se añade a su círculo; solo el círculo puede retar y compararse. Borrado de cuenta desde Profila (confirmando el correo) o por `/admin`.

## Admin

`/admin` con `ADMIN_KEY`: métricas (altas, activos, embudo, retención D1/D7/D30, lecciones, frases más difíciles, ciudades), buscador de usuarios, borrado y descarga de copia de la base de datos.

## Contenido

Todo en `public/lessons.js`: `MODULES` (16 módulos: 8 del A1, Baiona → Portugalete, y 8 del A2, Durango → Maule; cada uno con un pueblo del camino y `level`), `LESSONS` (84 lecciones: pares, frases, patrón, consejos, diálogo, escena), `GRAMMAR` (66 fichas con tabla, ejemplos y drills), `NOTES` (explicaciones que saltan al fallar) y `TRANSFORMS` (transformaciones por frase). El castellano es la clave; las traducciones al inglés van en `public/i18n-content.js` y al francés en `public/i18n-fr.js`. Al añadir contenido, subir el número de caché en `public/sw.js`.

Para añadir una lección: entrada en `LESSONS` con `module`, `eu` (título en euskera) y `title` (castellano); después, las cadenas nuevas en castellano se traducen a inglés y francés (un script que compare claves contra `EN`/`FR` las lista). Las fichas de gramática se colocan en el camino detrás de la primera lección de su lista `lessons`.

## Desarrollo

```
npm install
APP_SECRET=dev ADMIN_KEY=dev node server.js   # http://localhost:3000 (modo pruebas: el código sale en pantalla)
```
