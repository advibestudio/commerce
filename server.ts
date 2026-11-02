import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface OrderRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  productType: 'RECHARGEABLE' | 'NON_RECHARGEABLE';
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
  status: 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled';
  adminNote?: string;
  sheetSynced: boolean;
  sheetSyncedAt?: string;
  sheetSyncError?: string;
}

interface StoredVideoItem {
  id: string;
  title: string;
  sourceUrl: string;
  localFile?: string;
  embedType: 'mp4' | 'youtube';
  youtubeId?: string;
}

interface StoreSettingsRecord {
  rechargeablePrice: number;
  nonRechargeablePrice: number;
  originalPrice: number;
  stockCount: number;
  youtubeUrl: string;
  videos: StoredVideoItem[];
  appsScriptUrl: string;
  googleSheetUrl: string;
  whatsappNumber: string;
  adminPasscode: string;
}

interface DatabaseSchema {
  settings: StoreSettingsRecord;
  orders: OrderRecord[];
}

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const ASSETS_DIR = path.join(__dirname, 'public', 'assets', 'aistudio');

const DEFAULT_VIDEOS: StoredVideoItem[] = [
  {
    id: 'vid-1',
    title: 'Live Mist & Cooling Inspection #1',
    sourceUrl:
      'https://www.tiktok.com/@magg.theresa/video/7517981098131950861?is_from_webapp=1&sender_device=pc&web_id=7620103166977115655',
    localFile: 'demo_video_1.mp4',
    embedType: 'mp4',
  },
  {
    id: 'vid-2',
    title: 'Rechargeable Mist Fan Demo #2',
    sourceUrl:
      'https://www.tiktok.com/@tospino_ghana/video/7422261146696092933?q=mini%20rechargeable%20cooling%20fan&t=1793623958900',
    localFile: 'demo_video_2.mp4',
    embedType: 'mp4',
  },
];

const INITIAL_DATA: DatabaseSchema = {
  settings: {
    rechargeablePrice: 45500,
    nonRechargeablePrice: 40500,
    originalPrice: 58000,
    stockCount: 38,
    youtubeUrl: '',
    videos: DEFAULT_VIDEOS,
    appsScriptUrl: process.env.GOOGLE_APPS_SCRIPT_URL || '',
    googleSheetUrl: '',
    whatsappNumber: '2348030000000',
    adminPasscode: '1234',
  },
  orders: [
    {
      id: 'BORA-9041',
      createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      productType: 'RECHARGEABLE',
      unitPrice: 45500,
      quantity: 1,
      totalAmount: 45500,
      customerName: 'Mrs. Folashade Adeyemi',
      phone: '08034192837',
      email: 'folashade.adeyemi@gmail.com',
      state: 'Lagos',
      city: 'Lekki Phase 1',
      address: '14 Admiralty Way, Beside Zenith Bank, Lekki Phase 1',
      orderNote: 'Please call 30 minutes before arrival. Gate code required.',
      paymentMethod: 'Pay on delivery',
      status: 'Delivered',
      adminNote: 'Paid via POS transfer on delivery.',
      sheetSynced: false,
    },
    {
      id: 'BORA-9042',
      createdAt: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
      productType: 'RECHARGEABLE',
      unitPrice: 45500,
      quantity: 2,
      totalAmount: 91000,
      customerName: 'Engr. Emmanuel Kalu',
      phone: '08098234112',
      email: 'emmanuel.kalu@yahoo.com',
      state: 'Abuja (FCT)',
      city: 'Wuse 2',
      address: 'Plot 412 Aminu Kano Crescent, Wuse 2',
      orderNote: 'Deliver during office hours between 10am and 4pm.',
      paymentMethod: 'Pay on delivery',
      status: 'Dispatched',
      adminNote: 'Assigned to Abuja Express Rider (Musa).',
      sheetSynced: false,
    },
    {
      id: 'BORA-9043',
      createdAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
      productType: 'NON_RECHARGEABLE',
      unitPrice: 40500,
      quantity: 1,
      totalAmount: 40500,
      customerName: 'Dr. Chioma Eze',
      phone: '07061183920',
      email: 'dr.chioma@clinicph.org',
      state: 'Rivers',
      city: 'Port Harcourt (GRA Phase 2)',
      address: '28 Olu Obasanjo Road, Opposite First Bank',
      orderNote: 'Leave with reception if I am in consultation.',
      paymentMethod: 'Pay on delivery',
      status: 'Confirmed',
      adminNote: 'Verified via WhatsApp.',
      sheetSynced: false,
    },
    {
      id: 'BORA-9044',
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      productType: 'RECHARGEABLE',
      unitPrice: 45500,
      quantity: 1,
      totalAmount: 45500,
      customerName: 'Alhaji Musa Danjuma',
      phone: '08023394810',
      email: '',
      state: 'Lagos',
      city: 'Ikeja GRA',
      address: '9 Isaac John Street, Ikeja GRA',
      orderNote: 'Landmark: Near Marriott Hotel Ikeja',
      paymentMethod: 'Pay on delivery',
      status: 'Pending',
      adminNote: '',
      sheetSynced: false,
    },
  ],
};

function loadDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      return structuredClone(INITIAL_DATA);
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    const mergedSettings = {
      ...INITIAL_DATA.settings,
      ...(parsed.settings || {}),
    };
    if (
      !Array.isArray(mergedSettings.videos) ||
      mergedSettings.videos.length === 0
    ) {
      mergedSettings.videos = structuredClone(DEFAULT_VIDEOS);
    } else {
      for (const defVid of DEFAULT_VIDEOS) {
        if (!mergedSettings.videos.some((v) => v.id === defVid.id)) {
          mergedSettings.videos.push(structuredClone(defVid));
        }
      }
    }
    return {
      settings: mergedSettings,
      orders: Array.isArray(parsed.orders) ? parsed.orders : INITIAL_DATA.orders,
    };
  } catch (err) {
    console.error('Failed to read store.json, using defaults:', err);
    return structuredClone(INITIAL_DATA);
  }
}

function saveDb(db: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write store.json:', err);
  }
}

async function pushOrderToAppsScript(
  appsScriptUrl: string,
  order: OrderRecord
): Promise<{ ok: boolean; error?: string }> {
  const trimmedUrl = (appsScriptUrl || '').trim();
  if (!trimmedUrl) {
    return { ok: false, error: 'Google Apps Script URL is not configured yet.' };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(trimmedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'upsert',
        order,
      }),
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        ok: false,
        error: `Webhook returned HTTP ${response.status}`,
      };
    }

    const text = await response.text();
    try {
      const json = JSON.parse(text);
      if (json && json.ok === false) {
        return { ok: false, error: json.error || 'Apps Script reported an error' };
      }
    } catch {
      // Non-JSON 200 response from Apps Script is still treated as delivered
    }

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}

async function pushBatchToAppsScript(
  appsScriptUrl: string,
  orders: OrderRecord[]
): Promise<{ ok: boolean; error?: string }> {
  const trimmedUrl = (appsScriptUrl || '').trim();
  if (!trimmedUrl) {
    return { ok: false, error: 'Google Apps Script URL is not configured yet.' };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(trimmedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'batch_upsert',
        orders,
      }),
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        ok: false,
        error: `Webhook returned HTTP ${response.status}`,
      };
    }

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}

function toPublicVideos(videos: StoredVideoItem[]) {
  return (videos || []).map((v) => ({
    id: v.id,
    title: v.title,
    embedType: v.embedType,
    // Never expose the original TikTok/external sourceUrl to the client!
    streamUrl:
      v.embedType === 'youtube' && v.youtubeId
        ? `https://www.youtube-nocookie.com/embed/${v.youtubeId}?controls=0&modestbranding=1&rel=0&showinfo=0`
        : `/api/videos/stream/${v.id}`,
  }));
}

