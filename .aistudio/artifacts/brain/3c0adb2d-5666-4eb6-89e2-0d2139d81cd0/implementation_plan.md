# Dedicated `/mist-fan` Product Page Route, Base Link Redirect & Admin Product Pages Manager

Configure the High Quality 5-Jet Mist Fan as its own dedicated product page at `/mist-fan` (`https://advibestudio.github.io/commerce/mist-fan`), automatically redirect visitors who land on the base link (`https://advibestudio.github.io/commerce/`) straight to `/mist-fan`, and integrate a **Product Pages Manager** inside `/admin` > **Sheet & Settings** so you can manage this product page and future product pages while keeping the existing Admin mobile/desktop UI and UX completely intact.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and routing decisions have been confirmed:

- **Dedicated Product Page URL (`/mist-fan`)**:
  - Public product URL on GitHub Pages: `https://advibestudio.github.io/commerce/mist-fan`
  - Visiting the base storefront URL (`https://advibestudio.github.io/commerce/`) automatically forwards visitors directly to `https://advibestudio.github.io/commerce/mist-fan` with zero reload lag (`window.history.replaceState`), while direct visits to `/commerce/mist-fan` resolve with `HTTP 200 OK` via a pre-generated `dist/mist-fan/index.html` entry point in `.github/workflows/deploy.yml`.
- **Product Pages Manager in Admin (Zero Change to Existing Admin UI/UX)**:
  - Preserves your exact 3-tab mobile & desktop Admin UI/UX (**Orders**, **Revenue & States**, **Sheet & Settings**).
  - Adds a compact **Product Pages & Direct Links Manager** inside the **Sheet & Settings** tab where you can view all product pages, copy the direct `/mist-fan` link (`https://advibestudio.github.io/commerce/mist-fan`) with one tap, configure which product page the base URL (`/commerce/`) redirects to, and manage each product page's pricing, stock, and videos.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. Gives the High Quality 5-Jet Mist Fan its own dedicated route (`/mist-fan`) so you can add more standalone product sales pages under `https://advibestudio.github.io/commerce/<product-slug>` in the future.
  2. Automatically routes anyone visiting the root URL (`https://advibestudio.github.io/commerce/`) straight to `/commerce/mist-fan` (or whichever product is set as your Primary Base Redirect in Admin).
  3. Ensures all images, cached demo videos, Meta Pixel events (`PageView`, `ViewContent`, and Thank You `/mist-fan#thank-you` `Purchase`), and Google Sheet sync work seamlessly from `/commerce/mist-fan`.
- **Target Audience / Persona**: Shoppers clicking your Facebook/Instagram ad links (`https://advibestudio.github.io/commerce/` or `https://advibestudio.github.io/commerce/mist-fan`) and the store owner managing multiple product landing pages from `/admin`.
- **Key Value**: Future-proofs your storefront for multiple products while keeping the current Mist Fan funnel as the instant default destination.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Visitor Opens Base Link (`https://advibestudio.github.io/commerce/`)**:
     - Instantly redirects to `https://advibestudio.github.io/commerce/mist-fan` without a white-screen flash.
     - Meta Pixel fires `PageView` and `ViewContent` for the `/mist-fan` product page.
  2. **Visitor Opens Direct Product Link (`https://advibestudio.github.io/commerce/mist-fan`)**:
     - Loads the dedicated Mist Fan sales page directly (`HTTP 200 OK` on GitHub Pages).
     - Submitting an order transitions to `https://advibestudio.github.io/commerce/mist-fan#thank-you`, firing the Meta Pixel `Purchase` event with the dynamic `NGN` order total.
  3. **Admin Manages Product Pages (`/admin` > `Sheet & Settings`)**:
     - The existing mobile bottom navigation bar, 2×2 KPI summary cards, and touch-friendly order cards remain 100% unchanged.
     - Inside **Sheet & Settings**, a **Product Pages Manager** card displays the active **High Quality 5-Jet Mist Fan (`/mist-fan`)** page with 1-tap **Copy Product Link**, **Open Page**, **Base URL Redirect Toggle** (`Redirect /commerce/ -> /commerce/mist-fan`), and **+ Add New Product Page** support for future products.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Static Entry Generation for `/mist-fan`, `/admin`, and `/admin-app` in GitHub Actions**
  - *Chosen Approach*: In `.github/workflows/deploy.yml`, generate static route directories (`dist/mist-fan/index.html`, `dist/admin/index.html`, `dist/admin-app/index.html`) alongside `dist/404.html`, and resolve asset paths relative to the `/commerce/` base when accessed from a sub-directory.
  - *Why*: Ensures Facebook Ads crawlers, WhatsApp link previews, and Google Search bots receive a real `HTTP 200 OK` response with full OpenGraph tags when visiting `https://advibestudio.github.io/commerce/mist-fan`.
- **Decision 2: Non-Intrusive Product Selector Inside Settings**
  - *Chosen Approach*: Embed the Product Pages Manager inside the existing **Sheet & Settings** tab rather than adding extra top-level navigation tabs.
  - *Why*: Keeps the 3-button mobile bottom bar and Orders workflow fast, uncluttered, and identical to the layout you already use on your phone.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Multi-Page Storefront & Base Redirect Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│           BASE URL: https://advibestudio.github.io/commerce/            │
│  • Checks active defaultProductSlug ('mist-fan')                        │
│  • Automatically redirects URL -> /commerce/mist-fan                    │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│      DEDICATED PRODUCT PAGE: /commerce/mist-fan                         │
│  • Renders High Quality 5-Jet Mist Fan funnel                           │
│  • Tracks Meta Pixel PageView + ViewContent                             │
│  • Order submission -> /commerce/mist-fan#thank-you (Purchase Event)    │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ Managed via
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│      PRIVATE ADMIN PORTAL: /commerce/admin & /commerce/admin-app        │
│  • Existing Mobile & Desktop UI/UX preserved 100%                       │
│  • Sheet & Settings -> Product Pages Manager:                           │
│    - Active Page: /mist-fan (1-tap Copy Link, Open, Edit Settings)      │
│    - Base Link Redirect Target selector (Default: /mist-fan)            │
│    - Add / Manage additional product pages                              │
└─────────────────────────────────────────────────────────────────────────┘
```
