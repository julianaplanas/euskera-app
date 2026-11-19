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


## iOS (preparado; falta la cuenta de Apple)

El proyecto está en `mobile/ios` (Capacitor + SPM, mismo `appId` `eus.euskarapraktika.app`, iconos y splash generados, orientación vertical,
avisos por Firebase enganchados en `AppDelegate.swift`, modo de fondo `remote-notification`, entitlement `aps-environment`).
`.github/workflows/ios.yml` comprueba que compila en el simulador; `.github/workflows/ios-testflight.yml` archiva, firma y sube a TestFlight
(a mano, con los secretos que se indican en el propio archivo).

Avisos: en Android y en iOS se usa el mismo plugin, `@capacitor-firebase/messaging`, así el servidor manda todo por FCM (HTTP v1) con la
misma cuenta de servicio. Para iOS hacen falta además: la app iOS dada de alta en Firebase (`GoogleService-Info.plist` en `ios/App/App`, añadido
al target en Xcode) y la **clave APNs (.p8)** de Apple subida a Firebase → Configuración del proyecto → Cloud Messaging → Apple apps.

Pasos para publicar:

1. **Apple Developer Program** (99 $/año): developer.apple.com → Account → Enroll (persona física vale; verificación de identidad con DNI, 1-3 días).
2. **Firebase**: añadir app iOS (bundle `eus.euskarapraktika.app`) → descargar `GoogleService-Info.plist`. En developer.apple.com → Keys → crear clave
   con **Apple Push Notifications service (APNs)** → descargar el `.p8` → subirlo en Firebase (Cloud Messaging → Apple app configuration) con el Key ID y el Team ID.
3. **Xcode (en el Mac)**: abrir `mobile/ios/App/App.xcodeproj`, arrastrar `GoogleService-Info.plist` a la carpeta `App` (copiar, target App),
   Signing & Capabilities → «Automatically manage signing» + Team; capabilities **Push Notifications** y **Background Modes → Remote notifications**.
   Product → Run en el iPhone conectado para probar.
4. **App Store Connect**: crear la app (mismo bundle id), ficha con los textos del doc de Play adaptados (capturas de 6,7" y 6,5"),
   política de privacidad `https://www.euskarapraktika.eus/privacy.html`, categoría Educación, 4+.
5. **Compras**: App Store Connect → Suscripciones → grupo «Premium» con `month` / `quarter` / `half` (mismos precios; Apple fija su tabla por país),
   oferta introductoria «7 días gratis» en cada uno, y producto no consumible `premium_lifetime`. Acuerdo de apps de pago firmado en «Acuerdos, impuestos y banca».
   En RevenueCat: añadir la app iOS al mismo proyecto (clave `appl_…` → Railway `REVENUECAT_PUBLIC_KEY_IOS`), In-App Purchase Key (.p8) y
   App-Specific Shared Secret, y mapear los productos a la entitlement `premium` y a la oferta `default`. El servidor ya distingue la tienda (`sub_store`).
6. **Subir**: Xcode → Product → Archive → Distribute → App Store Connect → TestFlight (probadores internos sin revisión) → enviar a revisión.
   O con el flujo `iOS TestFlight` de GitHub Actions una vez puestos los secretos. Apple suele tardar 1-2 días y pide una cuenta de prueba:
   un correo con código y el código de regalo de revisor.
