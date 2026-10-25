// ======== TindaSense "AI" logic ========
// Lahat ng kalkulasyon ng tubo, hula ng stock-out, alerts,
// profit/loss ranking, at daily recommendations nandito.

const todayStr = () => new Date().toISOString().slice(0, 10);

export function storeName(state) {
  return state.storeName;
}

export function theme(state) {
  return state.theme || "teal";
}

export function darkMode(state) {
  return !!state.darkMode;
}

export function lang(state) {
  return state.lang || "tl";
}

export function hasPin(state) {
  return !!state.pin;
}

export function isUnlocked(state) {
  return !state.pin || state.unlocked;
}

export function checkPin(state) {
  return (entered) => String(entered) === String(state.pin);
}

export function products(state) {
  return state.products;
}

export function productById(state) {
  return (id) => state.products.find((p) => p.id === id);
}

export function productByBarcode(state) {
  return (code) =>
    state.products.find((p) => p.barcode && String(p.barcode) === String(code));
}

export function sales(state) {
  return state.sales;
}

export function expenses(state) {
  return state.expenses;
}

// --- Benta ngayong araw ---
export function salesToday(state) {
  const t = todayStr();
  return state.sales.filter((s) => s.date === t);
}

export function expensesToday(state) {
  const t = todayStr();
  return state.expenses.filter((e) => e.date === t);
}

// Kita (margin) per unit
export function unitMargin() {
  return (p) => p.price - p.cost;
}

// --- Buod ng araw: revenue, puhunan, tubo bago gastos, gastos, net ---
export function todaySummary(state, getters) {
  const sales = getters.salesToday;
  let revenue = 0;
  let cost = 0;
  sales.forEach((s) => {
    const p = getters.productById(s.productId);
    if (!p) return;
    revenue += p.price * s.qty;
    cost += p.cost * s.qty;
  });
  const grossProfit = revenue - cost;
  const totalExpenses = getters.expensesToday.reduce(
    (sum, e) => sum + e.amount,
    0
  );
  const netProfit = grossProfit - totalExpenses;
  return {
    revenue,
    cost,
    grossProfit,
    totalExpenses,
    netProfit,
    itemsSold: sales.reduce((n, s) => n + s.qty, 0),
  };
}

// Ilang araw bago mag-expire (o negatibo kung lipas na). null kung walang expiry.
function daysToExpiry(expiry) {
  if (!expiry) return null;
  const d = new Date(expiry);
  if (isNaN(d)) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - now) / 86400000);
}

// --- Stock status per product (hula kung kailan mauubos) ---
// daysLeft = stock / dailyAvgSold
export function stockStatus(state, getters) {
  return state.products.map((p) => {
    const avg = p.dailyAvgSold || 0.0001;
    const daysLeft = p.stock / avg;
    let level = "ok";
    if (p.stock <= 0) level = "out";
    else if (daysLeft <= 1) level = "critical";
    else if (daysLeft <= 3) level = "low";

    const expiryDays = daysToExpiry(p.expiry);
    let expiryLevel = "none";
    if (expiryDays !== null) {
      if (expiryDays < 0) expiryLevel = "expired";
      else if (expiryDays <= 7) expiryLevel = "soon";
      else expiryLevel = "ok";
    }

    return {
      ...p,
      daysLeft: Math.round(daysLeft * 10) / 10,
      level,
      margin: getters.unitMargin(p),
      expiryDays,
      expiryLevel,
    };
  });
}

// Mga produktong malapit nang mag-expire o lipas na (may stock pa).
export function expiringSoon(state, getters) {
  return getters.stockStatus
    .filter(
      (p) =>
        p.stock > 0 &&
        (p.expiryLevel === "soon" || p.expiryLevel === "expired")
    )
    .sort((a, b) => (a.expiryDays ?? 999) - (b.expiryDays ?? 999));
}

