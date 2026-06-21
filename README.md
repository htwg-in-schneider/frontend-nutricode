# NutriCode – Frontend

Vue-3-Single-Page-Application für den Ernährungsplaner **NutriCode** (HTWG Konstanz, Webentwicklung). Das Frontend kommuniziert per REST mit dem Spring-Boot-Backend und nutzt Auth0 für die Anmeldung.

- **Live (GitHub Pages):** https://htwg-in-schneider.github.io/frontend-nutricode/
- **Backend (render.com):** https://nutricode-backend.onrender.com

## Tech-Stack
- **Vue 3** (Composition API, `<script setup>`)
- **Vite** (Build & Dev-Server)
- **vue-router** (Routing inkl. Route-Guards)
- **Pinia** (State Management)
- **@auth0/auth0-vue** (Authentifizierung)

## Architektur

### Routing (`src/router/`)
- `vue-router` im History-Mode, `base` = `/frontend-nutricode/` (siehe `vite.config.js`).
- **Drei Zugriffsebenen** über Route-Guards (`beforeEnter`):
  - **öffentlich** (kein Guard): Startseite, `/gerichte`, Detailseiten, Impressum, Datenschutz.
  - **eingeloggt** (`authGuard` von Auth0): `/profil`, Gericht anlegen/bearbeiten, `/ernaehrungsplan*`.
  - **Admin** (`adminGuard` in `src/router/adminGuard.js`): alle `/admin*`-Routen (prüft die ADMIN-Rolle aus dem Token; verbindlich zusätzlich im Backend).

### Komponenten (`src/views/`, `src/components/`)
- **Views** = Seiten (an Routen gebunden), z. B. `Home`, `DishCatalog`, `MealPlanWizard`, `AdminDishes`, `AdminUsers`.
- **Wiederverwendbare Komponenten** in `src/components/`: `Button`, `DishCard`, `DishFilter`, `Navbar`, `Footer`, `SpecialBanner` u. a. – per Props konfiguriert und mehrfach genutzt.

### State Management
- **Pinia-Store** `src/stores/banner.js` für den schließbaren Hinweis-Banner (geteilter UI-Zustand).
- **Composables** (`src/composables/`) kapseln geteilte Logik/Zustand:
  - `useApi()` – `fetch`-Wrapper, der bei eingeloggten Nutzer:innen automatisch das Auth0-Bearer-Token anhängt.
  - `useRoles()` – stellt `isAuthenticated`, `isAdmin`, `user` aus dem Auth0-Token bereit.
- **Auth0-Zustand** wird zentral vom `@auth0/auth0-vue`-Plugin verwaltet (`src/auth/auth0.js`).

### Konfiguration
- `src/config.js` – `API_BASE` (aus `VITE_API_BASE`) und zentrale Anzeige-Labels (Kategorien, Ziele, Status, Mahlzeiten).
- `src/constants/validation.js` – Validierungsgrenzen (spiegeln das Backend).
- `src/assets/style.css` – globales Stylesheet inkl. **Design-Tokens** (Markenfarben als CSS-Variablen in `:root`).

## Lokale Entwicklung
```bash
npm install
npm run dev          # Dev-Server auf http://localhost:5173
```
Voraussetzungen:
- Eine lokale `.env` mit den `VITE_*`-Variablen (siehe unten). `VITE_API_BASE` zeigt lokal auf `http://localhost:8081`.
- Das Backend lokal starten (`./mvnw spring-boot:run` im Backend-Repo).

### Umgebungsvariablen (`.env` lokal, `.env.production` für den Build)
| Variable | Zweck |
|---|---|
| `VITE_API_BASE` | URL des Backends (lokal `http://localhost:8081`, prod render-URL) |
| `VITE_AUTH0_DOMAIN` | Auth0-Tenant-Domain |
| `VITE_AUTH0_CLIENT_ID` | Auth0-Client-ID (SPA) |
| `VITE_AUTH0_AUDIENCE` | Auth0-API-Audience |
| `VITE_AUTH0_ROLES_NAMESPACE` | Namespace-Claim mit den Rollen |

`.env` (lokal) ist per `.gitignore` ausgeschlossen; `.env.production` ist eingecheckt, weil der CI-Build die Werte braucht (sie sind nicht geheim – SPA-Konfiguration ist im Browser ohnehin sichtbar).

## Build & Deployment
```bash
npm run build        # Produktions-Build nach dist/ (nutzt .env.production)
```
- **GitHub Pages** via GitHub Actions: `.github/workflows/build-and-deploy.yml` baut bei jedem Push auf `main` und veröffentlicht `dist/`.
- Ein SPA-Fallback (`404.html` = Kopie der `index.html`) sorgt dafür, dass auch tiefe Links beim Neuladen funktionieren.

## Hart-codierte Werte (begründet)
Werte sind, wo sinnvoll, in `config.js` / `.env` / `constants/` ausgelagert. Bewusst „hart" bleiben:

| Wert | Ort | Begründung |
|---|---|---|
| Enum-Namen (`BREAKFAST`, `LOSE_WEIGHT`, `DRAFT` …) | `config.js` | Müssen exakt den Backend-Enums entsprechen; zentral als Label-Maps definiert. |
| Rollen `ADMIN` / `USER` | `config`/Views | Kommen aus Auth0; müssen wortgleich sein. |
| Validierungsgrenzen (Tage 1–7, Kalorien 1–10000, Name ≤100) | `constants/validation.js` | Spiegeln bewusst `ValidationLimits.java` – das Frontend prüft vorab, das Backend verbindlich. |
| `http://localhost:8081`-Fallback | `config.js` | Nur Dev-Default, falls keine `.env` gesetzt ist. |
| Markenfarben (Hex-Werte) | `style.css` `:root` | Einmal als CSS-Variablen definiert, überall via `var(--…)` referenziert. |
| Kontakt-E-Mail `kontakt@nutricode.de` | `Home.vue` | Platzhalter-Empfänger des `mailto`-Kontaktformulars. |
