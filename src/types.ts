export type ProductVariant = 'RECHARGEABLE' | 'NON_RECHARGEABLE';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Dispatched'
  | 'Delivered'
  | 'Cancelled';

export interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  productType: ProductVariant;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  customerName: string;
  phone: string;
  email: string;
  state: string;
  city: string;
  address: string;
  orderNote: string;
  paymentMethod: string;
  status: OrderStatus;
  adminNote?: string;
  sheetSynced: boolean;
  sheetSyncedAt?: string;
  sheetSyncError?: string;
}

export interface PublicVideoItem {
  id: string;
  title: string;
  streamUrl: string;
  embedType?: 'mp4' | 'youtube';
}

export interface AdminVideoItem extends PublicVideoItem {
  sourceUrl?: string;
}

export interface StoreSettings {
  rechargeablePrice: number;
  nonRechargeablePrice: number;
  originalPrice: number;
  stockCount: number;
  youtubeUrl: string;
  videos?: PublicVideoItem[];
  appsScriptUrl: string;
  googleSheetUrl?: string;
  whatsappNumber: string;
  adminPasscode?: string;
  hasAppsScriptWebhook?: boolean;
}

export interface CarouselSlide {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  tag: string;
}

export const PRODUCT_IMAGES: CarouselSlide[] = [
  {
    id: 'mist-white-600ml',
    src: './assets/aistudio/2d00e22190f652d3f176e4ab6f8b7b61_91d885f9.jpeg',
    title: '600ml Large Tank · 5-Jet Ultrasonic Mist',
    subtitle: 'Low (1 Spray / 12H) · Medium (3 Sprays / 4H) · High (5 Sprays / 2.5H)',
    tag: '5-JET MIST FAN',
  },
  {
    id: 'led-7-color-timer',
    src: './assets/aistudio/710a65b7b528469c3d8ffb6d3c4c4e57_e783070b.jpeg',
    title: '7-Color Soothing LED Night Light & Smart Timer',
    subtitle: 'Built-in 1H / 2H / 3H auto-shutoff timer for uninterrupted night sleep',
    tag: '7-COLOR LED & TIMER',
  },
  {
    id: '3-fan-speeds-perfume',
    src: './assets/aistudio/137b256ed2e03f22ec2157a1e0d0768f_f7c4185a.jpeg',
    title: '3 Fan Speeds + 60° Adjustable Airflow + Aroma Pad',
    subtitle: 'Low, Medium & High wind speeds with center aroma sponge for perfume or essential oils',
    tag: '3 SPEEDS & AROMA',
  },
  {
    id: 'silent-mode-sleep',
    src: './assets/aistudio/8b0bb4b1bad9da1c48a0ee24d9403639_029ebc19.jpeg',
    title: 'Whisper-Quiet 30–40dB Operation',
    subtitle: 'Engineered for peaceful sleep, study, and office focus without loud motor noise',
    tag: 'SILENT COOLING',
  },
  {
    id: 'multi-room-lifestyle',
    src: './assets/aistudio/96364dec8588816a2dea5ff981895ac2_7ebdf7d1.jpeg'.replace('96364dec8588816a2dea5ff981895ac2_7ebdf7d1.jpeg', '96364dec8588516a2dea5ff981895ac2_7ebdf7d1.jpeg'),
    title: 'Portable Cooling for Bedroom, Office, Kitchen & Home',
    subtitle: 'Carry strap design lets you move instant cool air anywhere you need relief',
    tag: 'PORTABLE EVERYWHERE',
  },
  {
    id: 'mist-green-edition',
    src: './assets/aistudio/6cc30c4030b22bdebc6ab7add14970d6_5aa8c10b.jpeg',
    title: 'Tap or Mineral Water Ready · Rapid Mist Cooling',
    subtitle: 'Add cold water and ice cubes to drop surrounding air temperature in seconds',
    tag: 'ICE WATER COOLING',
  },
  {
    id: 'easy-to-clean',
    src: './assets/aistudio/e6cc602b0748d5dcdbc4f16c887a3c68_3795fc69.jpeg',
    title: 'Easy To Clean & Hygienic Detachable Grille',
    subtitle: 'Front fan guard removes effortlessly to wipe blades and clean the top water tank',
    tag: 'HYGIENIC DESIGN',
  },
  {
    id: 'package-dimensions',
    src: './assets/aistudio/060065cc049e3f571260676a2ffe8494_5d44809f.jpeg',
    title: 'Original Factory Box · Compact 27.7cm × 21.5cm × 10cm',
    subtitle: 'Securely boxed for nationwide courier dispatch across all 36 states in Nigeria',
    tag: 'FACTORY SEALED BOX',
  },
  {
    id: 'speed-modes-overview',
    src: './assets/aistudio/137b256ed2e03f22ec2157a1e0d0768f__1__f7c4185a.jpeg',
    title: 'Custom Comfort for Sleep, Work & Workouts',
    subtitle: 'Switch seamlessly between gentle breeze and high-velocity cooling mist',
    tag: 'ALL-DAY COMFORT',
  },
];