// --- Mga produktong malapit nang maubos (para i-restock) ---
export function predictedStockouts(state, getters) {
  return getters.stockStatus
    .filter((p) => p.level === "out" || p.level === "critical" || p.level === "low")
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

// --- Profit / loss ranking ---
// Tubo per product = margin * total qty na nabenta (buong records).
export function productPerformance(state, getters) {
  const qtyMap = {};
  state.sales.forEach((s) => {
    qtyMap[s.productId] = (qtyMap[s.productId] || 0) + s.qty;
  });

  return state.products
    .map((p) => {
      const soldQty = qtyMap[p.id] || 0;
      const margin = p.price - p.cost;
      const totalProfit = margin * soldQty;
      const marginPct = p.price > 0 ? (margin / p.price) * 100 : 0;
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        margin,
        marginPct: Math.round(marginPct),
        soldQty,
        totalProfit,
        losing: margin <= 0,
      };
    })
    .sort((a, b) => b.totalProfit - a.totalProfit);
}

export function topEarners(state, getters) {
  return getters.productPerformance.filter((p) => p.totalProfit > 0).slice(0, 3);
}

export function losingProducts(state, getters) {
  // Nalulugi o napakaliit ng margin (< 10%).
  return getters.productPerformance.filter(
    (p) => p.losing || p.marginPct < 10
  );
}

// --- Araw-araw na rekomendasyon para sa tindero ---
// Pinagsasama ang stock-out predictions, losing products, at best sellers
// para gumawa ng actionable advice. Priority: danger > warning > info/success.
export function dailyRecommendations(state, getters) {
  const recs = [];

  // 1. Mga dapat i-restock agad
  getters.predictedStockouts.forEach((p) => {
    if (p.level === "out") {
      recs.push({
        type: "danger",
        icon: "report",
        title: `Ubos na: ${p.name}`,
        message: `Wala nang stock. Nabebenta ~${p.dailyAvgSold} ${p.unit}/araw. Mag-restock na para hindi mawalan ng benta.`,
        priority: 1,
      });
    } else if (p.level === "critical") {
      recs.push({
        type: "danger",
        icon: "priority_high",
        title: `Mauubos na: ${p.name}`,
        message: `~${p.daysLeft} araw na lang bago maubos (${p.stock} ${p.unit} natitira). Mag-restock bukas.`,
        priority: 2,
      });
    } else {
      recs.push({
        type: "warning",
        icon: "inventory_2",
        title: `Bumababa na: ${p.name}`,
        message: `~${p.daysLeft} araw na natitira. Isama na sa susunod na order.`,
        priority: 3,
      });
    }
  });

  // 2. "Huwag munang mag-restock" — mabagal mabenta + maraming stock
  getters.stockStatus
    .filter((p) => p.level === "ok" && p.daysLeft >= 10 && p.dailyAvgSold <= 4)
    .forEach((p) => {
      recs.push({
        type: "info",
        icon: "pause_circle",
        title: `Huwag munang mag-restock: ${p.name}`,
        message: `May ${p.stock} ${p.unit} pa (~${Math.round(
          p.daysLeft
        )} araw). Mabagal mabenta, gamitin muna ang pondo sa mabilis maubos.`,
        priority: 4,
      });
    });

  // 3. Nalulugi / maliit na margin
  getters.losingProducts.forEach((p) => {
    recs.push({
      type: p.losing ? "danger" : "warning",
      icon: "trending_down",
      title: p.losing
        ? `Lugi: ${p.name}`
        : `Maliit ang tubo: ${p.name}`,
      message: p.losing
        ? `Patong na ₱${p.margin.toFixed(
            2
          )} kada piraso. Taasan ang presyo o itigil ang pagbenta.`
        : `${p.marginPct}% margin lang (₱${p.margin.toFixed(
            2
          )}/piraso). Isipin kung dagdagan ang presyo.`,
      priority: p.losing ? 2 : 5,
    });
  });

  // 4. Best seller highlight
  const best = getters.topEarners[0];
  if (best) {
    recs.push({
      type: "success",
      icon: "emoji_events",
      title: `Panalo: ${best.name}`,
      message: `Pinakamalaking tubo mo (₱${best.totalProfit.toLocaleString()} total). Siguraduhing laging may stock.`,
      priority: 6,
    });
  }

  // 5. Matagal nang hindi nagbabayad na suki
  getters.staleDebtors.forEach((c) => {
    recs.push({
      type: "warning",
      icon: "handshake",
      title: `Singilin: ${c.name}`,
      message: `May utang na ₱${c.balance.toLocaleString()} at matagal nang walang bayad. Paalalahanan nang maayos.`,
      priority: 4,
    });
  });

  // 6. Malapit nang mag-expire / lipas na
  getters.expiringSoon.forEach((p) => {
    if (p.expiryLevel === "expired") {
      recs.push({
        type: "danger",
        icon: "event_busy",
        title: `Lipas na: ${p.name}`,
        message: `Expired na (${Math.abs(p.expiryDays)} araw na ang nakalipas). Alisin sa tinda para ligtas.`,
        priority: 1,
      });
    } else {
      recs.push({
        type: "warning",
        icon: "schedule",
        title: `Malapit mag-expire: ${p.name}`,
        message: `${p.expiryDays} araw na lang. Ibenta muna agad o i-promo bago mag-expire.`,
        priority: 3,
      });
    }
  });

  return recs.sort((a, b) => a.priority - b.priority);
}