async function resolveAndCacheVideoUrl(
  rawUrl: string,
  videoId: string
): Promise<{
  ok: boolean;
  localFile?: string;
  embedType: 'mp4' | 'youtube';
  youtubeId?: string;
  error?: string;
}> {
  const trimmed = rawUrl.trim();

  // Check if it's a TikTok link
  if (trimmed.includes('tiktok.com')) {
    try {
      const apiRes = await fetch(
        `https://www.tikwm.com/api/?url=${encodeURIComponent(trimmed)}`
      );
      const apiData = (await apiRes.json()) as {
        code?: number;
        data?: { play?: string; hdplay?: string };
      };
      const mp4Url = apiData?.data?.play || apiData?.data?.hdplay;
      if (!mp4Url) {
        return {
          ok: false,
          embedType: 'mp4',
          error: 'Could not extract video stream from TikTok URL.',
        };
      }
      const vidRes = await fetch(mp4Url);
      if (!vidRes.ok) {
        return {
          ok: false,
          embedType: 'mp4',
          error: 'Failed to download video stream.',
        };
      }
      if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR, { recursive: true });
      }
      const fileName = `cached_${videoId}.mp4`;
      const filePath = path.join(ASSETS_DIR, fileName);
      const buf = Buffer.from(await vidRes.arrayBuffer());
      fs.writeFileSync(filePath, buf);
      return { ok: true, localFile: fileName, embedType: 'mp4' };
    } catch (err: unknown) {
      return {
        ok: false,
        embedType: 'mp4',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  // Check if it's a direct MP4 link
  if (trimmed.endsWith('.mp4') || trimmed.includes('.mp4?')) {
    try {
      const vidRes = await fetch(trimmed);
      if (vidRes.ok) {
        if (!fs.existsSync(ASSETS_DIR)) {
          fs.mkdirSync(ASSETS_DIR, { recursive: true });
        }
        const fileName = `cached_${videoId}.mp4`;
        const filePath = path.join(ASSETS_DIR, fileName);
        const buf = Buffer.from(await vidRes.arrayBuffer());
        fs.writeFileSync(filePath, buf);
        return { ok: true, localFile: fileName, embedType: 'mp4' };
      }
    } catch {
      // Fallback below
    }
  }

  // Check if it's a YouTube Shorts or watch link
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  const shortLinkMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  const ytId =
    shortsMatch?.[1] || watchMatch?.[1] || shortLinkMatch?.[1] || null;

  if (ytId) {
    return { ok: true, embedType: 'youtube', youtubeId: ytId };
  }

  return {
    ok: false,
    embedType: 'mp4',
    error:
      'Unsupported video URL. Paste a TikTok video link, YouTube Shorts link, or direct MP4 URL.',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Stream Protected Video by ID (hides original TikTok / external link)
  app.get('/api/videos/stream/:id', (req, res) => {
    const db = loadDb();
    const video = (db.settings.videos || []).find(
      (v) => v.id === req.params.id
    );
    if (!video || !video.localFile) {
      res.status(404).end();
      return;
    }

    const filePath = path.join(ASSETS_DIR, path.basename(video.localFile));
    if (!fs.existsSync(filePath)) {
      res.status(404).end();
      return;
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': chunkSize,
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });

  // Admin: Get full video list (with sourceUrls for admin management)
  app.get('/api/admin/videos', (_req, res) => {
    const db = loadDb();
    res.json({
      videos: (db.settings.videos || []).map((v) => ({
        id: v.id,
        title: v.title,
        sourceUrl: v.sourceUrl,
        embedType: v.embedType,
        streamUrl: `/api/videos/stream/${v.id}`,
      })),
    });
  });

  // Admin: Add a new video (TikTok, YouTube Shorts, or MP4)
  app.post('/api/admin/videos', async (req, res) => {
    const db = loadDb();
    const { url, title } = req.body || {};
    if (!url || !String(url).trim()) {
      res.status(400).json({ ok: false, error: 'Please provide a video URL.' });
      return;
    }

    const videoId = `vid-${Date.now()}`;
    const resolved = await resolveAndCacheVideoUrl(String(url), videoId);
    if (!resolved.ok) {
      res.status(400).json({
        ok: false,
        error: resolved.error || 'Could not process video URL.',
      });
      return;
    }

    const nextIndex = (db.settings.videos || []).length + 1;
    const newVideo: StoredVideoItem = {
      id: videoId,
      title: String(title || `Live Product Demo #${nextIndex}`).trim(),
      sourceUrl: String(url).trim(),
      localFile: resolved.localFile,
      embedType: resolved.embedType,
      youtubeId: resolved.youtubeId,
    };

    db.settings.videos = [...(db.settings.videos || []), newVideo];
    saveDb(db);

    res.json({
      ok: true,
      publicVideos: toPublicVideos(db.settings.videos),
      adminVideos: db.settings.videos,
    });
  });

  // Admin: Remove a video
  app.delete('/api/admin/videos/:id', (req, res) => {
    const db = loadDb();
    db.settings.videos = (db.settings.videos || []).filter(
      (v) => v.id !== req.params.id
    );
    saveDb(db);
    res.json({
      ok: true,
      publicVideos: toPublicVideos(db.settings.videos),
      adminVideos: db.settings.videos,
    });
  });

  // Public & Admin Store Settings (Strips video sourceUrls from public response!)
  app.get('/api/settings', (_req, res) => {
    const db = loadDb();
    const { adminPasscode, videos, ...publicSettings } = db.settings;
    res.json({
      ...publicSettings,
      videos: toPublicVideos(videos),
      hasAppsScriptWebhook: Boolean(db.settings.appsScriptUrl?.trim()),
    });
  });

  // Verify Admin Passcode
  app.post('/api/admin/verify', (req, res) => {
    const db = loadDb();
    const { passcode } = req.body || {};
    if (String(passcode || '').trim() === db.settings.adminPasscode) {
      res.json({ ok: true });
    } else {
      res.status(401).json({ ok: false, error: 'Invalid admin passcode' });
    }
  });

  // Update Store Settings
  app.put('/api/settings', (req, res) => {
    const db = loadDb();
    const body = req.body || {};

    if (typeof body.rechargeablePrice === 'number' && body.rechargeablePrice > 0) {
      db.settings.rechargeablePrice = body.rechargeablePrice;
    }
    if (
      typeof body.nonRechargeablePrice === 'number' &&
      body.nonRechargeablePrice > 0
    ) {
      db.settings.nonRechargeablePrice = body.nonRechargeablePrice;
    }
    if (typeof body.originalPrice === 'number' && body.originalPrice > 0) {
      db.settings.originalPrice = body.originalPrice;
    }
    if (typeof body.stockCount === 'number' && body.stockCount >= 0) {
      db.settings.stockCount = body.stockCount;
    }
    if (typeof body.youtubeUrl === 'string') {
      db.settings.youtubeUrl = body.youtubeUrl.trim();
    }
    if (typeof body.appsScriptUrl === 'string') {
      db.settings.appsScriptUrl = body.appsScriptUrl.trim();
    }
    if (typeof body.googleSheetUrl === 'string') {
      db.settings.googleSheetUrl = body.googleSheetUrl.trim();
    }
    if (typeof body.whatsappNumber === 'string') {
      db.settings.whatsappNumber = body.whatsappNumber.trim();
    }
    if (typeof body.adminPasscode === 'string' && body.adminPasscode.trim()) {
      db.settings.adminPasscode = body.adminPasscode.trim();
    }

    saveDb(db);
    const { adminPasscode, videos, ...publicSettings } = db.settings;
    res.json({
      ok: true,
      settings: {
        ...publicSettings,
        videos: toPublicVideos(videos),
        hasAppsScriptWebhook: Boolean(db.settings.appsScriptUrl?.trim()),
      },
    });
  });

  // Get All Orders
  app.get('/api/orders', (_req, res) => {
    const db = loadDb();
    const sortedOrders = [...db.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json({ orders: sortedOrders });
  });

  // Create New Order (from Sales Page Form)
  app.post('/api/orders', async (req, res) => {
    const db = loadDb();
    const body = req.body || {};

    const productType: 'RECHARGEABLE' | 'NON_RECHARGEABLE' =
      body.productType === 'NON_RECHARGEABLE'
        ? 'NON_RECHARGEABLE'
        : 'RECHARGEABLE';

    const quantity = Math.max(1, Math.min(50, Number(body.quantity) || 1));
    const unitPrice =
      productType === 'RECHARGEABLE'
        ? db.settings.rechargeablePrice
        : db.settings.nonRechargeablePrice;
    const totalAmount = unitPrice * quantity;

    const customerName = String(body.customerName || '').trim();
    const phone = String(body.phone || '').trim();
    const state = String(body.state || 'Lagos').trim();
    const city = String(body.city || '').trim();
    const address = String(body.address || '').trim();

    if (!customerName || !phone || !city || !address) {
      res.status(400).json({
        error: 'Please fill in your full name, phone number, city/town, and delivery address.',
      });
      return;
    }

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const nowIso = new Date().toISOString();

    const newOrder: OrderRecord = {
      id: `SHITTU-${randomDigits}`,
      createdAt: nowIso,
      updatedAt: nowIso,
      productType,
      unitPrice,
      quantity,
      totalAmount,
      customerName,
      phone,
      email: String(body.email || '').trim(),
      state,
      city,
      address,
      orderNote: String(body.orderNote || '').trim(),
      paymentMethod: String(body.paymentMethod || 'Pay on delivery').trim(),
      status: 'Pending',
      adminNote: '',
      sheetSynced: false,
    };

    // Decrement stock if positive
    if (db.settings.stockCount > 0) {
      db.settings.stockCount = Math.max(0, db.settings.stockCount - quantity);
    }

    // Attempt live Google Apps Script Webhook sync if configured
    if (db.settings.appsScriptUrl?.trim()) {
      const syncResult = await pushOrderToAppsScript(
        db.settings.appsScriptUrl,
        newOrder
      );
      newOrder.sheetSynced = syncResult.ok;
      if (syncResult.ok) {
        newOrder.sheetSyncedAt = new Date().toISOString();
        newOrder.sheetSyncError = undefined;
      } else {
        newOrder.sheetSyncError = syncResult.error;
      }
    }

    db.orders.unshift(newOrder);
    saveDb(db);

    res.status(201).json({
      ok: true,
      order: newOrder,
      stockCount: db.settings.stockCount,
    });
  });

  // Update Order Status or Admin Notes
  app.patch('/api/orders/:id', async (req, res) => {
    const db = loadDb();
    const { id } = req.params;
    const index = db.orders.findIndex((o) => o.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const body = req.body || {};
    const order = db.orders[index];

    if (
      body.status &&
      ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'].includes(
        body.status
      )
    ) {
      order.status = body.status;
    }

    if (typeof body.adminNote === 'string') {
      order.adminNote = body.adminNote;
    }

    order.updatedAt = new Date().toISOString();

    if (db.settings.appsScriptUrl?.trim()) {
      const syncResult = await pushOrderToAppsScript(
        db.settings.appsScriptUrl,
        order
      );
      order.sheetSynced = syncResult.ok;
      if (syncResult.ok) {
        order.sheetSyncedAt = new Date().toISOString();
        order.sheetSyncError = undefined;
      } else {
        order.sheetSyncError = syncResult.error;
      }
    }

    db.orders[index] = order;
    saveDb(db);
    res.json({ ok: true, order });
  });

  // Delete an Order
  app.delete('/api/orders/:id', (req, res) => {
    const db = loadDb();
    const { id } = req.params;
    const initialLen = db.orders.length;
    db.orders = db.orders.filter((o) => o.id !== id);

    if (db.orders.length === initialLen) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    saveDb(db);
    res.json({ ok: true });
  });

  // Manually Sync Single Order to Google Sheet
  app.post('/api/orders/:id/sync', async (req, res) => {
    const db = loadDb();
    const { id } = req.params;
    const order = db.orders.find((o) => o.id === id);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const syncResult = await pushOrderToAppsScript(
      db.settings.appsScriptUrl,
      order
    );
    order.sheetSynced = syncResult.ok;
    if (syncResult.ok) {
      order.sheetSyncedAt = new Date().toISOString();
      order.sheetSyncError = undefined;
    } else {
      order.sheetSyncError = syncResult.error;
    }

    saveDb(db);
    res.json({ ok: syncResult.ok, order, error: syncResult.error });
  });

  // Batch Sync All Orders to Google Sheet
  app.post('/api/orders/sync-all', async (_req, res) => {
    const db = loadDb();
    if (!db.settings.appsScriptUrl?.trim()) {
      res.status(400).json({
        ok: false,
        error: 'Please save your Google Apps Script Web App URL in Settings first.',
      });
      return;
    }

    const syncResult = await pushBatchToAppsScript(
      db.settings.appsScriptUrl,
      db.orders
    );

    const nowIso = new Date().toISOString();
    if (syncResult.ok) {
      db.orders = db.orders.map((order) => ({
        ...order,
        sheetSynced: true,
        sheetSyncedAt: nowIso,
        sheetSyncError: undefined,
      }));
      saveDb(db);
    }

    res.json({
      ok: syncResult.ok,
      orders: db.orders,
      error: syncResult.error,
    });
  });

  // Test Webhook Connection with Sample Payload
  app.post('/api/webhook/test', async (req, res) => {
    const db = loadDb();
    const targetUrl = String(
      req.body?.appsScriptUrl || db.settings.appsScriptUrl || ''
    ).trim();

    if (!targetUrl) {
      res.status(400).json({
        ok: false,
        error: 'Please enter a Google Apps Script Web App URL to test.',
      });
      return;
    }

    const sampleOrder: OrderRecord = {
      id: 'SHITTU-TEST',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      productType: 'RECHARGEABLE',
      unitPrice: db.settings.rechargeablePrice,
      quantity: 1,
      totalAmount: db.settings.rechargeablePrice,
      customerName: 'ShittuStores Webhook Test',
      phone: '08031234567',
      email: 'orders@shittustores.com',
      state: 'Lagos',
      city: 'Ikeja',
      address: 'Test Connection Row from ShittuStores by Advibe Studios Commerce',
      orderNote: 'Webhook connection verified successfully!',
      paymentMethod: 'Pay on delivery',
      status: 'Confirmed',
      adminNote: 'Automated Connection Test',
      sheetSynced: true,
    };

    const result = await pushOrderToAppsScript(targetUrl, sampleOrder);
    res.json(result);
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bora Direct Offer Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
