export function ADD_SALE(state, sale) {
  state.sales.push(sale);
  const p = state.products.find((x) => x.id === sale.productId);
  if (p) {
    p.stock = Math.max(0, p.stock - sale.qty);
  }
}

export function ADD_EXPENSE(state, expense) {
  state.expenses.push(expense);
}

export function ADD_PRODUCT(state, product) {
  state.products.push(product);
}

export function UPDATE_PRODUCT(state, { id, changes }) {
  const p = state.products.find((x) => x.id === id);
  if (p) Object.assign(p, changes);
}

export function RESTOCK(state, { id, qty }) {
  const p = state.products.find((x) => x.id === id);
  if (p) p.stock += qty;
}

export function DELETE_PRODUCT(state, id) {
  state.products = state.products.filter((x) => x.id !== id);
  // Tanggalin din ang mga benta na kaugnay para tama ang mga report.
  state.sales = state.sales.filter((s) => s.productId !== id);
}

export function DELETE_SALE(state, id) {
  const sale = state.sales.find((s) => s.id === id);
  if (!sale) return;
  // Ibalik ang stock dahil binawasan ito noong na-record ang benta.
  const p = state.products.find((x) => x.id === sale.productId);
  if (p) p.stock += sale.qty;
  state.sales = state.sales.filter((s) => s.id !== id);
}

export function DELETE_EXPENSE(state, id) {
  state.expenses = state.expenses.filter((e) => e.id !== id);
}

export function RESET_STATE(state, fresh) {
  state.storeName = fresh.storeName;
  state.products = fresh.products;
  state.sales = fresh.sales;
  state.expenses = fresh.expenses;
  state.customers = fresh.customers;
  state.credits = fresh.credits;
}

// ======== Utang / Listahan ========

export function ADD_CUSTOMER(state, customer) {
  if (!state.customers) state.customers = [];
  state.customers.push(customer);
}

export function ADD_CREDIT(state, entry) {
  if (!state.credits) state.credits = [];
  state.credits.push(entry);
}

export function DELETE_CREDIT(state, id) {
  state.credits = (state.credits || []).filter((e) => e.id !== id);
}

export function DELETE_CUSTOMER(state, id) {
  state.customers = (state.customers || []).filter((c) => c.id !== id);
  // Tanggalin din ang ledger entries nito.
  state.credits = (state.credits || []).filter((e) => e.customerId !== id);
}

export function SET_STORE_NAME(state, name) {
  state.storeName = name;
}

export function SET_THEME(state, theme) {
  state.theme = theme;
}

export function SET_DARK_MODE(state, val) {
  state.darkMode = !!val;
}

export function SET_LANG(state, val) {
  state.lang = val;
}

export function SET_PIN(state, pin) {
  state.pin = pin;
}

export function SET_UNLOCKED(state, val) {
  state.unlocked = val;
}
