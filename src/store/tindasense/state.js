// Panimulang state ng TindaSense. Walang demo data —
// ang user na ang maglalagay ng produkto, benta, gastos, at utang.

import { loadState } from "./persist";

// Malinis na state (empty). Ginagamit sa first-run at sa reset.
export function seedState() {
  return {
    storeName: "Filmore Store",
    products: [],
    sales: [],
    expenses: [],
    customers: [],
    credits: [],
  };
}

// Unang pagbukas: gamitin ang naka-save na state kung meron,
// kung wala, ang malinis na state. Ang theme ay hiwalay —
// hindi nabubura kahit mag-reset ng data.
export default function () {
  const saved = loadState();
  const base = saved || seedState();
  return {
    ...base,
    theme: (saved && saved.theme) || "teal",
    darkMode: (saved && saved.darkMode) || false,
    lang: (saved && saved.lang) || "tl",
    pin: (saved && saved.pin) || null,
    unlocked: false,
  };
}