export const NIGERIAN_STATES = [
  'Lagos',
  'Abuja (FCT)',
  'Rivers',
  'Ogun',
  'Oyo',
  'Delta',
  'Edo',
  'Anambra',
  'Enugu',
  'Kaduna',
  'Kano',
  'Akwa Ibom',
  'Imo',
  'Abia',
  'Kwara',
  'Osun',
  'Ondo',
  'Ekiti',
  'Cross River',
  'Bayelsa',
  'Plateau',
  'Benue',
  'Niger',
  'Kogi',
  'Nasarawa',
  'Ebonyi',
  'Bauchi',
  'Gombe',
  'Adamawa',
  'Taraba',
  'Katsina',
  'Sokoto',
  'Kebbi',
  'Zamfara',
  'Jigawa',
  'Yobe',
  'Borno',
];

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function formatNigerianWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('234')) return digits;
  if (digits.startsWith('0') && digits.length === 11) {
    return `234${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    return `234${digits}`;
  }
  return digits;
}

export function buildCustomerWhatsAppLink(order: Order): string {
  const intlPhone = formatNigerianWhatsAppPhone(order.phone);
  const variantLabel =
    order.productType === 'RECHARGEABLE' ? 'Rechargeable' : 'Non-Rechargeable';
  const message = [
    `Hello ${order.customerName},`,
    ``,
    `Thank you for your order with *ShittuStores by Advibe Studios Commerce*!`,
    ``,
    `*Order Reference:* ${order.id}`,
    `*Item:* High Quality 5-Jet Mist Fan (${variantLabel})`,
    `*Quantity:* ${order.quantity}`,
    `*Total (Pay on Delivery):* ${formatNaira(order.totalAmount)} (Free Doorstep Delivery)`,
    `*Delivery Address:* ${order.address}, ${order.city}, ${order.state}`,
    ``,
    `Please reply *CONFIRM* so our dispatch courier can schedule your doorstep delivery right away.`,
  ].join('\n');

  return `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
}

export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyAFkq7GmB_RvDm8oWP4Ryu-46RQt8FCTlHVBNfsf7QKvImg-IhyYMgqxkAYw1yzo6R/exec';

export const DEFAULT_GOOGLE_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/15cwE3DwlRZOm9NG8Cq-5jILCSgX53aq9df186HlypPs/edit?gid=0#gid=0';

export async function postToGoogleAppsScriptDirect(
  appsScriptUrl: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  const trimmed = (appsScriptUrl || DEFAULT_APPS_SCRIPT_URL).trim();
  if (!trimmed) {
    return { ok: false, error: 'No Google Apps Script URL configured.' };
  }
  const bodyStr = JSON.stringify(payload);

  // First try standard CORS POST (works when Apps Script returns 200 JSON redirect with CORS headers)
  try {
    const res = await fetch(trimmed, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: bodyStr,
      redirect: 'follow',
    });
    if (res.status === 403 || res.status === 401) {
      return {
        ok: false,
        error:
          'Google Apps Script returned HTTP 403. In Apps Script, click Deploy > Manage deployments > Edit > set "Who has access" to "Anyone".',
      };
    }
    if (res.ok) {
      return { ok: true };
    }
  } catch {
    // Browser blocked cross-origin 302 redirect on POST — fall back to opaque no-cors POST below
  }

  // Fallback: mode 'no-cors' sends the exact POST body to Google Apps Script doPost(e) without browser CORS redirect rejection
  try {
    await fetch(trimmed, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: bodyStr,
    });
    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : 'Could not reach Google Apps Script URL. Check your internet connection.',
    };
  }
}

