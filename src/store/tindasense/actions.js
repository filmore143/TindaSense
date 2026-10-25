import { seedState } from "./state";

const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Date.now() + Math.floor(Math.random() * 1000);

export function recordSale({ commit }, { productId, qty }) {
  commit("ADD_SALE", {
    id: uid(),
    productId,
    qty: Number(qty),
    date: today(),
  });
}

export function recordExpense({ commit }, { label, amount }) {
  commit("ADD_EXPENSE", {
    id: uid(),
    label,
    amount: Number(amount),
    date: today(),
  });
}

export function restock({ commit }, { id, qty }) {
  commit("RESTOCK", { id, qty: Number(qty) });
}

export function addProduct({ commit }, product) {
  commit("ADD_PRODUCT", {
    id: uid(),
    stock: 0,
    dailyAvgSold: 1,
    unit: "pcs",
    image: null,
    barcode: null,
    expiry: null,
    ...product,
    cost: Number(product.cost),
    price: Number(product.price),
  });
}

export function updateProduct({ commit }, payload) {
  commit("UPDATE_PRODUCT", payload);
}

export function assignBarcode({ commit }, { id, barcode }) {
  commit("UPDATE_PRODUCT", { id, changes: { barcode: String(barcode) } });
}

export function deleteProduct({ commit }, id) {
  commit("DELETE_PRODUCT", id);
}

export function resetDemo({ commit }) {
  commit("RESET_STATE", seedState());
}

export function deleteSale({ commit }, id) {
  commit("DELETE_SALE", id);
}

export function deleteExpense({ commit }, id) {
  commit("DELETE_EXPENSE", id);
}

// ======== Utang / Listahan ========

export function addCustomer({ commit }, name) {
  const customer = { id: uid(), name: String(name).trim() };
  commit("ADD_CUSTOMER", customer);
  return customer;
}

export function addCredit(
  { commit },
  { customerId, type, amount, note, method, date }
) {
  const isBayad = type === "bayad";
  commit("ADD_CREDIT", {
    id: uid(),
    customerId,
    type: isBayad ? "bayad" : "utang",
    amount: Number(amount),
    note: note || "",
    // Mode of payment — para sa bayad lang.
    method: isBayad ? method || "Cash" : null,
    // Gamitin ang napiling petsa; kung wala, ang ngayon.
    date: date || today(),
  });
}

export function deleteCredit({ commit }, id) {
  commit("DELETE_CREDIT", id);
}

export function deleteCustomer({ commit }, id) {
  commit("DELETE_CUSTOMER", id);
}

export function setStoreName({ commit }, name) {
  commit("SET_STORE_NAME", String(name).trim() || "Aking Tindahan");
}

export function setTheme({ commit }, theme) {
  commit("SET_THEME", theme);
}

export function setDarkMode({ commit }, val) {
  commit("SET_DARK_MODE", val);
}

export function setLang({ commit }, val) {
  commit("SET_LANG", val);
}

export function setPin({ commit }, pin) {
  commit("SET_PIN", pin ? String(pin) : null);
  commit("SET_UNLOCKED", true);
}

export function unlock({ commit }) {
  commit("SET_UNLOCKED", true);
}

export function lock({ commit }) {
  commit("SET_UNLOCKED", false);
}
