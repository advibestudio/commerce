/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Flame,
  HelpCircle,
  Play,
  ShieldCheck,
  Star,
  Truck,
  Zap,
  Share2,
} from 'lucide-react';
import {
  Order,
  StoreSettings,
  formatNaira,
} from './types';
import { ImageCarousel } from './components/ImageCarousel';
import { OrderForm } from './components/OrderForm';
import { AdminDashboard } from './components/AdminDashboard';
import { ProtectedVideoPlayer } from './components/ProtectedVideoPlayer';

const KEY_ADVANTAGES = [
  'Turn on 3-in-1 function: includes functions of fan, air conditioner and air humidifier.',
  'If you feel the air is dry and hot, buy it.',
  'It is not only a personal air conditioner but also an air humidifier.',
  'In hot summer, when you add ice cubes and water to the sink, you will feel the cool air and enjoy the cool summer.',
  'Portable Design and Large Capacity: The portable design air cooler fan can be easily carried anywhere.',
  'In summer, this is the best choice for camping, you can camp easily, perfect for home, office, outdoor picnic, etc.',
];

const HOW_IT_WORKS_STEPS = [
  {
    step: '1',
    title: '1. Fill the Fast Order Form Below',
    description:
      'Enter your contact name, phone, and complete delivery address.',
  },
  {
    step: '2',
    title: '2. Fast Dispatch by Courier',
    description:
      'Your order is packaged safely and dispatched to your state promptly.',
  },
  {
    step: '3',
    title: '3. Inspect & Pay on Delivery',
    description:
      'Meet the courier, inspect your package, and make payment conveniently.',
  },
];

const DIRECT_SUPPLY_COMPARISONS = [
  {
    title: 'Original Factory Materials',
    comparison: 'Heavy-duty components vs cheap brittle recycled plastics.',
  },
  {
    title: 'Doorstep Delivery Inspection',
    comparison:
      'See your order before completing payment vs blind online transfers.',
  },
  {
    title: 'Prompt WhatsApp Customer Care',
    comparison: 'Immediate local human assistance vs ignored support emails.',
  },
];

const VERIFIED_REVIEWS = [
  {
    quote:
      '“Delivered within 24 hours of ordering! Packed securely and functions wonderfully. Will order again.”',
    author: 'Mrs. Folashade A. (Lagos)',
  },
  {
    quote:
      '“Legit item. Pay on delivery was so convenient and courier was very courteous. 10/10 recommendation.”',
    author: 'Emmanuel K. (Abuja)',
  },
  {
    quote:
      '“Great craftsmanship. Much better than the ones sold in local street markets.”',
    author: 'Dr. Chioma E. (Port Harcourt)',
  },
];

function extractYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
  if (shortsMatch) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }
  const shortLinkMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (shortLinkMatch) {
    return `https://www.youtube.com/embed/${shortLinkMatch[1]}`;
  }
  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed;
  }
  return null;
}

function isUrlAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    hash === '#admin' ||
    hash === '#/admin' ||
    search.includes('admin=1') ||
    search.includes('view=admin')
  );
}

