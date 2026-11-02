# Bora Direct Offer Sales Page & Order Management System

A high-conversion, single-page direct-response sales storefront modeled directly after the Bora Stores "High Quality Mist Fan with Colour Changing LED Light" layout, paired with a full-stack order tracking backend and real-time Google Sheets synchronization via Google Apps Script.

## User Review & Critical Decisions

> [!IMPORTANT]
> All product, pricing, integration, and dashboard preferences from your answers have been incorporated into this plan:

- **Google Sheets Integration via Apps Script**: Orders are saved immediately to the backend database and automatically pushed to your Google Sheet via a Google Apps Script Web App URL. The Admin Dashboard includes a built-in **Google Apps Script Setup Guide & Code Generator** (so you can copy-paste the exact `doPost` script into your Google Sheet in 60 seconds), a **Test Webhook** button, and 1-click **Retry / Sync All** for any unsynced orders.
- **Updated Variant Pricing**:
  - **Rechargeable Mist Fan**: `₦45,500`
  - **Non-Rechargeable Mist Fan**: `₦40,500`
  - Original strikethrough reference price adjusted proportionally (`₦58,000`) with dynamic price range (`₦40,500 – ₦45,500`) in the hero offer banner.
- **Hero Image Carousel Slider**: The first product visual section features an interactive multi-image carousel slider loaded with all your uploaded product images, complete with touch/swipe support, prev/next controls, thumbnail strip, auto-play pause on hover, and fullscreen zoom inspection.
- **Admin Dashboard & Order Pipeline**: Protected by an Admin Passcode, featuring a status pipeline (`Pending` → `Confirmed` → `Dispatched` → `Delivered` / `Cancelled`), one-click **WhatsApp Follow-Up** links formatted for Nigerian phone numbers (`+234`), state-by-state order breakdown, revenue analytics, and editable store settings (YouTube Shorts video link, Apps Script URL, stock count, and pricing).

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Customer Storefront View**: Replicates the exact persuasive flow and structure of the Bora Stores PDF—announcement header, flash sale badge, headline, interactive product image carousel, direct discount price card with countdown timer, 6-point Key Advantages grid, "The Real Market Problem / About" section, Product Showcase, customizable YouTube Shorts Video Presentation, 3-step "How It Works", "Our Direct Supply vs Cheap Knock-Offs" comparison, Verified Nigerian Buyer Reviews, 7-Day Replacement Guarantee badge, and the Pay-on-Delivery Checkout Form.
  2. **Admin Order & Operations Backend**: Allows you to inspect all incoming orders, filter by status or Nigerian state, update order stages, send pre-filled WhatsApp order verification messages to customers, monitor revenue metrics, and manage your Google Sheet Apps Script connection and YouTube Shorts demo video URL.
- **Target Audience / Persona**: Nigerian online shoppers looking for reliable Pay-on-Delivery cooling appliances, and the store owner managing daily courier dispatch and inventory tracking.
- **Key Value**: Combines a proven high-converting Nigerian Pay-on-Delivery sales funnel with zero-loss order capture—ensuring every order is stored safely on the server and mirrored live to Google Sheets.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Product Discovery & Carousel Inspection**:
   - Shoppers land on the page and see the top nationwide delivery bar and the `FLASH SALE · NATIONWIDE EXPRESS DELIVERY` badge.
   - In the primary image showcase, shoppers swipe or click through the **Interactive Image Carousel** displaying all uploaded product photos (5-Jet Mist Fan hero graphic, Bedroom/Office/Kitchen/Home usage grid, 7-Color LED & Timer view, 3 Fan Speeds & 60° adjustment, 600ml 5-Sprays breakdown in White & Green, Silent Mode dB chart, Easy To Clean guide, and 27.7cm × 21.5cm × 10cm box dimensions).
