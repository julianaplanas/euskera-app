# Apps nativas (Capacitor)

La app de Google Play (y más adelante la de App Store) es un contenedor nativo que carga
`https://www.euskarapraktika.eus`. Así cada deploy del servidor actualiza la app sin pasar por la tienda.

- `capacitor.config.json`: identificador `eus.euskarapraktika.app`, nombre, URL que carga.
- `www/index.html`: lo único local; se muestra si no hay conexión.
- `assets/`: icono y splash fuente (`npm run assets` regenera los de Android a partir de `../public/olentzero.svg`).
- `android/`: proyecto Android generado (`npx cap add android`); se versiona para que GitHub lo compile.

## Compilar

No hace falta Android Studio: el workflow `.github/workflows/android.yml` compila en GitHub en cada cambio de
`mobile/` o a mano (Actions → Android → Run workflow) y deja dos artefactos: el `.aab` para Google Play y un `.apk`
para instalar directamente en un móvil. Secretos necesarios en el repositorio (Settings → Secrets and variables →
Actions): `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` (la clave de subida; guardar copia fuera
de GitHub: sin ella no se pueden publicar actualizaciones).

`versionCode` = número de ejecución del workflow; `versionName` se indica al lanzarlo a mano (por defecto 1.0.0).

## Dentro de la app

`public/index.html` detecta `window.Capacitor` y, dentro de la app, no muestra precios ni botones de compra
(política de Google Play): la suscripción se gestiona en la web hasta que se añadan las compras dentro de la app.