export async function fetchOrdersFromGoogleAppsScriptDirect(
  appsScriptUrl: string
): Promise<Order[] | null> {
  const trimmed = (appsScriptUrl || DEFAULT_APPS_SCRIPT_URL).trim();
  if (!trimmed) return null;
  try {
    const res = await fetch(
      `${trimmed}${trimmed.includes('?') ? '&' : '?'}action=list`,
      {
        method: 'GET',
        redirect: 'follow',
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data && Array.isArray(data.orders)) {
      return data.orders as Order[];
    }
    return null;
  } catch {
    return null;
  }
}

export const META_PIXEL_ID = '1209947957634004';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackMetaPixelProductView(defaultPrice = 45500): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  try {
    window.fbq('track', 'ViewContent', {
      content_name: 'High Quality 5-Jet Mist Fan with Colour Changing LED Light',
      content_category: 'Home & Cooling Appliances',
      content_ids: ['shittu-mist-fan-5jet'],
      content_type: 'product',
      value: Number(defaultPrice) || 45500,
      currency: 'NGN',
    });
  } catch {
    // Ignore pixel blocker errors
  }
}

export function trackMetaPixelPurchase(order: Order): void {
  if (typeof window === 'undefined') return;
  const dedupeKey = `shittustores_pixel_purchase_${order.id}`;
  try {
    if (sessionStorage.getItem(dedupeKey) === '1') {
      return;
    }
  } catch {
    // Ignore sessionStorage restrictions
  }

  if (typeof window.fbq === 'function') {
    try {
      const variantId =
        order.productType === 'RECHARGEABLE'
          ? 'shittu-mist-fan-rechargeable'
          : 'shittu-mist-fan-non-rechargeable';
      const variantName =
        order.productType === 'RECHARGEABLE'
          ? 'RECHARGEABLE'
          : 'NON RECHARGEABLE';

      window.fbq('track', 'Purchase', {
        value: Number(order.totalAmount) || 45500,
        currency: 'NGN',
        content_name: `High Quality 5-Jet Mist Fan (${variantName})`,
        content_type: 'product',
        content_ids: [variantId],
        num_items: Number(order.quantity) || 1,
        order_id: order.id,
      });

      try {
        sessionStorage.setItem(dedupeKey, '1');
      } catch {
        // Ignore
      }
    } catch {
      // Ignore pixel blocker errors
    }
  }
}

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * SHITTUSTORES BY ADVIBE STUDIOS COMMERCE — GOOGLE SHEETS ORDER SYNC + GMAIL RECEIPT SCRIPT
 * (Supports Instant Order Logging via doPost, Automated Customer Gmail Receipt, and Admin Live Sync via doGet)
 * 
 * Setup Instructions:
 * 1. Open your Google Sheet -> Click "Extensions" > "Apps Script"
 * 2. Delete any code in the editor and paste this entire script.
 * 3. Click "Deploy" (top right) > "Manage deployments" > Edit (pencil icon) or "New deployment"
 * 4. Select type: "Web app"
 * 5. Set "Execute as": "Me"
 * 6. Set "Who has access": "Anyone"
 * 7. Click "Deploy", authorize Gmail & Sheet access, and paste the Web App URL in ShittuAdmin!
 */

const HEADERS = [
  'Order ID',
  'Order Date',
  'Status',
  'Product Variant',
  'Quantity',
  'Unit Price (NGN)',
  'Total Amount (NGN)',
  'Customer Name',
  'Phone Number',
  'Email',
  'State',
  'City / Town',
  'Delivery Address',
  'Order Note',
  'Payment Method',
  'Admin Note',
  'Last Updated'
];