2. **Pricing, Video Demo & Trust Evaluation**:
   - Shoppers see the `₦40,500 – ₦45,500` direct discount block with live countdown timer and click `Order Now · Pay on Delivery` to smooth-scroll to the checkout form.
   - As they scroll, they review the 6 Key Advantages, product specifications, the embedded **YouTube Shorts Video Inspection** player, the 3-step delivery process, the Direct Supply comparison table, and verified reviews from Lagos, Abuja, and Port Harcourt buyers.
3. **Variant Selection & Pay-on-Delivery Checkout**:
   - In the **Fill This Form to Order Now** container, shoppers toggle between `RECHARGEABLE` (`₦45,500`) and `NON RECHARGEABLE` (`₦40,500`).
   - Shoppers select their Nigerian State (all 36 states + FCT Abuja supported, defaulting to `Lagos`), enter their City/Town, Full Name, Phone Number, optional Email, Full Delivery Address, optional Order Note/Landmark, and Quantity (`-` / `+` stepper).
   - The form dynamically calculates `Item Subtotal (Nx)`, `Delivery: FREE (₦0)`, and `Total`, then submits the order to the backend and triggers the Google Apps Script webhook.
   - Shoppers immediately see a verified **Order Confirmation Receipt** with their Order Reference number, summary, and a button to message customer support on WhatsApp.
4. **Admin Backend Workflow**:
   - Clicking the subtle **Manage Orders** lock icon in the header or footer opens the Passcode Gate.
   - Inside the dashboard, you can view KPI cards (Total Orders, Gross & Delivered Revenue in `₦`, Conversion by Variant, Google Sheet Sync Status), filter orders by status (`All`, `Pending`, `Confirmed`, `Dispatched`, `Delivered`, `Cancelled`) or state, click **WhatsApp Customer** to send a pre-formatted confirmation message, view the **State-by-State Breakdown**, or configure the **Google Apps Script URL** and **YouTube Shorts URL**.

### Visual Identity & Theme

- **Aesthetic Direction**: Clean, high-trust Nigerian Direct-to-Consumer (D2C) e-commerce layout faithful to the provided Bora Stores PDF—crisp white cards on a soft neutral canvas (`#F8FAFC`), structured hairline borders (`#E2E8F0`), emerald trust accents, and royal blue pricing and checkout highlights.
- **Color Palette & Mood**:
  - `--background`: `#F8FAFC` (Soft cool alabaster page backdrop)
  - `--surface`: `#FFFFFF` (Crisp white section cards with `rounded-2xl` geometry and `1px` subtle borders)
  - `--primary`: `#1D4ED8` (Deep Royal Blue for discount pricing `₦40,500 - ₦45,500`, active variant selection, and primary checkout actions)
  - `--accent-warm`: `#D97706` / `#FEF3C7` (Flash Sale badge and countdown timer highlight)
  - `--accent-emerald`: `#059669` / `#ECFDF5` (Verified buyer badges, checkmark icons, Limited Stock indicator, and 100% Risk-Free 7-Day Replacement Guarantee border/shield)
  - `--accent-rose`: `#E11D48` (`THE REAL MARKET PROBLEM` section kicker)
- **Typography & Hierarchy**:
  - **Display & Headings**: `Plus Jakarta Sans` (Bold/ExtraBold `700`–`800`, tight tracking) for impactful headlines, section headers, and pricing callouts.
  - **Body Copy & Form Controls**: `DM Sans` (`400`–`500`) for clear readability across product descriptions, comparisons, and checkout inputs.
  - **Numeric & Currency Values**: `JetBrains Mono` / `tabular-nums` for Naira prices (`₦45,500`), countdown timer (`04:26:26`), quantities, and admin financial tables.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual Persistence (Server Database + Google Apps Script Webhook)**
  - *Chosen Approach*: Every customer order is saved first to the server's local persistent JSON database and then asynchronously forwarded to your Google Apps Script Web App URL.
  - *Why*: If a customer has a slow connection or if Google Sheets experiences a temporary timeout, you never lose an order. The Admin Dashboard records whether each order is `Synced` to Google Sheets and lets you re-sync individual or bulk orders anytime with one click.
