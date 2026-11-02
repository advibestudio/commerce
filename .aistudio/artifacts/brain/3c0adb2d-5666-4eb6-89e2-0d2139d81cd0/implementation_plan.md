# Meta Pixel Purchase Tracking, Dedicated Thank You Page & Gmail Pre-Order Receipt

Integrate the Meta (Facebook) Pixel (`1209947957634004`) across the storefront to track product views (`PageView` + `ViewContent`) on the main sales page and record verified `Purchase` conversions with dynamic `NGN` order totals exclusively on a dedicated full-page **Thank You** screen—complete with a prominent WhatsApp verification button and automated Gmail pre-order receipt emails stating that delivery is scheduled within 24–48 hours.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product and tracking decisions have been confirmed and incorporated into this plan:

- **Dedicated Full-Page Thank You Screen**: Submitting an order transitions the visitor from the sales page to a dedicated full-screen **Thank You Page** (`#thank-you`) featuring a prominent WhatsApp CTA button that opens a pre-filled verification message to your WhatsApp number, an itemized order receipt, and a 24–48hr delivery schedule notice.
- **Dynamic NGN Meta Pixel `Purchase` Tracking**:
  - **Product Sales Page**: Fires `fbq('init', '1209947957634004')`, `fbq('track', 'PageView')`, and `fbq('track', 'ViewContent', { value: 45500, currency: 'NGN', ... })` so Facebook Ads optimizes for product viewers.
  - **Thank You Page Only**: Fires `fbq('track', 'Purchase', { value: order.totalAmount, currency: 'NGN', num_items: order.quantity, ... })` (e.g., `45500` or `40500` × quantity) strictly once per completed order so Facebook Ads records accurate purchase conversions and ROAS.
- **Automated Gmail Pre-Order Confirmation Receipt (24–48hr Delivery)**: Whenever a customer provides an email address on the order form, the Google Apps Script integration automatically sends a formatted HTML pre-order confirmation receipt from your Gmail account to the customer's email address confirming their Order ID, itemized Pay-on-Delivery total, and that their doorstep delivery will be scheduled within **24–48 hours**.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. Embeds your exact Meta Pixel (`1209947957634004`) snippet in the HTML `<head>` so every storefront visit is tracked immediately.
  2. Fires `ViewContent` on the product sales page and delays the `Purchase` event until the customer completes the order form and lands on the dedicated **Thank You Page**.
  3. Presents a distraction-free, high-trust **Thank You Page** with a large WhatsApp button (`Fast-Track Verification on WhatsApp`), full receipt summary, and confirmation that an email receipt has been dispatched with a **24–48 hours** delivery window.
- **Target Audience / Persona**: Nigerian mobile shoppers ordering the High Quality 5-Jet Mist Fan from Facebook/Instagram ad campaigns, and the store owner optimizing Facebook Ad conversion attribution.
- **Key Value**: Prevents false purchase events on page load while ensuring 100% of completed Pay-on-Delivery orders are attributed with their exact Naira value (`NGN`) in Meta Ads Manager.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Landing on Product Page (`PageView` + `ViewContent`)**: Shopper lands from a Facebook/Instagram ad; the Meta Pixel initializes and logs `PageView` and `ViewContent` (never `Purchase`).
  2. **Placing an Order**: Shopper selects `RECHARGEABLE (₦45,500)` or `NON RECHARGEABLE (₦40,500)`, enters their contact details (including optional email), and taps **Order now**.
  3. **Dedicated Full-Page Thank You Screen (`Purchase` Event Fired)**:
     - The viewport switches to a full-page **Thank You** view and scrolls to the top.
     - The Meta Pixel immediately fires `fbq('track', 'Purchase', { value: order.totalAmount, currency: 'NGN', ... })` along with a `<noscript>` fallback pixel for `ev=Purchase`.
     - If the customer entered an email address, a clear confirmation banner displays: *"Pre-order confirmation receipt sent to [customer email] — Your doorstep delivery is scheduled within 24–48 hours."*
     - A prominent emerald **Send Order to Our WhatsApp Now** primary CTA button sits front-and-center so the customer can immediately message you on WhatsApp.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: High-Trust Direct-Response Checkout Confirmation with clean receipt typography and unmistakable WhatsApp action hierarchy.
  - *Color Palette & Mood*: Crisp `#F8FAFC` alabaster background, `#FFFFFF` receipt surface, `#059669` (Emerald 600) confirmation and WhatsApp primary CTA, and `#1D4ED8` (Royal Blue 700) tabular Naira price highlights.
  - *Typography & Hierarchy*: `Plus Jakarta Sans` for confirmation headlines, `DM Sans` for delivery instructions, and `JetBrains Mono` (`tabular-nums`) for Order IDs and Naira totals.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Deduped `Purchase` Event on the Dedicated Thank You Page**
  - *Chosen Approach*: Track the last fired `order.id` in `sessionStorage` (`shittustores_pixel_purchased_<orderId>`) before invoking `fbq('track', 'Purchase', ...)`.
  - *Why*: Ensures that every new order fires `Purchase` with the exact dynamic NGN total (`45500` or `40500` × quantity), while preventing duplicate `Purchase` events if the customer refreshes the Thank You page.
- **Decision 2: Automated Customer Receipt Email via Google Apps Script (`MailApp.sendEmail`)**
  - *Chosen Approach*: Trigger `MailApp.sendEmail` inside the Google Apps Script `doPost` webhook whenever a new order is logged with a valid customer email address, and pass `sendReceiptEmail: true` in the order sync payload.
  - *Why*: Works 100% free and serverless on GitHub Pages using your connected Google account (`shittu.cfm@gmail.com`) without exposing any SMTP passwords or API keys in the frontend code.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Conversion Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PUBLIC PRODUCT PAGE (Storefront)                     │
│  • index.html loads Meta Pixel (ID: 1209947957634004)                   │
│  • Fires fbq('track', 'PageView') + fbq('track', 'ViewContent')         │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ Customer submits Order Form
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│             ORDER SUBMISSION & GOOGLE APPS SCRIPT WEBHOOK               │
│  • Appends order row to Google Sheet                                    │
│  • If customer email provided -> MailApp.sendEmail() sends HTML         │
│    Pre-Order Confirmation Receipt (Delivery scheduled within 24–48hrs)  │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ Transitions to Dedicated View
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                DEDICATED FULL-PAGE THANK YOU SCREEN                     │
│  • Fires fbq('track', 'Purchase', { value: totalAmount, currency:'NGN'})│
│  • Renders <noscript> Purchase pixel fallback                           │
│  • Displays 24–48hr delivery schedule & email receipt confirmation      │
│  • Prominent Primary CTA: "Confirm Order on WhatsApp Now"               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Interactive Component & State Mapping
- **Global Meta Pixel Helper**: Safely wraps `window.fbq` calls (`trackPageView`, `trackProductView`, `trackPurchase(order)`) so ad-blockers or slow connections never throw runtime errors.
- **Dedicated `ThankYouPage` View**: Replaces the main storefront layout when `completedOrder` state is active, auto-scrolls to top (`window.scrollTo(0, 0)`), fires `trackPurchase(completedOrder)` once per order ID, and provides 1-tap WhatsApp confirmation and receipt printing/copying.
- **Updated Google Apps Script (`GOOGLE_APPS_SCRIPT_TEMPLATE`)**: Adds `sendCustomerReceiptEmail(order)` inside `doPost(e)` so any customer who provides an email address immediately receives a branded HTML pre-order receipt confirming 24–48hr doorstep delivery.
