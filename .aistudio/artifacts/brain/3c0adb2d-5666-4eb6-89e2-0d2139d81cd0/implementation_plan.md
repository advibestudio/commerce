# Mobile-First Admin App UI/UX & Google Sheet Connection Fix

## 1. Pre-Connect Your Google Sheet & Fix "Failed to fetch" Error
- **Pre-Save Both URLs Automatically**: Pre-configure your Google Apps Script URL (`https://script.google.com/macros/s/AKfycbyAFkq7GmB_RvDm8oWP4Ryu-46RQt8FCTlHVBNfsf7QKvImg-IhyYMgqxkAYw1yzo6R/exec`) and your Google Sheet URL (`https://docs.google.com/spreadsheets/d/15cwE3DwlRZOm9NG8Cq-5jILCSgX53aq9df186HlypPs/edit?gid=0#gid=0`) across the backend (`server.ts` / `data/store.json`) and frontend defaults (`App.tsx` / `AdminDashboard.tsx`) so they are permanently connected on both AI Studio and GitHub Pages without needing to paste them manually.
- **Fix Browser `Failed to fetch` on Google Apps Script**:
  - When a browser posts directly to `script.google.com/macros/s/.../exec`, Google responds with a `302` redirect to `script.googleusercontent.com`, which causes mobile browsers to throw `TypeError: Failed to fetch` under standard CORS mode.
  - Update `postToGoogleAppsScriptDirect` in `src/types.ts` to use `mode: 'no-cors'` with `Content-Type: text/plain;charset=utf-8` when calling from the browser, and also proxy through `/api/webhook/test` when available, ensuring test pings, new customer orders, and status updates always reach your Google Sheet without throwing `Failed to fetch`.
- **Run Live Verification**: Immediately push a live test sync and all existing orders to your Google Sheet during implementation to verify the connection end-to-end.

## 2. Mobile-First Admin App UI/UX (`ShittuAdmin`)
- **Dedicated Mobile App Header & Fixed Bottom Navigation Bar**:
  - Replace the cramped desktop-only top bar on mobile screens with a clean mobile app header (**ShittuAdmin**, 1-tap **Open Google Sheet** button, **Install App** button, and **Store** link) and a native-style **Fixed Bottom Tab Bar** on phones (`Orders`, `Revenue & States`, `Sheet & Settings`).
- **Touch-Friendly Mobile Order Cards (No Horizontal Table Scrolling)**:
  - On mobile screens (`< 768px`), replace the wide 8-column table with stacked **Mobile Order Cards** featuring:
    - Order ID, timestamp, variant badge (`RECHARGEABLE` / `NON RECHARGEABLE`), quantity, and total amount (`₦45,500`).
    - Customer name, full delivery address (`City · State`), and order/dispatch notes.
    - **1-Tap Call Customer (`tel:`)** button + **1-Tap WhatsApp Customer** button.
    - Full-width touch-friendly **Order Status Pipeline Selector** (`Pending` → `Confirmed` → `Dispatched` → `Delivered` / `Cancelled`) and **Sync to Sheet** button.
- **Compact 2×2 Mobile KPI Grid**: Arrange top metrics in a clean 2-column grid on mobile so you can see Total Revenue, Delivered Cash, and Google Sheet Sync status at a glance without scrolling.