export default function App() {
  const [view, setView] = useState<'store' | 'admin'>(() =>
    isUrlAdminRoute() ? 'admin' : 'store'
  );
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [settings, setSettings] = useState<StoreSettings>({
    rechargeablePrice: 45500,
    nonRechargeablePrice: 40500,
    originalPrice: 58000,
    stockCount: 38,
    youtubeUrl: '',
    appsScriptUrl: '',
    googleSheetUrl: '',
    whatsappNumber: '2348030000000',
  });
  const [orders, setOrders] = useState<Order[]>([]);

  // Countdown timer starting at 04:26:26 (15,986 seconds) matching Page 2 of PDF
  const [secondsLeft, setSecondsLeft] = useState<number>(4 * 3600 + 26 * 60 + 26);

  const fetchStoreData = useCallback(async () => {
    try {
      const [settingsRes, ordersRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/orders'),
      ]);
      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setSettings((prev) => ({ ...prev, ...sData }));
      }
      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        if (Array.isArray(oData.orders)) {
          setOrders(oData.orders);
        }
      }
    } catch {
      // Keep defaults on initial offline load
    }
  }, []);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  useEffect(() => {
    const syncRoute = () => {
      setView(isUrlAdminRoute() ? 'admin' : 'store');
    };
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 4 * 3600 + 26 * 60 + 26));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (totalSecs: number) => {
    const hrs = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSecs % 60).padStart(2, '0');
    return `${hrs} : ${mins} : ${secs}`;
  };

  const handleOrderCreated = (newOrder: Order, newStockCount: number) => {
    setOrders((prev) => [newOrder, ...prev]);
    setSettings((prev) => ({ ...prev, stockCount: newStockCount }));
  };

  const handleUpdateSettings = async (
    updated: Partial<StoreSettings>
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (res.ok && data.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const scrollToOrderForm = () => {
    const el = document.getElementById('order-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (view === 'admin') {
    return (
      <AdminDashboard
        orders={orders}
        settings={settings}
        onBackToStore={() => {
          window.history.pushState({}, '', '/');
          setView('store');
        }}
        onRefreshOrders={fetchStoreData}
        onUpdateSettings={handleUpdateSettings}
        onOrdersUpdated={setOrders}
      />
    );
  }

  const minPrice = Math.min(
    settings.nonRechargeablePrice,
    settings.rechargeablePrice
  );
  const maxPrice = Math.max(
    settings.nonRechargeablePrice,
    settings.rechargeablePrice
  );
  const embedVideoUrl = extractYouTubeEmbedUrl(settings.youtubeUrl);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      {/* Top Announcement & Store Header Bar (Public Storefront Only) */}
      <div className="bg-white border-b border-slate-200/90 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="font-display font-extrabold text-slate-900 tracking-tight">
              ShittuStores
            </span>
            <span className="text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="text-xs font-medium text-slate-500">
              by Advibe Studios Commerce
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <Truck className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>
              Nationwide Doorstep Delivery · Pay on Delivery Available Across
              Nigeria
            </span>
          </div>
        </div>
      </div>

      {/* Main Single-Column Sales Funnel Container matching PDF */}
      <main className="max-w-3xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-8 space-y-6 sm:space-y-8">
        {/* SECTION 1: HERO CARD WITH CAROUSEL SLIDER & DISCOUNT PRICE (PDF Pages 1 & 2) */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-9 shadow-xs space-y-6">
          {/* Flash Sale Kicker */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50/90 border border-amber-200/80 text-amber-700 text-[11px] sm:text-xs font-display font-extrabold tracking-wide uppercase">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>FLASH SALE · NATIONWIDE EXPRESS DELIVERY</span>
          </div>

          {/* Product Headline & Subheadline */}
          <div>
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-slate-950 tracking-tight leading-[1.15]">
              HIGH QUALITY MIST FAN WITH COLOUR CHANGING LED LIGHT
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2.5">
              Direct Factory Wholesale Stock · Doorstep Inspection &amp; Pay on
              Delivery
            </p>
          </div>

          {/* Interactive Product Image Carousel with All 9 Uploaded Images */}
          <ImageCarousel />

          {/* Direct Discount Price Box matching top of Page 2 of PDF */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <span className="text-[11px] sm:text-xs font-display font-bold uppercase tracking-wider text-slate-500 block">
                DIRECT DISCOUNT PRICE
              </span>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-mono-num font-extrabold text-blue-700">
                  {formatNaira(minPrice)} – {formatNaira(maxPrice)}
                </span>
                <span className="text-base sm:text-lg font-mono-num text-slate-400 line-through">
                  {formatNaira(settings.originalPrice)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Non-Rechargeable: <span className="font-mono-num font-semibold text-slate-700">{formatNaira(settings.nonRechargeablePrice)}</span> · Rechargeable: <span className="font-mono-num font-semibold text-slate-700">{formatNaira(settings.rechargeablePrice)}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={scrollToOrderForm}
              className="px-6 py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-display font-bold text-sm sm:text-base shadow-sm transition-colors text-left sm:text-center shrink-0 cursor-pointer"
            >
              Order Now · Pay on Delivery
            </button>
          </div>

          {/* Countdown Timer & Limited Stock Bar matching Page 2 of PDF */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Discount expires in:{' '}
                <strong className="font-mono-num font-extrabold text-slate-950">
                  {formatCountdown(secondsLeft)}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Limited Stock · Express Dispatch</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: KEY ADVANTAGES & SPECIFICATIONS (PDF Page 2) */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-9 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">
            Key Advantages &amp; Specifications
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Why this product outperforms standard market items
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {KEY_ADVANTAGES.map((advantage, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-[15px] font-semibold text-slate-800 leading-relaxed">
                  {advantage}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: THE REAL MARKET PROBLEM / ABOUT (PDF Pages 2 & 3) */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-9 shadow-xs">
          <p className="text-xs font-display font-extrabold uppercase tracking-wider text-rose-600">
            THE REAL MARKET PROBLEM
          </p>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 mt-1">
            About the HIGH QUALITY AIR COOLER FAN
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Everything you need to know before you order
          </p>

          <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 sm:p-6 text-sm sm:text-base text-slate-700 leading-relaxed space-y-3">
            <p>
              Turn on 3-in-1 function: includes functions of fan, air
              conditioner and air humidifier. If you feel the air is dry and
              hot, buy it. It is not only a personal air conditioner but also an
              air humidifier. In hot summer, when you add ice cubes and water to
              the sink, you will feel the cool air and enjoy the cool summer.
              Portable Design and Large Capacity: The portable design air cooler
              fan can be easily carried anywhere. In summer, this is the best
              choice for camping, you can camp easily, perfect for home, office,
              outdoor picnic, etc.
            </p>
            <p>
              The 600ML large water tank is filled with ice cubes and water,
              which can spray cold air for hours to keep you cool. Cools your
              body and makes you happy. Types available:{' '}
              <strong className="font-bold text-slate-900">
                RECHARGEABLE ({formatNaira(settings.rechargeablePrice)}):
              </strong>{' '}
              It can be pre-charged and used at one&apos;s convenience even when
              there is no or can&apos;t access power supply.{' '}
              <strong className="font-bold text-slate-900">
                NON-RECHARGEABLE ({formatNaira(settings.nonRechargeablePrice)}):
              </strong>{' '}
              Strictly operated with the assistance of Power-bank or power
              supply.
            </p>
          </div>
        </section>

        {/* SECTION 4: PRODUCT SHOWCASE & CLOSER LOOK (PDF Page 3) */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-9 shadow-xs space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">
              Product Showcase &amp; Closer Look
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Every angle crafted to perfection
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950">
              <img
                src="/assets/aistudio/2d00e22190f652d3f176e4ab6f8b7b61_91d885f9.jpeg"
                alt="Spray humidification cooling fan 600ml 5 sprays"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950">
              <img
                src="/assets/aistudio/710a65b7b528469c3d8ffb6d3c4c4e57_e783070b.jpeg"
                alt="7-Color LED Light Options and 1H/2H/3H Timer"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* SECTION 5: VIDEO PRESENTATION (PDF Page 4 — Protected Stream, No External Link) */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-9 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-display font-extrabold uppercase tracking-wider text-blue-700">
            <Play className="w-3.5 h-3.5 fill-blue-700" />
            <span>VIDEO PRESENTATION</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 mt-1">
            Product Demo &amp; Live Video Inspection
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Watch the build quality and operation in action
          </p>

          <div className="mt-6">
            <ProtectedVideoPlayer
              videos={settings.videos || []}
              onOrderNowClick={scrollToOrderForm}
            />
          </div>
        </section>

        {/* SECTION 6: HOW IT WORKS (FAST & RISK-FREE) (PDF Pages 4 & 5) */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-9 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">
            How It Works (Fast &amp; Risk-Free)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enjoy an effortless ordering experience in 3 simple steps
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {HOW_IT_WORKS_STEPS.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-5 flex flex-col justify-between"
              >
                <div>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-mono-num font-bold text-xs mb-3">
                    {item.step}
                  </span>
                  <h3 className="text-sm sm:text-base font-display font-extrabold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: OUR DIRECT SUPPLY VS CHEAP KNOCK-OFFS (PDF Page 5) */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-9 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">
            Our Direct Supply vs Cheap Knock-Offs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            See why smart shoppers choose our direct inventory
          </p>

          <div className="mt-5 divide-y divide-slate-200 border-t border-b border-slate-200">
            {DIRECT_SUPPLY_COMPARISONS.map((row, index) => (
              <div
                key={index}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-display font-bold text-sm sm:text-base text-slate-900">
                    {row.title}
                  </span>
                </div>
                <span className="text-xs sm:text-sm text-slate-600 sm:text-right pl-7 sm:pl-0">
                  {row.comparison}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 8: REAL VERIFIED BUYER REVIEWS (PDF Page 5) */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-9 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900">
            Real Verified Buyer Reviews
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Trusted by thousands of satisfied customers across Nigeria
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {VERIFIED_REVIEWS.map((rev, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm italic text-slate-700 leading-relaxed">
                    {rev.quote}
                  </p>
                </div>

                <div className="text-xs">
                  <span className="font-display font-bold text-slate-900">
                    {rev.author}
                  </span>
                  <span className="text-slate-400" aria-hidden="true">
                    {' '}
                    ·{' '}
                  </span>
                  <span className="font-semibold text-emerald-700">
                    Verified Buyer
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 9: 100% RISK-FREE 7-DAY REPLACEMENT GUARANTEE (PDF Pages 5 & 6) */}
        <section className="bg-emerald-50/40 rounded-3xl border border-emerald-300/80 p-6 sm:p-9 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-lg sm:text-xl font-display font-extrabold text-slate-900">
            100% Risk-Free 7-Day Replacement Guarantee
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed">
            If you encounter any factory malfunction or defect within 7 days of
            receiving your item, our team will provide a rapid replacement or
            full refund. No stress, no games.
          </p>
        </section>

        {/* SECTION 10: FILL THIS FORM TO ORDER NOW (PDF Pages 6 & 7) */}
        <OrderForm
          settings={settings}
          onOrderCreated={handleOrderCreated}
        />

        {/* SECTION 11: FREQUENTLY ASKED QUESTIONS (ACCORDIONS) — BENEATH ORDER FORM */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-9 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-display font-extrabold uppercase tracking-wider text-blue-700">
            <HelpCircle className="w-4 h-4" />
            <span>GOT QUESTIONS? WE HAVE ANSWERS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Everything you need to know about charging, battery life, and
            doorstep delivery
          </p>

          <div className="mt-6 space-y-3">
            {[
              {
                question:
                  'How long does the Rechargeable model take to charge, and how long does it last?',
                answer:
                  'The Rechargeable model takes approximately 2.5 to 3.5 hours to reach a 100% full charge using any standard USB wall adapter, power bank, laptop, or solar charger. Depending on the fan speed and mist level selected, a full charge delivers 3 to 8 hours of cordless cooling, while the 600ml tank provides up to 12 hours of continuous mist on Low (1-Spray) mode.',
              },
              {
                question: `What is the difference between the Rechargeable (${formatNaira(
                  settings.rechargeablePrice
                )}) and Non-Rechargeable (${formatNaira(
                  settings.nonRechargeablePrice
                )}) options?`,
                answer: `The Rechargeable (${formatNaira(
                  settings.rechargeablePrice
                )}) model comes with a built-in rechargeable battery so you can pre-charge it and enjoy cooling even when there is no power supply. The Non-Rechargeable (${formatNaira(
                  settings.nonRechargeablePrice
                )}) model has the exact same 5-jet mist cooling, 3 fan speeds, and 7-color LED light, and operates whenever connected to a power bank, USB adapter, or power supply.`,
              },
              {
                question:
                  'Do I pay online now or Pay on Delivery? How fast is shipping to my state?',
                answer:
                  'You do NOT need to pay online beforehand. We operate 100% Pay on Delivery across Nigeria—simply pay via cash or POS transfer when our dispatch rider hands the package to you at your doorstep. Delivery within Lagos, Abuja, and Port Harcourt takes 24 hours, and 24–48 hours to other states. Doorstep delivery is completely FREE (₦0).',
              },
              {
                question:
                  'Can I add ice cubes, cold water, or perfume to the fan?',
                answer:
                  'Yes! The wide-mouth 600ml top tank is designed for clean tap or mineral water plus ice cubes for instant air-conditioner-style cooling. If you want a fresh scent in your room, add a few drops of perfume or essential oil onto the circular center sponge pad on the front fan grille (do not pour oil directly into the water tank).',
              },
              {
                question:
                  'Is it quiet enough for sleeping, and how do I clean the tank and blades?',
                answer:
                  'Yes, it runs in Whisper-Quiet Silent Mode at just 30–40dB and includes a built-in 1H / 2H / 3H auto-off timer and soothing 7-color night light. For hygiene, the front fan guard snaps off effortlessly so you can wipe the fan blades and clean the open top water tank in seconds.',
              },
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-colors ${
                    isOpen
                      ? 'border-blue-600/40 bg-blue-50/20'
                      : 'border-slate-200/90 bg-slate-50/40 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaqIndex((prev) => (prev === idx ? null : idx))
                    }
                    aria-expanded={isOpen}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-display font-bold text-sm sm:text-base text-slate-900 leading-snug">
                      {faq.question}
                    </span>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? 'bg-blue-700 text-white rotate-180'
                          : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-0.5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60">
                      <p className="pt-3">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Quiet Public Footer (No Admin Link Shown to Customers) */}
        <footer className="pt-4 pb-8 text-center text-xs text-slate-400 px-2">
          <span>
            © {new Date().getFullYear()} ShittuStores by Advibe Studios Commerce
            · Nationwide Pay on Delivery
          </span>
        </footer>
      </main>
    </div>
  );
}