function ensureSheetSetup(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#1D4ED8');
    headerRange.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }
}

function orderToRow(order) {
  return [
    order.id || '',
    order.createdAt ? new Date(order.createdAt).toLocaleString('en-NG') : new Date().toLocaleString('en-NG'),
    order.status || 'Pending',
    order.productType === 'RECHARGEABLE' ? 'RECHARGEABLE' : 'NON RECHARGEABLE',
    Number(order.quantity || 1),
    Number(order.unitPrice || 0),
    Number(order.totalAmount || 0),
    order.customerName || '',
    "'" + (order.phone || ''),
    order.email || '',
    order.state || '',
    order.city || '',
    order.address || '',
    order.orderNote || '',
    order.paymentMethod || 'Pay on delivery',
    order.adminNote || '',
    new Date().toLocaleString('en-NG')
  ];
}

function sendCustomerReceiptEmail(order) {
  try {
    const customerEmail = String(order.email || '').trim();
    if (!customerEmail || customerEmail.indexOf('@') === -1) {
      return false;
    }

    const variantLabel = order.productType === 'RECHARGEABLE' ? 'RECHARGEABLE' : 'NON RECHARGEABLE';
    const qty = Number(order.quantity || 1);
    const unitPriceFormatted = '₦' + Number(order.unitPrice || 45500).toLocaleString();
    const totalFormatted = '₦' + Number(order.totalAmount || 45500).toLocaleString();
    const subject = 'Pre-Order Confirmation Receipt (' + (order.id || 'SHITTU') + ') — ShittuStores';

    const plainBody = [
      'Hello ' + (order.customerName || 'Valued Customer') + ',',
      '',
      'Thank you for ordering from ShittuStores by Advibe Studios Commerce!',
      'Your pre-order has been received and your doorstep delivery will be scheduled within 24–48 hours.',
      '',
      '--- PRE-ORDER CONFIRMATION RECEIPT ---',
      'Order ID: ' + (order.id || ''),
      'Product: High Quality 5-Jet Mist Fan with Colour Changing LED Light (' + variantLabel + ')',
      'Quantity: ' + qty + ' (' + unitPriceFormatted + ' each)',
      'Delivery Fee: FREE Doorstep Delivery (₦0)',
      'Total Payable on Delivery: ' + totalFormatted + ' (Pay on Delivery via Cash or POS Transfer)',
      'Delivery Address: ' + (order.address || '') + ', ' + (order.city || '') + ', ' + (order.state || ''),
      'Phone Number: ' + (order.phone || ''),
      '',
      'WHAT HAPPENS NEXT:',
      'Our dispatch courier team will call your phone number (' + (order.phone || '') + ') to schedule and complete your doorstep delivery within 24–48 hours.',
      '',
      'Thank you for choosing ShittuStores by Advibe Studios Commerce!'
    ].join('\\n');

    const htmlBody = '<div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #0f172a;">' +
      '<div style="background: #0f172a; color: #ffffff; padding: 22px 24px;">' +
        '<div style="font-size: 12px; color: #34d399; font-weight: bold; letter-spacing: 0.08em; text-transform: uppercase;">PRE-ORDER CONFIRMATION RECEIPT</div>' +
        '<h2 style="margin: 6px 0 0; font-size: 20px;">Thank You, ' + (order.customerName || 'Valued Customer') + '!</h2>' +
        '<p style="margin: 6px 0 0; font-size: 13px; color: #cbd5e1;">ShittuStores by Advibe Studios Commerce</p>' +
      '</div>' +
      '<div style="padding: 24px; background: #ffffff;">' +
        '<div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px 16px; margin-bottom: 20px;">' +
          '<strong style="color: #065f46; font-size: 14px; display: block;">Delivery Scheduled Within 24–48 Hours</strong>' +
          '<span style="color: #047857; font-size: 13px;">Your order is being prepared for dispatch to <b>' + (order.city || '') + ', ' + (order.state || '') + '</b>. Our courier will call <b>' + (order.phone || '') + '</b> before arrival.</span>' +
        '</div>' +
        '<table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 18px;">' +
          '<tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Order Reference</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; text-align: right; color: #1d4ed8;">' + (order.id || '') + '</td></tr>' +
          '<tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Product</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; text-align: right;">High Quality 5-Jet Mist Fan (' + variantLabel + ')</td></tr>' +
          '<tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Quantity</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; text-align: right;">' + qty + ' × ' + unitPriceFormatted + '</td></tr>' +
          '<tr><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Doorstep Delivery</td><td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; text-align: right; color: #059669;">FREE (₦0)</td></tr>' +
          '<tr><td style="padding: 12px 0; font-weight: bold; font-size: 15px;">Total Payable on Delivery</td><td style="padding: 12px 0; font-weight: bold; font-size: 17px; text-align: right; color: #1d4ed8;">' + totalFormatted + '</td></tr>' +
        '</table>' +
        '<div style="background: #f8fafc; border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #334155;">' +
          '<strong>Delivery Address:</strong> ' + (order.address || '') + ', ' + (order.city || '') + ', ' + (order.state || '') + '<br/>' +
          '<strong>Payment Method:</strong> Pay on Delivery (Cash or POS Transfer upon doorstep inspection)' +
        '</div>' +
      '</div>' +
      '<div style="background: #f8fafc; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">' +
        '© ' + new Date().getFullYear() + ' ShittuStores by Advibe Studios Commerce · Nationwide Pay on Delivery' +
      '</div>' +
    '</div>';

    MailApp.sendEmail({
      to: customerEmail,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      name: 'ShittuStores by Advibe Studios Commerce'
    });
    return true;
  } catch (err) {
    return false;
  }
}

