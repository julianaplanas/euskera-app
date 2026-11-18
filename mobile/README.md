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

`public/index.html` detecta `window.Capacitor` y usa los plugins nativos a través de `window.Capacitor.Plugins`:

- **Avisos** (`@capacitor/push-notifications`): token FCM → `/api/push/subscribe` como `fcm:<token>`.
- **Suscripción** (`@revenuecat/purchases-capacitor`): la pantalla de planes pide `/api/billing` (clave pública `goog_…`
  y usuario `ep_<id>`), configura el SDK, lee la oferta `default` de RevenueCat (paquetes mensual / 3 meses / 6 meses
  = base plans `month` / `quarter` / `half` del producto `premium` en Play) y compra con `purchasePackage`. Después llama a
  `/api/billing/sync`; el servidor consulta a RevenueCat (`REVENUECAT_SECRET_KEY`) o espera el webhook `/api/billing/revenuecat`.
  «Gestionar en Google Play» abre la página de suscripciones de Play; «Restaurar compras» llama a `restorePurchases`.

Tras añadir un plugin: `npm install` en `mobile/` y `npx cap sync android` (actualiza `capacitor.build.gradle`).