- **Decision 2: Ready-to-Use Google Apps Script Generator Inside Admin**
  - *Chosen Approach*: Provide a dedicated **Google Sheet Integration** modal/tab in the Admin Dashboard containing the exact Google Apps Script code snippet and step-by-step instructions, plus a live URL input and "Send Test Order to Sheet" button.
  - *Why*: Eliminates any guesswork in setting up column headers (`Order ID`, `Date`, `Customer Name`, `Phone`, `Email`, `State`, `City`, `Address`, `Variant Type`, `Unit Price`, `Quantity`, `Total Amount`, `Order Note`, `Status`) in your Google Sheet.
- **Decision 3: Nigerian Phone Formatting & One-Click WhatsApp Verification**
  - *Chosen Approach*: Automatically normalize local Nigerian phone numbers (e.g. `0803 123 4567` → `2348031234567`) when generating WhatsApp follow-up links in the Admin Dashboard, pre-populating a polite verification message with the customer's name, chosen fan type (`Rechargeable` or `Non-Rechargeable`), quantity, total (`₦45,500`), and delivery address.
  - *Why*: Speeds up order verification before courier dispatch, which is critical for Pay-on-Delivery operations across Nigeria.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATION (React SPA)                        │
├──────────────────────────────────────┬───────────────────────────────────────┤
│      PUBLIC SALES PAGE VIEW          │         ADMIN DASHBOARD VIEW          │
│                                      │       (Passcode Protected Gate)       │
│  ┌────────────────────────────────┐  │  ┌─────────────────────────────────┐  │
│  │ Top Delivery Bar & Flash Header│  │  │ KPI Strip & Revenue Analytics   │  │
│  ├────────────────────────────────┤  │  │ (Total, Delivered, By Variant)  │  │
│  │ Interactive Image Carousel     │  │  ├─────────────────────────────────┤  │
│  │ (8 Unique Product Images +     │  │  │ Order Pipeline Table & Filters  │  │
│  │  Thumbnails + Lightbox Zoom)   │  │  │ (Status, State, Search, CSV)    │  │
│  ├────────────────────────────────┤  │  ├─────────────────────────────────┤  │
│  │ Discount Price & Timer Card    │  │  │ 1-Click WhatsApp Follow-Up      │  │
│  │ (₦40,500 - ₦45,500 · CTA)      │  │  │ (+234 Number Auto-Formatter)    │  │
│  ├────────────────────────────────┤  │  ├─────────────────────────────────┤  │
│  │ Key Advantages (6 Cards)       │  │  │ State-by-State Breakdown Chart  │  │
│  │ + About / Market Problem       │  │  ├─────────────────────────────────┤  │
│  │ + Product Showcase             │  │  │ Store & Integration Settings    │  │
│  │ + YouTube Shorts Video Player  │  │  │ - Google Apps Script URL & Code │  │
│  │ + How It Works (3 Steps)       │  │  │ - YouTube Shorts Video Embed URL│  │
│  │ + Direct vs Knock-Offs Table   │  │  │ - Prices, Stock & Passcode      │  │
│  │ + Verified Reviews & Guarantee │  │  └─────────────────────────────────┘  │
│  ├────────────────────────────────┤  │                   │                   │
│  │ Pay-on-Delivery Order Form     │  │                   │                   │
│  │ - Rechargeable (₦45,500)       │  │                   │                   │
│  │ - Non-Rechargeable (₦40,500)   │  │                   │                   │
│  │ - 36 States + FCT, Qty Stepper │  │                   │                   │
│  └───────────────┬────────────────┘  └───────────────────┼───────────────────┘
└──────────────────┼───────────────────────────────────────┼───────────────────┘
                   │ POST /api/orders                      │ GET/PATCH /api/orders
                   ▼                                       ▼ POST /api/settings
