import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Lock,
  MessageCircle,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  TrendingUp,
  AlertCircle,
  Video,
  Package,
  MapPin,
  Smartphone,
  Phone,
} from 'lucide-react';
import {
  AdminVideoItem,
  DEFAULT_APPS_SCRIPT_URL,
  DEFAULT_GOOGLE_SHEET_URL,
  GOOGLE_APPS_SCRIPT_TEMPLATE,
  Order,
  OrderStatus,
  StoreSettings,
  buildCustomerWhatsAppLink,
  fetchOrdersFromGoogleAppsScriptDirect,
  formatNaira,
  postToGoogleAppsScriptDirect,
} from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface AdminDashboardProps {
  orders: Order[];
  settings: StoreSettings;
  isAppInstallerRoute?: boolean;
  onBackToStore: () => void;
  onRefreshOrders: () => Promise<void>;
  onUpdateSettings: (updated: Partial<StoreSettings>) => Promise<boolean>;
  onOrdersUpdated: (orders: Order[]) => void;
}

const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Dispatched',
  'Delivered',
  'Cancelled',
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  settings,
  isAppInstallerRoute = false,
  onBackToStore,
  onRefreshOrders,
  onUpdateSettings,
  onOrdersUpdated,
}) => {
  // Passcode authentication state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'orders' | 'analytics' | 'settings'
  >(isAppInstallerRoute ? 'settings' : 'orders');

  // Filters for Orders Table
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [stateFilter, setStateFilter] = useState<string>('All');

  // Action states
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState<Order | null>(
    null
  );
  const [editingNoteOrder, setEditingNoteOrder] = useState<Order | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');

  // Settings form state
  const [rechargeablePrice, setRechargeablePrice] = useState<number>(
    settings.rechargeablePrice
  );
  const [nonRechargeablePrice, setNonRechargeablePrice] = useState<number>(
    settings.nonRechargeablePrice
  );
  const [originalPrice, setOriginalPrice] = useState<number>(
    settings.originalPrice
  );
  const [stockCount, setStockCount] = useState<number>(settings.stockCount);
  const [youtubeUrl, setYoutubeUrl] = useState<string>(
    settings.youtubeUrl || ''
  );
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(
    settings.appsScriptUrl || DEFAULT_APPS_SCRIPT_URL
  );
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>(
    settings.googleSheetUrl || DEFAULT_GOOGLE_SHEET_URL
  );
  const [whatsappNumber, setWhatsappNumber] = useState<string>(
    settings.whatsappNumber || ''
  );
  const [newPasscode, setNewPasscode] = useState<string>('');

  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);
  const [webhookTestStatus, setWebhookTestStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isTestingWebhook, setIsTestingWebhook] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  // Multi-Video Management state
  const [adminVideos, setAdminVideos] = useState<AdminVideoItem[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState<string>('');
  const [newVideoTitle, setNewVideoTitle] = useState<string>('');
  const [isAddingVideo, setIsAddingVideo] = useState<boolean>(false);
  const [videoActionMsg, setVideoActionMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const loadAdminVideos = async () => {
    try {
      const res = await fetch('/api/admin/videos');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.videos)) {
          setAdminVideos(data.videos);
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleAddProtectedVideo = async () => {
    if (!newVideoUrl.trim()) return;
    setIsAddingVideo(true);
    setVideoActionMsg(null);
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newVideoUrl.trim(),
          title: newVideoTitle.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setNewVideoUrl('');
        setNewVideoTitle('');
        await loadAdminVideos();
        await onRefreshOrders();
        setVideoActionMsg({
          type: 'success',
          text: 'Video downloaded, stripped of external links, and added to player!',
        });
      } else {
        setVideoActionMsg({
          type: 'error',
          text: data.error || 'Could not add video.',
        });
      }
    } catch {
      setVideoActionMsg({
        type: 'error',
        text: 'Network error while processing video.',
      });
    } finally {
      setIsAddingVideo(false);
    }
  };

  const handleDeleteProtectedVideo = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadAdminVideos();
        await onRefreshOrders();
      }
    } catch {
      // Ignore
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsVerifying(true);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.ok) {
          setIsUnlocked(true);
          loadAdminVideos();
          return;
        } else {
          setAuthError(data.error || 'Incorrect admin passcode.');
          return;
        }
      }
      // Static Hosting (GitHub Pages) fallback verification
      const expected = settings.adminPasscode || '1234';
      if (passcodeInput === expected) {
        setIsUnlocked(true);
      } else {
        setAuthError('Incorrect admin passcode.');
      }
    } catch {
      const expected = settings.adminPasscode || '1234';
      if (passcodeInput === expected) {
        setIsUnlocked(true);
      } else {
        setAuthError('Incorrect admin passcode.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Computed Analytics
  const stats = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'Cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const deliveredRevenue = orders
      .filter((o) => o.status === 'Delivered')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const pipelineRevenue = orders
      .filter((o) =>
        ['Pending', 'Confirmed', 'Dispatched'].includes(o.status)
      )
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const rechargeableOrders = validOrders.filter(
      (o) => o.productType === 'RECHARGEABLE'
    );
    const nonRechargeableOrders = validOrders.filter(
      (o) => o.productType === 'NON_RECHARGEABLE'
    );

    const syncedCount = orders.filter((o) => o.sheetSynced).length;

    // State-by-state breakdown
    const stateMap: Record<
      string,
      { state: string; ordersCount: number; units: number; revenue: number }
    > = {};

    validOrders.forEach((o) => {
      if (!stateMap[o.state]) {
        stateMap[o.state] = {
          state: o.state,
          ordersCount: 0,
          units: 0,
          revenue: 0,
        };
      }
      stateMap[o.state].ordersCount += 1;
      stateMap[o.state].units += o.quantity;
      stateMap[o.state].revenue += o.totalAmount;
    });

    const stateBreakdown = Object.values(stateMap).sort(
      (a, b) => b.revenue - a.revenue
    );

    return {
      totalOrders: orders.length,
      totalRevenue,
      deliveredRevenue,
      pipelineRevenue,
      rechargeableCount: rechargeableOrders.length,
      rechargeableRevenue: rechargeableOrders.reduce(
        (s, o) => s + o.totalAmount,
        0
      ),
      nonRechargeableCount: nonRechargeableOrders.length,
      nonRechargeableRevenue: nonRechargeableOrders.reduce(
        (s, o) => s + o.totalAmount,
        0
      ),
      syncedCount,
      stateBreakdown,
    };
  }, [orders]);

  const uniqueStatesInOrders = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => set.add(o.state));
    return Array.from(set).sort();
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'All' && order.status !== statusFilter) {
        return false;
      }
      if (stateFilter !== 'All' && order.state !== stateFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          order.id.toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          order.phone.toLowerCase().includes(q) ||
          order.city.toLowerCase().includes(q) ||
          order.state.toLowerCase().includes(q) ||
          order.address.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [orders, statusFilter, stateFilter, searchQuery]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.order) {
          onOrdersUpdated(
            orders.map((o) => (o.id === orderId ? data.order : o))
          );
          return;
        }
      }
      // Static Hosting fallback
      const target = orders.find((o) => o.id === orderId);
      if (target) {
        const updatedOrder: Order = {
          ...target,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
        if (settings.appsScriptUrl) {
          const syncRes = await postToGoogleAppsScriptDirect(
            settings.appsScriptUrl,
            { action: 'upsert_order', order: updatedOrder }
          );
          updatedOrder.sheetSynced = syncRes.ok;
        }
        onOrdersUpdated(
          orders.map((o) => (o.id === orderId ? updatedOrder : o))
        );
      }
    } catch {
      const target = orders.find((o) => o.id === orderId);
      if (target) {
        const updatedOrder: Order = {
          ...target,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
        if (settings.appsScriptUrl) {
          await postToGoogleAppsScriptDirect(settings.appsScriptUrl, {
            action: 'upsert_order',
            order: updatedOrder,
          });
        }
        onOrdersUpdated(
          orders.map((o) => (o.id === orderId ? updatedOrder : o))
        );
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleSaveAdminNote = async () => {
    if (!editingNoteOrder) return;
    setUpdatingOrderId(editingNoteOrder.id);
    try {
      const res = await fetch(`/api/orders/${editingNoteOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote: noteDraft }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.order) {
          onOrdersUpdated(
            orders.map((o) => (o.id === editingNoteOrder.id ? data.order : o))
          );
          setEditingNoteOrder(null);
          return;
        }
      }
      const updatedOrder: Order = {
        ...editingNoteOrder,
        adminNote: noteDraft,
        updatedAt: new Date().toISOString(),
      };
      if (settings.appsScriptUrl) {
        await postToGoogleAppsScriptDirect(settings.appsScriptUrl, {
          action: 'upsert_order',
          order: updatedOrder,
        });
      }
      onOrdersUpdated(
        orders.map((o) => (o.id === editingNoteOrder.id ? updatedOrder : o))
      );
      setEditingNoteOrder(null);
    } catch {
      const updatedOrder: Order = {
        ...editingNoteOrder,
        adminNote: noteDraft,
        updatedAt: new Date().toISOString(),
      };
      onOrdersUpdated(
        orders.map((o) => (o.id === editingNoteOrder.id ? updatedOrder : o))
      );
      setEditingNoteOrder(null);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async () => {
    if (!confirmDeleteOrder) return;
    const id = confirmDeleteOrder.id;
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // Ignore error on static host
    }
    onOrdersUpdated(orders.filter((o) => o.id !== id));
    setConfirmDeleteOrder(null);
  };

  const handleSyncSingleOrder = async (orderId: string) => {
    setSyncingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/sync`, {
        method: 'POST',
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.order) {
          onOrdersUpdated(
            orders.map((o) => (o.id === orderId ? data.order : o))
          );
        }
        if (!data.ok && data.error) {
          setWebhookTestStatus({
            type: 'error',
            message: `Sync notice for ${orderId}: ${data.error}`,
          });
        }
        return;
      }
      // Direct browser sync on GitHub Pages
      const target = orders.find((o) => o.id === orderId);
      if (target && settings.appsScriptUrl) {
        const directRes = await postToGoogleAppsScriptDirect(
          settings.appsScriptUrl,
          { action: 'upsert_order', order: target }
        );
        const updatedOrder: Order = {
          ...target,
          sheetSynced: directRes.ok,
          sheetSyncedAt: directRes.ok ? new Date().toISOString() : undefined,
        };
        onOrdersUpdated(
          orders.map((o) => (o.id === orderId ? updatedOrder : o))
        );
      }
    } catch {
      const target = orders.find((o) => o.id === orderId);
      if (target && settings.appsScriptUrl) {
        const directRes = await postToGoogleAppsScriptDirect(
          settings.appsScriptUrl,
          { action: 'upsert_order', order: target }
        );
        const updatedOrder: Order = {
          ...target,
          sheetSynced: directRes.ok,
          sheetSyncedAt: directRes.ok ? new Date().toISOString() : undefined,
        };
        onOrdersUpdated(
          orders.map((o) => (o.id === orderId ? updatedOrder : o))
        );
      }
    } finally {
      setSyncingOrderId(null);
    }
  };

  const handleSyncAllOrders = async () => {
    setIsSyncingAll(true);
    setWebhookTestStatus(null);
    try {
      const res = await fetch('/api/orders/sync-all', { method: 'POST' });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.orders)) {
          onOrdersUpdated(data.orders);
          setWebhookTestStatus({
            type: 'success',
            message: `Successfully synced all ${data.orders.length} orders to your Google Sheet!`,
          });
        } else {
          setWebhookTestStatus({
            type: 'error',
            message:
              data.error ||
              'Could not sync orders. Check your Google Apps Script URL in Settings.',
          });
        }
        return;
      }
      // Static Hosting fallback: direct batch upsert + pull from Google Sheet
      const targetUrl = (appsScriptUrl || settings.appsScriptUrl || '').trim();
      if (!targetUrl) {
        setWebhookTestStatus({
          type: 'error',
          message: 'Please save your Google Apps Script Web App URL in Settings first.',
        });
        return;
      }
      const batchRes = await postToGoogleAppsScriptDirect(targetUrl, {
        action: 'batch_upsert',
        orders,
      });
      const pulled = await fetchOrdersFromGoogleAppsScriptDirect(targetUrl);
      if (pulled && pulled.length > 0) {
        onOrdersUpdated(pulled);
      } else if (batchRes.ok) {
        onOrdersUpdated(orders.map((o) => ({ ...o, sheetSynced: true })));
      }
      setWebhookTestStatus({
        type: batchRes.ok ? 'success' : 'error',
        message: batchRes.ok
          ? 'Synced orders directly with your Google Sheet!'
          : batchRes.error || 'Could not reach Google Apps Script URL.',
      });
    } catch {
      const targetUrl = (appsScriptUrl || settings.appsScriptUrl || '').trim();
      if (targetUrl) {
        const batchRes = await postToGoogleAppsScriptDirect(targetUrl, {
          action: 'batch_upsert',
          orders,
        });
        setWebhookTestStatus({
          type: batchRes.ok ? 'success' : 'error',
          message: batchRes.ok
            ? 'Synced orders directly with your Google Sheet!'
            : batchRes.error || 'Could not reach Google Apps Script URL.',
        });
      }
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Order ID',
      'Date',
      'Status',
      'Variant',
      'Quantity',
      'Unit Price',
      'Total Amount',
      'Customer Name',
      'Phone',
      'Email',
      'State',
      'City',
      'Delivery Address',
      'Order Note',
      'Admin Note',
      'Sheet Synced',
    ];
    const rows = filteredOrders.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleString('en-NG'),
      o.status,
      o.productType,
      o.quantity,
      o.unitPrice,
      o.totalAmount,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.phone}"`,
      `"${o.email || ''}"`,
      `"${o.state}"`,
      `"${(o.city || '').replace(/"/g, '""')}"`,
      `"${(o.address || '').replace(/"/g, '""')}"`,
      `"${(o.orderNote || '').replace(/"/g, '""')}"`,
      `"${(o.adminNote || '').replace(/"/g, '""')}"`,
      o.sheetSynced ? 'Yes' : 'No',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `shittustores_orders_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSavedMsg(null);
    const payload: Partial<StoreSettings> = {
      rechargeablePrice: Number(rechargeablePrice),
      nonRechargeablePrice: Number(nonRechargeablePrice),
      originalPrice: Number(originalPrice),
      stockCount: Number(stockCount),
      youtubeUrl: youtubeUrl.trim(),
      appsScriptUrl: appsScriptUrl.trim(),
      googleSheetUrl: googleSheetUrl.trim(),
      whatsappNumber: whatsappNumber.trim(),
    };
    if (newPasscode.trim()) {
      payload.adminPasscode = newPasscode.trim();
    }

    const ok = await onUpdateSettings(payload);
    if (ok) {
      setNewPasscode('');
      setSettingsSavedMsg(
        'Store settings & Google Sheet webhook saved successfully!'
      );
      setTimeout(() => setSettingsSavedMsg(null), 4000);
    }
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setWebhookTestStatus(null);
    const trimmedUrl = appsScriptUrl.trim();
    try {
      await onUpdateSettings({ appsScriptUrl: trimmedUrl });
      const res = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appsScriptUrl: trimmedUrl }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.ok) {
          setWebhookTestStatus({
            type: 'success',
            message:
              'Test order (SHITTU-TEST) sent and recorded in your Google Sheet!',
          });
        } else {
          setWebhookTestStatus({
            type: 'error',
            message:
              data.error ||
              'Webhook test failed. Ensure your Apps Script is deployed with access set to "Anyone".',
          });
        }
        return;
      }

      // Direct test on static GitHub Pages
      const sampleOrder: Order = {
        id: 'SHITTU-TEST',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        productType: 'RECHARGEABLE',
        unitPrice: rechargeablePrice,
        quantity: 1,
        totalAmount: rechargeablePrice,
        customerName: 'Test Customer (Webhook Verification)',
        phone: '08030000000',
        email: 'test@shittustores.ng',
        state: 'Lagos',
        city: 'Ikeja',
        address: '10 Allen Avenue, Ikeja, Lagos',
        orderNote: 'Test webhook ping from ShittuStores Admin',
        paymentMethod: 'Pay on delivery',
        status: 'Pending',
        adminNote: 'Webhook verified',
        sheetSynced: true,
      };
      const directRes = await postToGoogleAppsScriptDirect(trimmedUrl, {
        action: 'upsert_order',
        order: sampleOrder,
      });
      setWebhookTestStatus({
        type: directRes.ok ? 'success' : 'error',
        message: directRes.ok
          ? 'Test order (SHITTU-TEST) sent and recorded in your Google Sheet!'
          : directRes.error || 'Webhook test failed.',
      });
    } catch {
      const sampleOrder: Order = {
        id: 'SHITTU-TEST',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        productType: 'RECHARGEABLE',
        unitPrice: rechargeablePrice,
        quantity: 1,
        totalAmount: rechargeablePrice,
        customerName: 'Test Customer (Webhook Verification)',
        phone: '08030000000',
        email: 'test@shittustores.ng',
        state: 'Lagos',
        city: 'Ikeja',
        address: '10 Allen Avenue, Ikeja, Lagos',
        orderNote: 'Test webhook ping from ShittuStores Admin',
        paymentMethod: 'Pay on delivery',
        status: 'Pending',
        adminNote: 'Webhook verified',
        sheetSynced: true,
      };
      const directRes = await postToGoogleAppsScriptDirect(trimmedUrl, {
        action: 'upsert_order',
        order: sampleOrder,
      });
      setWebhookTestStatus({
        type: directRes.ok ? 'success' : 'error',
        message: directRes.ok
          ? 'Test order (SHITTU-TEST) sent and recorded in your Google Sheet!'
          : directRes.error || 'Network error testing webhook URL.',
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleCopyAppsScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  // Passcode Gate Screen
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-7 sm:p-9 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={onBackToStore}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sales Page
            </button>
            <span className="text-xs font-mono-num text-slate-400">
              SHITTUSTORES ADMIN
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mb-4">
            {isAppInstallerRoute ? (
              <Smartphone className="w-6 h-6" />
            ) : (
              <Lock className="w-6 h-6" />
            )}
          </div>

          <h1 className="text-2xl font-display font-extrabold text-slate-900">
            {isAppInstallerRoute
              ? 'ShittuAdmin Mobile App Portal'
              : 'ShittuStores Order Portal'}
          </h1>
          <p className="text-xs font-semibold text-blue-700 mt-0.5">
            by Advibe Studios Commerce · Private Owner Access Only
          </p>
          <p className="text-sm text-slate-600 mt-1">
            {isAppInstallerRoute
              ? 'Enter your admin passcode to unlock and download the private ShittuAdmin Order Manager app onto your phone.'
              : 'Enter your admin passcode to view customer orders, manage Google Sheets sync, and update store pricing.'}
          </p>

          <form onSubmit={handleUnlock} className="mt-6 space-y-4">
            {authError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {authError}
              </div>
            )}

            <div>
              <label
                htmlFor="admin-passcode"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Admin Passcode
              </label>
              <input
                id="admin-passcode"
                type="password"
                required
                autoFocus
                placeholder="Enter passcode (Default: 1234)"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-300 text-slate-900 font-mono-num text-base focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Default passcode is <span className="font-mono-num font-bold text-slate-700">1234</span> (changeable in Settings).
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3.5 px-5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-display font-bold text-sm transition-colors cursor-pointer"
            >
              {isVerifying
                ? 'Verifying...'
                : isAppInstallerRoute
                ? 'Unlock & Get Mobile App'
                : 'Unlock Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const activeSheetLink =
    (googleSheetUrl || settings.googleSheetUrl || DEFAULT_GOOGLE_SHEET_URL).trim();
  const activeAppsScriptLink =
    (appsScriptUrl || settings.appsScriptUrl || DEFAULT_APPS_SCRIPT_URL).trim();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 md:pb-16">
      {/* Mobile & Desktop Responsive Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
          <button
            type="button"
            onClick={onBackToStore}
            className="text-sm sm:text-lg font-display font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-1.5 sm:gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-700 shrink-0" />
            <span className="truncate">ShittuAdmin</span>
            <span className="hidden sm:inline text-slate-400 font-normal text-sm">
              · Operations
            </span>
          </button>

          {/* Desktop Navigation Tabs (Hidden on mobile where Bottom Nav is used) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`py-5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'orders'
                  ? 'border-blue-700 text-blue-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Orders Pipeline ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`py-5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'analytics'
                  ? 'border-blue-700 text-blue-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Revenue & States
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`py-5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-blue-700 text-blue-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Google Sheet & Settings
            </button>
          </nav>

          {/* Right Quick Actions (Mobile-optimized) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {activeSheetLink && (
              <a
                href={activeSheetLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Open Google Sheet"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-display font-bold transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden xs:inline sm:inline">Sheet</span>
              </a>
            )}
            <PWAInstallButton variant="compact" />
            <button
              type="button"
              onClick={onBackToStore}
              className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-display font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="sm:hidden">Store</span>
              <span className="hidden sm:inline">View Live Sales Page</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        {/* Private Admin Mobile App Installer Card (Highlighted on /admin-app or Settings tab) */}
        {(isAppInstallerRoute || activeTab === 'settings') && (
          <PWAInstallButton variant="card" />
        )}

        {/* KPI Summary Row — Compact 2x2 Grid on Mobile, 4 Columns on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-5">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 block">
              Gross Order Value
            </span>
            <p className="text-base sm:text-2xl font-mono-num font-extrabold text-slate-900 mt-0.5 sm:mt-1 truncate">
              {formatNaira(stats.totalRevenue)}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
              <span className="font-mono-num font-semibold text-slate-700">
                {stats.totalOrders}
              </span>{' '}
              total orders
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-5">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 block">
              Delivered Cash
            </span>
            <p className="text-base sm:text-2xl font-mono-num font-extrabold text-emerald-700 mt-0.5 sm:mt-1 truncate">
              {formatNaira(stats.deliveredRevenue)}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">
              Pipeline:{' '}
              <span className="font-mono-num font-semibold text-blue-700">
                {formatNaira(stats.pipelineRevenue)}
              </span>
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-5">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 block">
              Variant Split
            </span>
            <div className="mt-1 sm:mt-1.5 space-y-1 text-[11px] sm:text-xs">
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-600 truncate">Rechargeable:</span>
                <span className="font-mono-num font-bold text-slate-900 shrink-0">
                  {stats.rechargeableCount}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-600 truncate">Non-Rech:</span>
                <span className="font-mono-num font-bold text-slate-900 shrink-0">
                  {stats.nonRechargeableCount}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">
                Google Sheet
              </span>
              <span className="text-[11px] sm:text-xs font-mono-num font-semibold text-emerald-700 shrink-0">
                {stats.syncedCount}/{stats.totalOrders}
              </span>
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              {activeSheetLink && (
                <a
                  href={activeSheetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 px-2.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-[11px] sm:text-xs font-display font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span className="truncate">Open Sheet</span>
                </a>
              )}
              {activeAppsScriptLink ? (
                <button
                  type="button"
                  onClick={handleSyncAllOrders}
                  disabled={isSyncingAll}
                  className="w-full py-1.5 sm:py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-[11px] sm:text-xs font-display font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    {isSyncingAll ? 'Syncing...' : 'Sync Sheet'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 text-[11px] sm:text-xs font-display font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Settings className="w-3 h-3 shrink-0" />
                  <span className="truncate">Setup Sheet</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Feedback Toast Banner */}
        {webhookTestStatus && (
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border flex items-start sm:items-center justify-between gap-3 text-xs sm:text-sm ${
              webhookTestStatus.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="flex items-start sm:items-center gap-2.5">
              {webhookTestStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
              )}
              <span className="leading-snug">{webhookTestStatus.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setWebhookTestStatus(null)}
              className="text-xs font-semibold underline shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: ORDERS PIPELINE */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Toolbar: Search, Status Segmented Filter, State Dropdown, CSV Export */}
            <div className="p-3.5 sm:p-5 border-b border-slate-200 space-y-3 sm:space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Order ID, name, phone, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* State Filter + Actions */}
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0">
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    aria-label="Filter by state"
                    className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-blue-600 shrink-0"
                  >
                    <option value="All">All States ({orders.length})</option>
                    {uniqueStatesInOrders.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={onRefreshOrders}
                    className="h-9 sm:h-10 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="h-9 sm:h-10 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Status Pipeline Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {(['All', ...ORDER_STATUSES] as const).map((status) => {
                  const count =
                    status === 'All'
                      ? orders.length
                      : orders.filter((o) => o.status === status).length;
                  const active = statusFilter === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-display font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      {status} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Empty State */}
            {filteredOrders.length === 0 ? (
              <div className="p-10 sm:p-12 text-center">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-base font-display font-bold text-slate-800">
                  No matching orders found
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Try clearing your search or status filter, or place a test
                  order on the sales page.
                </p>
              </div>
            ) : (
              <>
                {/* MOBILE VIEW (< 768px): Touch-Friendly Stacked Order Cards */}
                <div className="md:hidden divide-y divide-slate-200">
                  {filteredOrders.map((order) => {
                    const waLink = buildCustomerWhatsAppLink(order);
                    return (
                      <div key={order.id} className="p-4 space-y-3">
                        {/* Card Top Row: ID, Timestamp, Total Price */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono-num font-extrabold text-sm text-blue-700">
                                {order.id}
                              </span>
                              <span
                                className={`text-[10px] font-mono-num px-1.5 py-0.5 rounded font-semibold ${
                                  order.sheetSynced
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {order.sheetSynced ? 'Sheet Synced' : 'Local'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono-num block mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString(
                                'en-NG',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-mono-num font-extrabold text-base text-slate-900 block">
                              {formatNaira(order.totalAmount)}
                            </span>
                            <span className="text-[11px] font-display font-bold text-slate-600">
                              {order.quantity}×{' '}
                              {order.productType === 'RECHARGEABLE'
                                ? 'RECHARGEABLE'
                                : 'NON-RECH'}
                            </span>
                          </div>
                        </div>

                        {/* Customer & Address Box */}
                        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display font-bold text-slate-900 text-sm">
                              {order.customerName}
                            </span>
                            <span className="font-mono-num font-semibold text-slate-700">
                              {order.phone}
                            </span>
                          </div>
                          <p className="font-semibold text-blue-800">
                            {order.city} · {order.state}
                          </p>
                          <p className="text-slate-600 leading-snug">
                            {order.address}
                          </p>
                          {order.orderNote && (
                            <p className="text-amber-700 pt-1 border-t border-slate-200/70">
                              Customer Note: {order.orderNote}
                            </p>
                          )}
                          {order.adminNote && (
                            <p className="text-blue-700 font-medium pt-1 border-t border-slate-200/70">
                              Dispatch Note: {order.adminNote}
                            </p>
                          )}
                        </div>

                        {/* Status Selector + Sync Row */}
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            disabled={updatingOrderId === order.id}
                            onChange={(e) =>
                              handleStatusChange(
                                order.id,
                                e.target.value as OrderStatus
                              )
                            }
                            aria-label={`Order status for ${order.id}`}
                            className={`flex-1 h-10 px-3 rounded-xl border text-xs font-display font-bold focus:outline-none ${
                              order.status === 'Delivered'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : order.status === 'Dispatched'
                                ? 'bg-blue-50 border-blue-300 text-blue-800'
                                : order.status === 'Confirmed'
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                                : order.status === 'Cancelled'
                                ? 'bg-red-50 border-red-300 text-red-800'
                                : 'bg-amber-50 border-amber-300 text-amber-800'
                            }`}
                          >
                            {ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                Status: {st}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => handleSyncSingleOrder(order.id)}
                            disabled={syncingOrderId === order.id}
                            className="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-display font-semibold text-blue-700 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <RefreshCw
                              className={`w-3.5 h-3.5 ${
                                syncingOrderId === order.id
                                  ? 'animate-spin'
                                  : ''
                              }`}
                            />
                            <span>Sync</span>
                          </button>
                        </div>

                        {/* 1-Tap Mobile Action Buttons: Call, WhatsApp, Note, Delete */}
                        <div className="grid grid-cols-4 gap-2 pt-0.5">
                          <a
                            href={`tel:${order.phone}`}
                            className="col-span-1 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-display font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-blue-700" />
                            <span>Call</span>
                          </a>

                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="col-span-2 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-display font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          <div className="col-span-1 flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNoteOrder(order);
                                setNoteDraft(order.adminNote || '');
                              }}
                              className="h-9 flex-1 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                              title="Add/Edit Dispatch Note"
                            >
                              Note
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteOrder(order)}
                              aria-label={`Delete order ${order.id}`}
                              className="h-9 w-9 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center shrink-0 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* DESKTOP VIEW (>= 768px): Full 8-Column Operations Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-display font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">Order & Date</th>
                        <th className="py-3 px-4">Customer & Contact</th>
                        <th className="py-3 px-4">Delivery Destination</th>
                        <th className="py-3 px-4">Product & Qty</th>
                        <th className="py-3 px-4 text-right">Total (POD)</th>
                        <th className="py-3 px-4">Pipeline Status</th>
                        <th className="py-3 px-4">Sheet Sync</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {filteredOrders.map((order) => {
                        const waLink = buildCustomerWhatsAppLink(order);
                        return (
                          <tr
                            key={order.id}
                            className="hover:bg-slate-50/80 transition-colors align-top"
                          >
                            {/* Order ID & Date */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="font-mono-num font-bold text-blue-700 block">
                                {order.id}
                              </span>
                              <span className="text-xs text-slate-500 font-mono-num">
                                {new Date(order.createdAt).toLocaleDateString(
                                  'en-NG',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}
                              </span>
                            </td>

                            {/* Customer & Phone */}
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-slate-900">
                                {order.customerName}
                              </p>
                              <p className="font-mono-num text-xs text-slate-600 mt-0.5">
                                {order.phone}
                              </p>
                              {order.email && (
                                <p className="text-xs text-slate-400 truncate max-w-[180px]">
                                  {order.email}
                                </p>
                              )}
                            </td>

                            {/* Delivery Address & Notes */}
                            <td className="py-3.5 px-4 max-w-xs">
                              <p className="font-semibold text-slate-800 text-xs">
                                {order.city} · {order.state}
                              </p>
                              <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                                {order.address}
                              </p>
                              {order.orderNote && (
                                <p className="text-xs text-amber-700 mt-1">
                                  Note: {order.orderNote}
                                </p>
                              )}
                              {order.adminNote && (
                                <p className="text-xs text-blue-700 mt-1 font-medium">
                                  Dispatch: {order.adminNote}
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNoteOrder(order);
                                  setNoteDraft(order.adminNote || '');
                                }}
                                className="text-[11px] text-slate-400 hover:text-blue-700 underline mt-1 cursor-pointer"
                              >
                                {order.adminNote
                                  ? 'Edit dispatch note'
                                  : '+ Add dispatch note'}
                              </button>
                            </td>

                            {/* Variant & Qty */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="text-xs font-display font-bold text-slate-800 block">
                                {order.productType === 'RECHARGEABLE'
                                  ? 'RECHARGEABLE'
                                  : 'NON RECHARGEABLE'}
                              </span>
                              <span className="text-xs text-slate-500 font-mono-num">
                                Qty: {order.quantity} ×{' '}
                                {formatNaira(order.unitPrice)}
                              </span>
                            </td>

                            {/* Total Amount */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <span className="font-mono-num font-extrabold text-slate-900">
                                {formatNaira(order.totalAmount)}
                              </span>
                              <span className="block text-[11px] text-emerald-700">
                                Pay on Delivery
                              </span>
                            </td>

                            {/* Pipeline Status Selector */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <select
                                value={order.status}
                                disabled={updatingOrderId === order.id}
                                onChange={(e) =>
                                  handleStatusChange(
                                    order.id,
                                    e.target.value as OrderStatus
                                  )
                                }
                                aria-label={`Order status for ${order.id}`}
                                className={`h-9 px-2.5 rounded-lg border text-xs font-display font-bold focus:outline-none cursor-pointer ${
                                  order.status === 'Delivered'
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                    : order.status === 'Dispatched'
                                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                                    : order.status === 'Confirmed'
                                    ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                                    : order.status === 'Cancelled'
                                    ? 'bg-red-50 border-red-300 text-red-800'
                                    : 'bg-amber-50 border-amber-300 text-amber-800'
                                }`}
                              >
                                {ORDER_STATUSES.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Google Sheet Sync Status */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex flex-col items-start gap-1">
                                <span
                                  className={`text-xs font-medium ${
                                    order.sheetSynced
                                      ? 'text-emerald-700'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  {order.sheetSynced ? 'Synced' : 'Not synced'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleSyncSingleOrder(order.id)}
                                  disabled={syncingOrderId === order.id}
                                  className="text-[11px] font-semibold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <RefreshCw
                                    className={`w-3 h-3 ${
                                      syncingOrderId === order.id
                                        ? 'animate-spin'
                                        : ''
                                    }`}
                                  />
                                  {order.sheetSynced
                                    ? 'Re-sync'
                                    : 'Push to Sheet'}
                                </button>
                              </div>
                            </td>

                            {/* One-Click WhatsApp & Delete */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Send WhatsApp confirmation message to customer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-display font-bold transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  WhatsApp
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteOrder(order)}
                                  title="Delete order"
                                  aria-label={`Delete order ${order.id}`}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: REVENUE & STATE ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* State-by-State Breakdown */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-display font-extrabold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-700" />
                    State-by-State Order & Revenue Breakdown
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Active courier dispatch volume across Nigerian states
                  </p>
                </div>
              </div>

              {stats.stateBreakdown.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">
                  No active state orders yet.
                </p>
              ) : (
                <div className="space-y-3.5">
                  {stats.stateBreakdown.map((item) => {
                    const share =
                      stats.totalRevenue > 0
                        ? Math.round((item.revenue / stats.totalRevenue) * 100)
                        : 0;
                    return (
                      <div
                        key={item.state}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-display font-bold text-slate-900">
                            {item.state}
                          </span>
                          <div className="flex items-center gap-3 font-mono-num">
                            <span className="text-xs text-slate-600">
                              {item.ordersCount} order
                              {item.ordersCount > 1 ? 's' : ''} ({item.units}{' '}
                              unit{item.units > 1 ? 's' : ''})
                            </span>
                            <span className="font-bold text-blue-700">
                              {formatNaira(item.revenue)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${Math.max(5, share)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Variant Performance Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <div>
                <h2 className="text-lg font-display font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Product Variant Performance
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Revenue split between Rechargeable and Non-Rechargeable models
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-blue-50/40">
                  <span className="text-xs font-display font-bold text-blue-800">
                    RECHARGEABLE ({formatNaira(settings.rechargeablePrice)})
                  </span>
                  <p className="text-xl font-mono-num font-extrabold text-slate-900 mt-1">
                    {formatNaira(stats.rechargeableRevenue)}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 font-mono-num">
                    {stats.rechargeableCount} active orders
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-xs font-display font-bold text-slate-700">
                    NON RECHARGEABLE ({formatNaira(settings.nonRechargeablePrice)})
                  </span>
                  <p className="text-xl font-mono-num font-extrabold text-slate-900 mt-1">
                    {formatNaira(stats.nonRechargeableRevenue)}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 font-mono-num">
                    {stats.nonRechargeableCount} active orders
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GOOGLE SHEETS APPS SCRIPT & STORE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Store & Webhook Configuration Form */}
            <form
              onSubmit={handleSaveSettingsSubmit}
              className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 space-y-5"
            >
              <div>
                <h2 className="text-lg font-display font-extrabold text-slate-900">
                  Store Pricing, Video & Webhook Settings
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Changes apply immediately to the live ShittuStores sales page
                  and order form.
                </p>
              </div>

              {settingsSavedMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{settingsSavedMsg}</span>
                </div>
              )}

              {/* Google Apps Script Webhook URL & Direct Sheet Link */}
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <div>
                  <label
                    htmlFor="setting-sheet-url"
                    className="block text-xs font-display font-bold text-slate-900 mb-1"
                  >
                    Your Google Sheet Link (For Quick 1-Click Access)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="setting-sheet-url"
                      type="url"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      value={googleSheetUrl}
                      onChange={(e) => setGoogleSheetUrl(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:border-blue-600"
                    />
                    {googleSheetUrl && (
                      <a
                        href={googleSheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 px-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-display font-bold inline-flex items-center gap-1.5 shrink-0"
                      >
                        Open
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="setting-appscript"
                    className="block text-xs font-display font-bold text-slate-900 mb-1"
                  >
                    Google Sheet Apps Script Web App URL (For Auto-Sync)
                  </label>
                  <input
                    id="setting-appscript"
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={appsScriptUrl}
                    onChange={(e) => setAppsScriptUrl(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-mono-num focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestWebhook}
                    disabled={isTestingWebhook}
                    className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-display font-bold transition-colors cursor-pointer"
                  >
                    {isTestingWebhook
                      ? 'Sending Test Row...'
                      : 'Send Test Order to Sheet'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSyncAllOrders}
                    disabled={isSyncingAll}
                    className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-display font-semibold transition-colors cursor-pointer"
                  >
                    {isSyncingAll
                      ? 'Syncing...'
                      : `Push All ${orders.length} Orders`}
                  </button>
                </div>
              </div>

              {/* Variant Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label
                    htmlFor="setting-rech-price"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Rechargeable Price (₦)
                  </label>
                  <input
                    id="setting-rech-price"
                    type="number"
                    required
                    value={rechargeablePrice}
                    onChange={(e) =>
                      setRechargeablePrice(Number(e.target.value))
                    }
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 font-mono-num text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="setting-nonrech-price"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Non-Rechargeable (₦)
                  </label>
                  <input
                    id="setting-nonrech-price"
                    type="number"
                    required
                    value={nonRechargeablePrice}
                    onChange={(e) =>
                      setNonRechargeablePrice(Number(e.target.value))
                    }
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 font-mono-num text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="setting-orig-price"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Strikethrough Price (₦)
                  </label>
                  <input
                    id="setting-orig-price"
                    type="number"
                    required
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 font-mono-num text-sm"
                  />
                </div>
              </div>

              {/* Stock Count & WhatsApp Support Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="setting-stock"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Available Stock Count
                  </label>
                  <input
                    id="setting-stock"
                    type="number"
                    required
                    value={stockCount}
                    onChange={(e) => setStockCount(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 font-mono-num text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="setting-wa"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Store WhatsApp Number
                  </label>
                  <input
                    id="setting-wa"
                    type="text"
                    placeholder="2348031234567"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 font-mono-num text-sm"
                  />
                </div>
              </div>

              {/* Protected Product Demo Videos Manager (Hides TikTok/External Links) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <span className="text-xs font-display font-bold text-slate-900 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-rose-600" />
                    Protected Product Demo Videos ({adminVideos.length || (settings.videos?.length ?? 1)})
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Paste any TikTok video URL or MP4 link below. Our server downloads the raw video and streams it privately so visitors can never see or copy the original link.
                  </p>
                </div>

                {videoActionMsg && (
                  <div
                    className={`p-2.5 rounded-lg text-xs font-medium ${
                      videoActionMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {videoActionMsg.text}
                  </div>
                )}

                {/* Existing Protected Videos List */}
                <div className="space-y-2">
                  {(adminVideos.length > 0 ? adminVideos : settings.videos || []).map(
                    (vid, index) => (
                      <div
                        key={vid.id}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-slate-200 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-display font-bold text-slate-800 truncate">
                            #{index + 1} · {vid.title}
                          </p>
                          <p className="text-[11px] text-emerald-700 font-mono-num">
                            Link Hidden · Streaming via {vid.streamUrl}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteProtectedVideo(vid.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0 cursor-pointer"
                          title="Remove video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  )}
                </div>

                {/* Add Another Video Form */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <input
                    type="text"
                    placeholder="Video Title (e.g. Live Mist Spray Demo #2)"
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="Paste TikTok link (https://www.tiktok.com/@.../video/...)"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddProtectedVideo}
                      disabled={isAddingVideo || !newVideoUrl.trim()}
                      className="h-10 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-display font-bold whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {isAddingVideo ? 'Caching Video...' : '+ Add Video'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Change Admin Passcode */}
              <div>
                <label
                  htmlFor="setting-passcode"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Update Admin Passcode (Leave blank to keep current)
                </label>
                <input
                  id="setting-passcode"
                  type="password"
                  placeholder="Enter new passcode"
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 font-mono-num text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-display font-bold text-sm transition-colors cursor-pointer"
              >
                Save All Store & Integration Settings
              </button>
            </form>

            {/* Right Column: Ready-to-Copy Google Apps Script Code */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-display font-extrabold text-slate-900">
                    Google Sheet Apps Script Setup (60 Seconds)
                  </h2>
                  <button
                    type="button"
                    onClick={handleCopyAppsScript}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-display font-bold transition-colors cursor-pointer"
                  >
                    {copiedScript ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied Script!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Apps Script
                      </>
                    )}
                  </button>
                </div>

                <ol className="mt-3 space-y-1.5 text-xs text-slate-600 list-decimal list-inside">
                  <li>
                    Open your Google Sheet and click{' '}
                    <span className="font-semibold text-slate-900">
                      Extensions &gt; Apps Script
                    </span>
                    .
                  </li>
                  <li>
                    Paste the script below and click{' '}
                    <span className="font-semibold text-slate-900">
                      Deploy &gt; New deployment &gt; Web app
                    </span>
                    .
                  </li>
                  <li>
                    Set <span className="font-semibold">Execute as: Me</span> and{' '}
                    <span className="font-semibold">
                      Who has access: Anyone
                    </span>
                    , then copy the Web App URL into the box on the left!
                  </li>
                </ol>

                <pre className="mt-4 p-4 rounded-xl bg-slate-950 text-slate-100 font-mono-num text-[11px] leading-relaxed overflow-x-auto max-h-[380px] border border-slate-800">
                  {GOOGLE_APPS_SCRIPT_TEMPLATE}
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                <span>
                  Every new order and status update is automatically pushed to
                  your sheet.
                </span>
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-display font-bold text-blue-700 hover:underline shrink-0 ml-3"
                >
                  Create New Sheet
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Edit Admin / Dispatch Note */}
      {editingNoteOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-display font-bold text-slate-900">
              Dispatch Note for {editingNoteOrder.id}
            </h3>
            <p className="text-xs text-slate-500">
              Customer: {editingNoteOrder.customerName} ({editingNoteOrder.city},{' '}
              {editingNoteOrder.state})
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Assigned to GIG Logistics, Rider phone 080..., scheduled for tomorrow 11am"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-600"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingNoteOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAdminNote}
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-display font-bold cursor-pointer"
              >
                Save & Sync Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation (Mandatory Confirmation Dialog) */}
      {confirmDeleteOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-display font-bold text-slate-900">
              Delete Order {confirmDeleteOrder.id}?
            </h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to permanently remove the order for{' '}
              <span className="font-semibold text-slate-900">
                {confirmDeleteOrder.customerName}
              </span>{' '}
              ({formatNaira(confirmDeleteOrder.totalAmount)})? This action
              cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteOrder}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-display font-bold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar for Mobile Admin App (< 768px) */}
      <nav
        aria-label="Mobile Admin Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 grid grid-cols-3 gap-1 shadow-lg"
      >
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-display font-bold transition-colors cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4 mb-0.5" />
          <span>Orders ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-display font-bold transition-colors cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 mb-0.5" />
          <span>Revenue & States</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[11px] font-display font-bold transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4 mb-0.5" />
          <span>Sheet & Settings</span>
        </button>
      </nav>
    </div>
  );
};