// Buod ng mga bilang para sa badges
export function alertCounts(state, getters) {
  const recs = getters.dailyRecommendations;
  return {
    total: recs.length,
    danger: recs.filter((r) => r.type === "danger").length,
    warning: recs.filter((r) => r.type === "warning").length,
  };
}

// Kabuuang halaga ng naka-imbak na puhunan (inventory value sa cost)
export function inventoryValue(state) {
  return state.products.reduce((sum, p) => sum + p.cost * p.stock, 0);
}

// ======== Utang / Listahan ========

export function customers(state) {
  return state.customers || [];
}

export function credits(state) {
  return state.credits || [];
}

export function customerById(state) {
  return (id) => (state.customers || []).find((c) => c.id === id);
}

// Balance per suki: utang − bayad. Kasama ang kabuuan at huling galaw.
export function customerBalances(state, getters) {
  return (state.customers || [])
    .map((c) => {
      const entries = (state.credits || []).filter(
        (e) => e.customerId === c.id
      );
      let balance = 0;
      let lastDate = null;
      entries.forEach((e) => {
        balance += e.type === "utang" ? e.amount : -e.amount;
        if (!lastDate || e.date > lastDate) lastDate = e.date;
      });
      return {
        id: c.id,
        name: c.name,
        balance: Math.round(balance * 100) / 100,
        entries: entries.sort((a, b) => (a.date < b.date ? 1 : -1)),
        lastDate,
      };
    })
    .sort((a, b) => b.balance - a.balance);
}

// Kabuuang pautang (lahat ng natitirang balance na positibo).
export function totalReceivables(state, getters) {
  return getters.customerBalances
    .filter((c) => c.balance > 0)
    .reduce((sum, c) => sum + c.balance, 0);
}

// Ilang suki ang may utang.
export function debtorsCount(state, getters) {
  return getters.customerBalances.filter((c) => c.balance > 0).length;
}

// Mga matagal nang hindi nakakabayad (>14 araw mula huling galaw at may utang).
export function staleDebtors(state, getters) {
  const now = new Date();
  return getters.customerBalances.filter((c) => {
    if (c.balance <= 0 || !c.lastDate) return false;
    const days = Math.floor((now - new Date(c.lastDate)) / 86400000);
    return days >= 14;
  });
}

// Loyalty tier base sa kabuuang halaga ng pagbili (utang entries).
function loyaltyTier(totalSpent) {
  if (totalSpent >= 2000)
    return { name: "Suki Gold", icon: "workspace_premium", color: "amber-7" };
  if (totalSpent >= 800)
    return { name: "Suki Silver", icon: "military_tech", color: "blue-grey-5" };
  if (totalSpent >= 200)
    return { name: "Suki Bronze", icon: "emoji_events", color: "deep-orange-5" };
  return { name: "Bagong suki", icon: "person", color: "grey-6" };
}