┌──────────────────────────────────────────────────────────────────────────────┐
│                       EXPRESS BACKEND SERVER (server.ts)                     │
│                                                                              │
│  ┌────────────────────────────────────────┐    ┌──────────────────────────┐  │
│  │ Persistent JSON Store (data/store.json)│    │ Apps Script Webhook Proxy│  │
│  │ - Orders List & Status History         │───▶│ POST to Google Sheet     │  │
│  │ - Store Config (Prices, Video, Webhook)│    │ Web App URL (doPost)     │  │
│  └────────────────────────────────────────┘    └──────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

1. **`Order` Entity**:
   - `id`: Unique readable order reference (e.g., `BORA-8492`)
   - `createdAt`: ISO timestamp
   - `productType`: `'RECHARGEABLE' | 'NON_RECHARGEABLE'`
   - `unitPrice`: `45500 | 40500` (configurable in settings)
   - `quantity`: Integer (`>= 1`)
   - `totalAmount`: `unitPrice * quantity`
   - `customerName`: Full name string
   - `phone`: Phone number string
   - `email`: Optional email string
   - `state`: Nigerian state (e.g., `Lagos`, `Abuja (FCT)`, `Rivers`, etc.)
   - `city`: City / town string
   - `address`: Full street delivery address
   - `orderNote`: Optional delivery landmark or preferred time
   - `paymentMethod`: `'Pay on delivery'`
   - `status`: `'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled'`
   - `sheetSynced`: Boolean indicating if the order was confirmed received by the Google Apps Script webhook
   - `sheetSyncedAt`: Optional ISO timestamp of last successful sync

2. **`StoreSettings` Entity**:
   - `rechargeablePrice`: Default `45500`
   - `nonRechargeablePrice`: Default `40500`
   - `originalPrice`: Default `58000`
   - `stockCount`: Default `38`
   - `youtubeUrl`: Configurable YouTube / YouTube Shorts URL (with clean fallback preview if empty or clicked)
   - `appsScriptUrl`: Google Apps Script Web App deployment URL (`https://script.google.com/macros/s/.../exec`)
   - `whatsappNumber`: Store support WhatsApp number for customer inquiries
   - `adminPasscode`: Default `'1234'` (changeable in Admin settings)

### Interactive Component & State Mapping

- **Hero Image Carousel**:
  - Houses all uploaded product images in a curated sequence starting with the "5-Jet Mist Fan / Beat The Heat" hero image, followed by the 600ml 5-Sprays diagrams (White and Green), 7-Color LED & Timer showcase, 3 Fan Speeds & Perfume diffuser pad diagram, Silent Mode dB comparison, Bedroom/Office/Kitchen/Home quad scene, Easy To Clean guide, and package dimensions.
  - Supports Next/Prev buttons, clickable thumbnail strip, auto-play toggle, and click-to-zoom modal.
- **Order Form Validation & Submission**:
  - Switching between `RECHARGEABLE` and `NON RECHARGEABLE` or clicking `+` / `-` on Quantity immediately recalculates the unit price (`₦45,500` vs `₦40,500`), item subtotal, and total button label (`Order now · ₦45,500`).
  - Submitting validates required fields (State, City/Town, Full Name, Phone, Full Delivery Address), sends `POST /api/orders`, decrements available stock count, and transitions the form to an interactive Order Confirmation card.
- **Admin Dashboard & Google Sheets Sync**:
  - Changing an order's status in the pipeline calls `PATCH /api/orders/:id` and triggers an update payload to the Google Apps Script webhook so the status column in your Google Sheet also stays updated.
  - Clicking **Sync to Google Sheet** on any unsynced order or **Sync All Orders** pushes the full order record to the configured Apps Script URL and updates the sync badge in real time.