function upsertOrder(sheet, order) {
  ensureSheetSetup(sheet);
  const lastRow = sheet.getLastRow();
  const rowData = orderToRow(order);

  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    const existingIndex = ids.indexOf(order.id);
    if (existingIndex !== -1) {
      const targetRow = existingIndex + 2;
      sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
      return 'updated';
    }
  }

  sheet.appendRow(rowData);
  return 'inserted';
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    ensureSheetSetup(sheet);
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return ContentService.createTextOutput(
        JSON.stringify({ ok: true, orders: [] })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    const rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
    const orders = rows.map(function(r) {
      return {
        id: String(r[0] || ''),
        createdAt: r[1] ? new Date(r[1]).toISOString() : new Date().toISOString(),
        updatedAt: r[16] ? new Date(r[16]).toISOString() : new Date().toISOString(),
        status: String(r[2] || 'Pending'),
        productType: String(r[3] || '').indexOf('NON') !== -1 ? 'NON_RECHARGEABLE' : 'RECHARGEABLE',
        quantity: Number(r[4] || 1),
        unitPrice: Number(r[5] || 45500),
        totalAmount: Number(r[6] || 45500),
        customerName: String(r[7] || ''),
        phone: String(r[8] || '').replace(/^'/, ''),
        email: String(r[9] || ''),
        state: String(r[10] || 'Lagos'),
        city: String(r[11] || ''),
        address: String(r[12] || ''),
        orderNote: String(r[13] || ''),
        paymentMethod: String(r[14] || 'Pay on delivery'),
        adminNote: String(r[15] || ''),
        sheetSynced: true
      };
    }).reverse();

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, orders: orders })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const payload = JSON.parse(e.postData.contents);

    if (payload.action === 'batch_upsert' && Array.isArray(payload.orders)) {
      let count = 0;
      payload.orders.forEach(function(order) {
        upsertOrder(sheet, order);
        count++;
      });
      return ContentService.createTextOutput(
        JSON.stringify({ ok: true, message: 'Synced ' + count + ' orders' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const order = payload.order || payload;
    const result = upsertOrder(sheet, order);

    let emailSent = false;
    if (result === 'inserted' || payload.sendReceiptEmail === true) {
      emailSent = sendCustomerReceiptEmail(order);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, result: result, orderId: order.id, emailSent: emailSent })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
`;


