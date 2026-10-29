# LISTIVO Chrome Extension — Phase 8A Foundation

The **LISTIVO Chrome Extension** is an official companion assistant for authenticated sellers using the LISTIVO e-commerce catalog platform. It runs on Chrome Extension **Manifest V3** and allows sellers to seamlessly connect their LISTIVO catalog workspace to seller portals like Meesho, Flipkart, Amazon, and Myntra.

---

## 📁 Directory Architecture

```
extension/
  ├── manifest.json              # Chrome Extension Manifest V3 configuration
  ├── background/
  │   └── service-worker.ts      # Background service worker (message router & session handshake)
  ├── content/
  │   ├── content-script.ts      # Shadow DOM injection & floating LISTIVO trigger
  │   └── marketplace-detector.ts # Domain detector (Meesho, Flipkart, Amazon, Myntra)
  ├── popup/
  │   ├── index.html             # Extension popup container
  │   ├── Popup.tsx              # React state views (NOT CONNECTED, CONNECTING, CONNECTED, EXPIRED, ERROR)
  │   ├── main.tsx               # React mount entry
  │   └── popup.css              # LISTIVO dark theme styling
  ├── shared/
  │   ├── types.ts               # Shared TypeScript DTOs & state interfaces
  │   ├── constants.ts           # Storage keys, server defaults & marketplace configs
  │   ├── messaging.ts           # Strongly-typed message-passing contract
  │   ├── storage.ts             # Chrome storage API wrapper with fallback
  │   └── api.ts                 # LISTIVO backend API client
  ├── icons/                     # Extension branding icons (16px, 48px, 128px)
  └── dist/                      # Compiled unpacked extension ready for Chrome loading
```

---

## ⚡ Key Features (Phase 8A Foundation)

1. **Manifest V3 Compliant**: Built strictly with standard MV3 service workers and declarative content scripts.
2. **LISTIVO Brand Identity**: Deep slate `#0B0F19` canvas, indigo/purple gradients, and official LISTIVO typography.
3. **Five Reactive States**:
   - `NOT CONNECTED`: Shows "Connect LISTIVO" CTA leading to login.
   - `CONNECTING`: Animated loader checking seller session handshake.
   - `CONNECTED`: Displays active seller full name, business store name, and quick navigation links.
   - `SESSION EXPIRED`: Gracefully prompts seller to re-authenticate.
   - `ERROR`: Provides clean human-readable error messages with a Retry option.
4. **Tenant Isolation & Auth**: Shares the authenticated seller's web session token without storing sensitive passwords or secrets in extension storage.
5. **Marketplace Detection Engine**: Recognizes Meesho, Flipkart, Amazon, and Myntra hostnames without modifying form fields yet.
6. **Shadow DOM Floating Control**: Injects a clean `#listivo-extension-root` shadow DOM on seller portals with a "Fill with LISTIVO →" preparation panel.
7. **Development Mode Indicator**: Displays a banner when running development builds.

---

## 🛠️ How to Build & Load the Extension Locally

### 1. Build the Extension
In your project root, run:
```bash
npm run build:extension
```
This compiles the TypeScript files (`service-worker.ts`, `content-script.ts`, `Popup.tsx`) into standalone browser bundles inside `/extension/dist/`.

### 2. Load into Google Chrome
1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click the **Load unpacked** button in the top-left menu.
4. Select the `/extension/dist/` folder from this project repository.
5. The **LISTIVO — Marketplace Listing Assistant** will be installed and active in Chrome.

---

## 🔐 Security & Tenant Isolation Model

- **Server-Resolved Identity**: The extension never constructs or authorizes requests using arbitrary `userId` parameters supplied by the client. All identity resolution happens server-side via token authentication (`getAuthUser`).
- **No Stored Passwords or Secrets**: Neither seller passwords nor Gemini API keys are placed in extension local storage or manifest files.
- **Least-Privilege Permissions**: Requests only `storage` and `activeTab` permissions.
- **Zero Raw Traces**: API error responses return sanitized, human-readable strings.

---

## 📡 Message-Passing Contract (`messaging.ts`)

| Message Action | Purpose |
|---|---|
| `GET_AUTH_STATUS` | Queries background service worker for seller authentication state |
| `CONNECT_LISTIVO` | Establishes authenticated seller session with LISTIVO server |
| `DISCONNECT_LISTIVO` | Clears active session tokens from storage |
| `GET_SELLER` | Retrieves current authenticated seller profile |
| `GET_TEMPLATES` | Fetches lightweight template DTOs owned by seller |
| `GET_TEMPLATE` | Retrieves full single template data for listing preparation |
| `GET_LISTING` | Fetches seller's draft and ready product listings |
| `MARKETPLACE_DETECTED` | Sent by content script when a seller marketplace URL loads |

---

## 🌐 Backend Integration Endpoints (`server.ts`)

- `GET /api/extension/status`: Handshake endpoint returning real connection state and authenticated seller details.
- `GET /api/extension/me`: Returns current authenticated seller profile.
- `GET /api/extension/templates`: Returns seller-owned listing templates.
- `GET /api/extension/templates/:id`: Returns single template details.
- `GET /api/extension/listings`: Returns seller product listings.

---

## 🚀 Roadmap: Phase 8B Preview

Phase 8A establishes the full extension foundation, messaging system, auth pipeline, and DOM injection roots.

**Phase 8B (Meesho Autofill Engine)** will implement:
- Dynamic selector mapping for Meesho supplier form fields (Title, Description, Category, GST, HSN, Price, MRP, Variants, Images).
- One-click template application from floating control directly into Meesho input fields.
- Form field validation and real-time mapping highlights.
