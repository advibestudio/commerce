import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Flame,
  Mail,
  MessageCircle,
  Printer,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import {
  META_PIXEL_ID,
  Order,
  StoreSettings,
  formatNaira,
  formatNigerianWhatsAppPhone,
  trackMetaPixelPurchase,
} from '../types';

interface ThankYouPageProps {
  order: Order;
  settings: StoreSettings;
  onReturnToStore: () => void;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({
  order,
  settings,
  onReturnToStore,
}) => {
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Scroll to top & fire Meta Pixel Purchase conversion with dynamic NGN total
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackMetaPixelPurchase(order);
  }, [order]);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const storeWaPhone = formatNigerianWhatsAppPhone(
    settings.whatsappNumber || '2348030000000'
  );
  const variantLabel =
    order.productType === 'RECHARGEABLE' ? 'RECHARGEABLE' : 'NON RECHARGEABLE';

  const customerToStoreMsg = [
    `Hello ShittuStores (Advibe Studios Commerce), I just placed an order on your website!`,
    ``,
    `*Order ID:* ${order.id}`,
    `*Product:* High Quality 5-Jet Mist Fan (${variantLabel})`,
    `*Quantity:* ${order.quantity} (${formatNaira(order.unitPrice)} each)`,
    `*Total (Pay on Delivery):* ${formatNaira(order.totalAmount)}`,
    `*Delivery Schedule:* Within 24–48 Hours (Free Doorstep Delivery)`,
    `*Name:* ${order.customerName}`,
    `*Phone:* ${order.phone}`,
    ...(order.email ? [`*Email:* ${order.email}`] : []),
    `*Address:* ${order.address}, ${order.city}, ${order.state}`,
    ...(order.orderNote ? [`*Note:* ${order.orderNote}`] : []),
  ].join('\n');

  const waUrl = `https://wa.me/${storeWaPhone}?text=${encodeURIComponent(
    customerToStoreMsg
  )}`;

  const hasCustomerEmail = Boolean(
    order.email && order.email.trim().includes('@')
  );

  const purchasePixelNoscriptUrl = `https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=Purchase&cd[value]=${encodeURIComponent(
    String(order.totalAmount)
  )}&cd[currency]=NGN&cd[content_type]=product&cd[num_items]=${encodeURIComponent(
    String(order.quantity)
  )}&noscript=1`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      {/* Meta Pixel Purchase Fallback for Non-JS / Strict Browsers */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={purchasePixelNoscriptUrl}
          alt=""
        />
      </noscript>

      {/* Top Storefront Header */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="font-display font-extrabold text-slate-900 tracking-tight">
              ShittuStores
            </span>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="text-xs font-medium text-slate-500">
              Order Confirmation
            </span>
          </div>

          <button
            type="button"
            onClick={onReturnToStore}
            className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Product Page</span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 space-y-6">
        {/* Main Thank You & WhatsApp Card */}
        <section className="bg-white rounded-3xl border-2 border-emerald-500/40 p-6 sm:p-10 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <p className="text-xs font-display font-extrabold tracking-wider uppercase text-emerald-700">
            PRE-ORDER CONFIRMED · PAY ON DELIVERY
          </p>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-950 mt-1.5">
            Thank You, {order.customerName}!
          </h1>

          <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
            Your order for the{' '}
            <strong className="font-semibold text-slate-900">
              High Quality 5-Jet Mist Fan ({variantLabel})
            </strong>{' '}
            has been received. Your doorstep delivery to{' '}
            <strong className="font-semibold text-slate-900">
              {order.city}, {order.state}
            </strong>{' '}
            will be scheduled within{' '}
            <strong className="font-semibold text-emerald-700">
              24–48 hours
            </strong>
            .
          </p>

          {/* Primary WhatsApp CTA Box */}
          <div className="mt-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 p-5 sm:p-6">
            <p className="text-xs sm:text-sm font-display font-bold text-emerald-950 mb-3">
              Tap the button below to message our dispatch desk on WhatsApp for
              priority courier scheduling:
            </p>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-extrabold text-base sm:text-lg shadow-sm transition-colors"
            >
              <MessageCircle className="w-5 h-5 shrink-0" />
              <span>Continue to Our WhatsApp Now</span>
            </a>
            <p className="text-[11px] sm:text-xs text-emerald-800 mt-2.5">
              Opens WhatsApp with your Order ID ({order.id}) and delivery
              details pre-filled
            </p>
          </div>

          {/* 24-48 Hours Delivery & Gmail Pre-Order Receipt Notice */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs sm:text-sm font-display font-bold text-slate-900">
                  24–48 Hours Delivery Schedule
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Our dispatch courier will call{' '}
                  <span className="font-mono-num font-semibold text-slate-800">
                    {order.phone}
                  </span>{' '}
                  to deliver your package within 24–48 hours.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs sm:text-sm font-display font-bold text-slate-900">
                  {hasCustomerEmail
                    ? 'Gmail Pre-Order Receipt Sent'
                    : 'Pre-Order Receipt Logged'}
                </h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {hasCustomerEmail ? (
                    <>
                      A pre-order confirmation receipt has been sent to{' '}
                      <span className="font-semibold text-slate-800 break-all">
                        {order.email}
                      </span>{' '}
                      with your 24–48hr delivery schedule.
                    </>
                  ) : (
                    <>
                      Your official pre-order receipt is shown below. You can
                      copy your Order ID or print a copy anytime.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Official Pre-Order Confirmation Receipt Card */}
          <div className="mt-6 bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-6 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-display font-bold uppercase tracking-wider text-slate-400 block">
                  PRE-ORDER CONFIRMATION RECEIPT
                </span>
                <span className="font-mono-num font-extrabold text-lg sm:text-xl text-blue-700">
                  {order.id}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Product</span>
                <span className="font-semibold text-slate-900">
                  5-Jet Mist Fan ({variantLabel})
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Quantity</span>
                <span className="font-mono-num font-semibold text-slate-900">
                  {order.quantity} × {formatNaira(order.unitPrice)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">
                  Delivery Fee
                </span>
                <span className="font-semibold text-emerald-700">
                  FREE Doorstep Delivery (₦0)
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">
                  Total Payable on Delivery
                </span>
                <span className="font-mono-num font-extrabold text-base sm:text-lg text-blue-700">
                  {formatNaira(order.totalAmount)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div>
                <span className="font-semibold text-slate-800">
                  Customer:{' '}
                </span>
                {order.customerName} ({order.phone}
                {hasCustomerEmail ? ` · ${order.email}` : ''})
              </div>
              <div>
                <span className="font-semibold text-slate-800">
                  Delivery Address:{' '}
                </span>
                {order.address}, {order.city}, {order.state}
              </div>
              <div>
                <span className="font-semibold text-slate-800">
                  Estimated Delivery Window:{' '}
                </span>
                <span className="text-emerald-700 font-semibold">
                  Scheduled within 24–48 hours (Pay on Delivery via Cash or POS)
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Action */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-sm transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat With Us on WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={onReturnToStore}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-sm transition-colors cursor-pointer"
            >
              Place Another Order
            </button>
          </div>
        </section>

        {/* Trust Footer Strip */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Pay on Delivery · Inspect Before Paying</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Nationwide Express Dispatch (24–48 Hours)</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>ShittuStores by Advibe Studios Commerce</span>
          </div>
        </div>
      </main>
    </div>
  );
};