// Detalyadong history/loyalty per suki.
export function customerStats(state) {
  return (id) => {
    const entries = (state.credits || []).filter((e) => e.customerId === id);
    const utangEntries = entries.filter((e) => e.type === "utang");
    const bayadEntries = entries.filter((e) => e.type === "bayad");

    const totalUtang = utangEntries.reduce((s, e) => s + e.amount, 0);
    const totalBayad = bayadEntries.reduce((s, e) => s + e.amount, 0);
    const visits = utangEntries.length;

    const dates = entries.map((e) => e.date).sort();
    const firstDate = dates[0] || null;
    const lastDate = dates[dates.length - 1] || null;
    const avgPerVisit = visits > 0 ? Math.round(totalUtang / visits) : 0;

    return {
      totalUtang: Math.round(totalUtang),
      totalBayad: Math.round(totalBayad),
      balance: Math.round(totalUtang - totalBayad),
      visits,
      avgPerVisit,
      firstDate,
      lastDate,
      tier: loyaltyTier(totalUtang),
    };
  };
}

// ======== Chart data ========

const fmtDate = (dt) => dt.toISOString().slice(0, 10);
const shortDay = (dt) =>
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dt.getDay()];

// Kabuuang kita/benta/gastos sa nakaraang N araw (kasama ang ngayon).
export function earningsForRange(state, getters) {
  return (days) => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));
    const startKey = start.toISOString().slice(0, 10);

    let revenue = 0;
    let cost = 0;
    state.sales.forEach((s) => {
      if (s.date < startKey) return;
      const p = getters.productById(s.productId);
      if (!p) return;
      revenue += p.price * s.qty;
      cost += p.cost * s.qty;
    });
    const totalExpenses = (state.expenses || [])
      .filter((e) => e.date >= startKey)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      revenue: Math.round(revenue),
      cost: Math.round(cost),
      grossProfit: Math.round(revenue - cost),
      totalExpenses: Math.round(totalExpenses),
      netProfit: Math.round(revenue - cost - totalExpenses),
    };
  };
}

// Benta (revenue) at net profit kada araw sa nakaraang N araw.
export function dailySalesSeries(state, getters) {
  return (days = 7) => {
    const today = new Date();
    const series = [];
    for (let i = days - 1; i >= 0; i--) {
      const dt = new Date(today);
      dt.setDate(dt.getDate() - i);
      const key = fmtDate(dt);

      const daySales = state.sales.filter((s) => s.date === key);
      let revenue = 0;
      let cost = 0;
      daySales.forEach((s) => {
        const p = getters.productById(s.productId);
        if (!p) return;
        revenue += p.price * s.qty;
        cost += p.cost * s.qty;
      });
      const expensesDay = (state.expenses || [])
        .filter((e) => e.date === key)
        .reduce((sum, e) => sum + e.amount, 0);

      series.push({
        date: key,
        label: shortDay(dt),
        revenue: Math.round(revenue),
        net: Math.round(revenue - cost - expensesDay),
      });
    }
    return series;
  };
}

// Top sellers ayon sa kita (galing productPerformance) — para sa bar chart.
export function topSellersChart(state, getters) {
  return (limit = 5) =>
    getters.productPerformance
      .filter((p) => p.soldQty > 0)
      .slice(0, limit)
      .map((p) => ({
        label: p.name,
        value: p.totalProfit,
        qty: p.soldQty,
      }));
}

// Benta (revenue) kada kategorya — para sa breakdown.
export function salesByCategory(state, getters) {
  const map = {};
  state.sales.forEach((s) => {
    const p = getters.productById(s.productId);
    if (!p) return;
    const cat = p.category || "Iba pa";
    map[cat] = (map[cat] || 0) + p.price * s.qty;
  });
  return Object.entries(map)
    .map(([label, value]) => ({ label, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);
}
