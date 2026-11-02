# GitHub Pages Deployment, Search SEO & Private Admin Mobile PWA Plan

Equip **ShittuStores by Advibe Studios Commerce** with automated GitHub Pages deployment (`.github/workflows/deploy.yml`), rich Google Search SEO structured data, and a private, installable **Admin Order Manager PWA** for your phone that remains completely hidden from public shoppers.

## User Review & Critical Decisions

> [!IMPORTANT]
> This plan implements your exact selections from the questions:

- **GitHub Pages Deployment (`.github/workflows/deploy.yml`) + Direct Google Sheet Sync**:
  - Automatically builds and deploys your site to GitHub Pages whenever you push to `main`.
  - Includes a `404.html` SPA router fallback so visiting `/admin` or `/admin-app` directly on GitHub Pages works without 404 errors.
  - Upgrades the order form and admin dashboard so they work both with the Node backend **and** directly with your Google Sheet Apps Script Web App URL (`doPost` for saving orders and `doGet` for loading all orders into your Admin Mobile App when hosted on static GitHub Pages).
- **Private Admin-Only Mobile PWA (`/admin` & `/admin-app`)**:
  - **100% Hidden from Public Shoppers**: The public sales page (`/`) has zero install buttons, zero admin links, and does not advertise the admin manifest.
  - **Launches Straight into Admin Mode**: When installed from `/admin` (after passcode unlock) or from the dedicated `/admin-app` secret installer page, the app icon on your phone (**`ShittuAdmin`**) launches directly into the Admin Order Portal (`?view=admin`) in standalone full-screen mobile app mode.
- **Google Search Visibility (SEO) & Admin Privacy**:
  - Adds **Schema.org JSON-LD (`Product` + `FAQPage`)** structured data, OpenGraph/Twitter social cards, `sitemap.xml`, and `robots.txt` (`Allow: /` for the sales page, while setting `Disallow: /admin` and `Disallow: /admin-app` so your admin pages are never indexed on Google).

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Automated GitHub Pages CI/CD**: Provides a production-ready `.github/workflows/deploy.yml` workflow that builds the Vite app, packages all product images and cached demo videos using relative base paths (`./`), and publishes to GitHub Pages.
  2. **Search Engine Optimization (SEO)**: Embeds rich product schema (`₦40,500 – ₦45,500`, `NGN`, `InStock`, 5-star buyer reviews, and FAQ structured data) so Google Search displays rich snippets for **ShittuStores by Advibe Studios Commerce**.
  3. **Private Admin Mobile App (PWA)**: Configures a dedicated Admin Web App Manifest (`admin-manifest.json`), compliant `192x192`, `512x512`, `maskable`, and `apple-touch-icon` PNG icons, service worker caching, and an interactive **Install Admin App** experience inside `/admin` and `/admin-app`.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Installing the Admin App on Your Phone (`/admin-app` or `/admin`)**:
   - On your phone (Android Chrome or iPhone Safari), you open your secret URL (`<your-site>/admin-app` or `<your-site>/admin`) and enter your Admin Passcode (`1234`).
   - Inside `/admin-app` (or via the **Install Mobile App** button in the `/admin` top bar), you see a dedicated **ShittuStores Admin Mobile App** card showing app status, offline readiness, and a primary **"Install Admin App to Phone"** button (with automatic 1-tap install on Android and a clear 2-step **"Share → Add to Home Screen"** visual guide on iPhone/iOS).
   - Once installed, tapping **ShittuAdmin** on your phone's home screen opens directly into your Order Pipeline in standalone mobile app view.
2. **Managing Orders on Your Phone via Google Sheets**:
   - Even when hosted on static GitHub Pages, your Admin Mobile App fetches the latest orders directly from your Google Sheet via the upgraded Apps Script URL (`doGet`) and syncs status changes (`Pending` → `Confirmed` → `Dispatched` → `Delivered`) back to the sheet (`doPost`).
3. **Public Shopper Experience (`/`)**:
   - Shoppers visiting your main link see only the fast-loading sales page, product carousel, protected demo videos, Pay-on-Delivery order form, and FAQ accordions—with no trace of the admin app.

---

## 3. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     DEPLOYMENT & PRIVATE ADMIN PWA FLOW                      │
├──────────────────────────────────────┬───────────────────────────────────────┤
│   PUBLIC STOREFRONT (Indexed SEO)    │   PRIVATE ADMIN PWA (Noindex/Hidden)  │
│   Route: /                           │   Routes: /admin & /admin-app         │
│                                      │                                       │
│  ┌────────────────────────────────┐  │  ┌─────────────────────────────────┐  │
│  │ Schema.org Product + FAQPage   │  │  │ Passcode Gate (Default: 1234)   │  │
│  │ OpenGraph + Sitemap + Robots   │  │  ├─────────────────────────────────┤  │
│  ├────────────────────────────────┤  │  │ Dynamic Admin Manifest Injection│  │
│  │ Direct Apps Script Order POST  │  │  │ - Name: ShittuStores Admin      │  │
│  │ (Works on GitHub Pages & Node) │  │  │ - Short Name: ShittuAdmin       │  │
│  └───────────────┬────────────────┘  │  │ - Start URL: ./?view=admin      │  │
│                  │                   │  ├─────────────────────────────────┤  │
│                  │                   │  │ In-App Install Prompt UI        │  │
│                  │                   │  │ - Android beforeinstallprompt   │  │
│                  │                   │  │ - iOS Safari Home Screen Guide  │  │
│                  │                   │  └────────────────┬────────────────┘  │
└──────────────────┼───────────────────┴───────────────────┼───────────────────┘
                   │ doPost (Create Order)                 │ doGet / doPost
                   ▼                                       ▼ (Read & Update)
┌──────────────────────────────────────────────────────────────────────────────┐
│             GOOGLE SHEETS APPS SCRIPT WEB APP + LOCAL PERSISTENCE            │
└──────────────────────────────────────────────────────────────────────────────┘
```
