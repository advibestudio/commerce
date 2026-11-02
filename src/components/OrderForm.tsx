import React, { useState } from 'react';
import {
  CheckCircle2,
  Lock,
  Minus,
  Plus,
  Truck,
  Banknote,
  MessageCircle,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  NIGERIAN_STATES,
  Order,
  ProductVariant,
  StoreSettings,
  formatNaira,
  formatNigerianWhatsAppPhone,
  postToGoogleAppsScriptDirect,
} from '../types';

interface OrderFormProps {
  settings: StoreSettings;
  onOrderCreated: (order: Order, newStockCount: number) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  settings,
  onOrderCreated,
}) => {
  const [selectedType, setSelectedType] =
    useState<ProductVariant>('RECHARGEABLE');
  const [state, setState] = useState<string>('Lagos');
  const [city, setCity] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [orderNote, setOrderNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Pay on delivery');
  const [quantity, setQuantity] = useState<number>(1);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  const unitPrice =
    selectedType === 'RECHARGEABLE'
      ? settings.rechargeablePrice
      : settings.nonRechargeablePrice;

  const subtotal = unitPrice * quantity;
  const total = subtotal; // Delivery is FREE (₦0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid Nigerian phone number (e.g. 0803 123 4567).');
      return;
    }
    if (!city.trim()) {
      setErrorMsg('Please enter your city or town.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter your full delivery street address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: selectedType,
          quantity,
          customerName: customerName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          state,
          city: city.trim(),
          address: address.trim(),
          orderNote: orderNote.trim(),
          paymentMethod,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.ok && data.order) {
          setSubmittedOrder(data.order);
          onOrderCreated(data.order, data.stockCount);
          return;
        }
      }

      // Static Hosting (GitHub Pages) Fallback: Create order directly & sync to Google Sheet Apps Script
      const nowIso = new Date().toISOString();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const fallbackOrder: Order = {
        id: `SHITTU-${randomNum}`,
        createdAt: nowIso,
        updatedAt: nowIso,
        productType: selectedType,
        unitPrice,
        quantity,
        totalAmount: total,
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        state,
        city: city.trim(),
        address: address.trim(),
        orderNote: orderNote.trim(),
        paymentMethod,
        status: 'Pending',
        adminNote: '',
        sheetSynced: false,
      };

      if (settings.appsScriptUrl) {
        const syncRes = await postToGoogleAppsScriptDirect(
          settings.appsScriptUrl,
          {
            action: 'upsert_order',
            order: fallbackOrder,
          }
        );
        fallbackOrder.sheetSynced = syncRes.ok;
        if (syncRes.ok) {
          fallbackOrder.sheetSyncedAt = new Date().toISOString();
        } else {
          fallbackOrder.sheetSyncError = syncRes.error;
        }
      }

      const nextStock = Math.max(5, settings.stockCount - quantity);
      setSubmittedOrder(fallbackOrder);
      onOrderCreated(fallbackOrder, nextStock);
    } catch {
      // Offline / Static Host Fallback
      const nowIso = new Date().toISOString();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const fallbackOrder: Order = {
        id: `SHITTU-${randomNum}`,
        createdAt: nowIso,
        updatedAt: nowIso,
        productType: selectedType,
        unitPrice,
        quantity,
        totalAmount: total,
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        state,
        city: city.trim(),
        address: address.trim(),
        orderNote: orderNote.trim(),
        paymentMethod,
        status: 'Pending',
        adminNote: '',
        sheetSynced: false,
      };

      if (settings.appsScriptUrl) {
        const syncRes = await postToGoogleAppsScriptDirect(
          settings.appsScriptUrl,
          {
            action: 'upsert_order',
            order: fallbackOrder,
          }
        );
        fallbackOrder.sheetSynced = syncRes.ok;
        if (syncRes.ok) {
          fallbackOrder.sheetSyncedAt = new Date().toISOString();
        }
      }

      const nextStock = Math.max(5, settings.stockCount - quantity);
      setSubmittedOrder(fallbackOrder);
      onOrderCreated(fallbackOrder, nextStock);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyOrderId = () => {
    if (!submittedOrder) return;
    navigator.clipboard.writeText(submittedOrder.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const resetFormForAnotherOrder = () => {
    setSubmittedOrder(null);
    setQuantity(1);
    setOrderNote('');
  };

  if (submittedOrder) {
    const storeWaPhone = formatNigerianWhatsAppPhone(
      settings.whatsappNumber || '2348030000000'
    );
    const variantLabel =
      submittedOrder.productType === 'RECHARGEABLE'
        ? 'RECHARGEABLE'
        : 'NON RECHARGEABLE';
    const customerToStoreMsg = [
      `Hello ShittuStores (Advibe Studios Commerce), I just placed an order on your website!`,
      ``,
      `*Order ID:* ${submittedOrder.id}`,
      `*Product:* High Quality Mist Fan (${variantLabel})`,
      `*Quantity:* ${submittedOrder.quantity}`,
      `*Total (Pay on Delivery):* ${formatNaira(submittedOrder.totalAmount)}`,
      `*Name:* ${submittedOrder.customerName}`,
      `*Address:* ${submittedOrder.address}, ${submittedOrder.city}, ${submittedOrder.state}`,
    ].join('\n');
    const waUrl = `https://wa.me/${storeWaPhone}?text=${encodeURIComponent(
      customerToStoreMsg
    )}`;

    return (
      <div
        id="order-form-section"
        className="bg-white rounded-3xl border-2 border-emerald-500/40 p-6 sm:p-10 shadow-sm"
      >
        <div className="max-w-xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <p className="text-xs font-display font-bold tracking-wider uppercase text-emerald-700">
            ORDER RECEIVED · PAY ON DELIVERY
          </p>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 mt-1">
            Thank You, {submittedOrder.customerName}!
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Your order has been logged for express courier dispatch to{' '}
            <span className="font-semibold text-slate-800">
              {submittedOrder.city}, {submittedOrder.state}
            </span>
            . Our dispatch support team will call{' '}
            <span className="font-mono-num font-semibold text-slate-800">
              {submittedOrder.phone}
            </span>{' '}
            shortly to verify delivery.
          </p>

          {/* Order Receipt Card */}
          <div className="mt-6 bg-slate-50 rounded-2xl border border-slate-200 p-5 text-left space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs text-slate-500 block">
                  Order Reference
                </span>
                <span className="font-mono-num font-bold text-lg text-blue-700">
                  {submittedOrder.id}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyOrderId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy ID
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Selected Type</span>
                <span className="font-semibold text-slate-900">
                  {variantLabel}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Quantity</span>
                <span className="font-mono-num font-semibold text-slate-900">
                  {submittedOrder.quantity}x ({formatNaira(submittedOrder.unitPrice)})
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">
                  Delivery Method
                </span>
                <span className="font-semibold text-emerald-700">
                  FREE Doorstep Delivery
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">
                  Total Payable on Delivery
                </span>
                <span className="font-mono-num font-extrabold text-base text-blue-700">
                  {formatNaira(submittedOrder.totalAmount)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">
                Delivery Address:{' '}
              </span>
              {submittedOrder.address}, {submittedOrder.city},{' '}
              {submittedOrder.state}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-sm transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Fast-Track Verification on WhatsApp
            </a>
            <button
              type="button"
              onClick={resetFormForAnotherOrder}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-sm transition-colors cursor-pointer"
            >
              Place Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      id="order-form-section"
      className="bg-white rounded-3xl border-2 border-indigo-200/80 p-5 sm:p-9 shadow-sm"
    >
      {/* Top Header matching Page 6 of PDF */}
      <div className="text-center max-w-xl mx-auto mb-7">
        <p className="text-xs sm:text-sm font-display font-bold tracking-wider uppercase text-blue-700">
          PAY ON DELIVERY AVAILABLE
        </p>
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 mt-1">
          Fill This Form to Order Now
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
          Pay on Delivery Available Nationwide · Fast 24–48hr Courier Dispatch
        </p>
      </div>

      {/* Variant Selector matching Page 6 of PDF */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="text-xs sm:text-sm text-slate-700 mb-2.5">
          <span className="font-bold text-slate-900">TYPES: </span>
          <span className="font-medium text-slate-700">
            {selectedType === 'RECHARGEABLE'
              ? 'RECHARGEABLE'
              : 'NON RECHARGEABLE'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedType('RECHARGEABLE')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-display font-semibold transition-all cursor-pointer border ${
              selectedType === 'RECHARGEABLE'
                ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs'
                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
            }`}
          >
            RECHARGEABLE — {formatNaira(settings.rechargeablePrice)}
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('NON_RECHARGEABLE')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-display font-semibold transition-all cursor-pointer border ${
              selectedType === 'NON_RECHARGEABLE'
                ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs'
                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
            }`}
          >
            NON RECHARGEABLE — {formatNaira(settings.nonRechargeablePrice)}
          </button>
        </div>

        <div className="mt-3 text-sm sm:text-base flex items-center gap-1.5">
          <span className="font-mono-num font-extrabold text-blue-700">
            {formatNaira(unitPrice)}
          </span>
          <span className="text-slate-400" aria-hidden="true">
            ·
          </span>
          <span className="text-slate-600">
            <span className="font-mono-num font-medium">
              {settings.stockCount}
            </span>{' '}
            in stock
          </span>
        </div>
      </div>

      {/* Inner Form Box matching Page 6 & 7 of PDF */}
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 space-y-4 shadow-xs"
      >
        <h3 className="text-lg sm:text-xl font-display font-extrabold text-slate-900">
          Order now
        </h3>

        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Row 1: State Dropdown & City/Town */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="order-state" className="sr-only">
              Delivery State
            </label>
            <select
              id="order-state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full h-12 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm sm:text-base focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
            >
              {NIGERIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="order-city" className="sr-only">
              Your city / town
            </label>
            <input
              id="order-city"
              type="text"
              required
              placeholder="Your city / town"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-12 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
            />
          </div>
        </div>

        {/* Free Doorstep Delivery Info Banner */}
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-blue-800 text-sm sm:text-base font-semibold">
          <Truck className="w-4 h-4 text-rose-500 shrink-0" />
          <span>Free doorstep delivery to your address</span>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="order-name" className="sr-only">
            Full name
          </label>
          <input
            id="order-name"
            type="text"
            required
            placeholder="Full name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full h-12 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="order-phone" className="sr-only">
            Phone (e.g. 0803 123 4567)
          </label>
          <input
            id="order-phone"
            type="tel"
            required
            placeholder="Phone (e.g. 0803 123 4567)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-12 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
          />
        </div>

        {/* Email (Optional) */}
        <div>
          <label htmlFor="order-email" className="sr-only">
            Email for order updates (optional)
          </label>
          <input
            id="order-email"
            type="email"
            placeholder="Email for order updates (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
          />
        </div>

        {/* Full Delivery Address */}
        <div>
          <label htmlFor="order-address" className="sr-only">
            Full delivery address
          </label>
          <input
            id="order-address"
            type="text"
            required
            placeholder="Full delivery address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full h-12 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
          />
        </div>

        {/* Order Note (Optional) */}
        <div>
          <label htmlFor="order-note" className="sr-only">
            Order note (optional)
          </label>
          <textarea
            id="order-note"
            rows={2}
            placeholder="Order note (optional) — e.g. preferred delivery time, landmark"
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
          />
        </div>

        {/* Payment Method */}
        <div className="pt-1">
          <label
            htmlFor="order-payment"
            className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
          >
            Payment Method
          </label>
          <select
            id="order-payment"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full h-12 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm sm:text-base focus:outline-none focus:border-blue-600"
          >
            <option value="Pay on delivery">Pay on delivery</option>
          </select>

          <div className="mt-2.5 flex items-center gap-2.5 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-600 text-xs sm:text-sm">
            <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Pay with cash or POS transfer upon physical delivery to your
              doorstep.
            </span>
          </div>
        </div>

        {/* Quantity Stepper */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-sm sm:text-base font-medium text-slate-800">
            Quantity
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="w-9 h-9 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center font-mono-num font-bold text-base text-slate-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              aria-label="Increase quantity"
              className="w-9 h-9 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subtotal, Free Delivery & Total Summary matching Page 6 & 7 */}
        <div className="pt-3 border-t border-slate-200 space-y-2.5 text-sm sm:text-base">
          <div className="flex items-center justify-between text-slate-600">
            <span>Item Subtotal ({quantity}×):</span>
            <span className="font-mono-num font-bold text-slate-900">
              {formatNaira(subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600 pb-2.5 border-b border-slate-200">
            <span>Delivery (Doorstep delivery):</span>
            <span className="font-mono-num font-bold text-emerald-600">
              FREE (₦0)
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="font-display font-bold text-base sm:text-lg text-slate-900">
              Total:
            </span>
            <span className="font-mono-num font-extrabold text-lg sm:text-xl text-blue-700">
              {formatNaira(total)}
            </span>
          </div>
        </div>

        {/* Submit CTA Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-display font-bold text-base sm:text-lg shadow-sm transition-colors cursor-pointer"
          >
            {isSubmitting
              ? 'Processing Your Order...'
              : `Order now · ${formatNaira(total)}`}
          </button>

          <p className="mt-3 text-center text-xs sm:text-sm text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Orders are verified by our support team before dispatch.</span>
          </p>
        </div>
      </form>
    </section>
  );
};
