import { LocalStorage } from "quasar";

// Isang susi lang para sa buong tindasense state.
// I-bump ang bersyon kapag binago ang default seed, para lumipat
// sa bagong default ang mga lumang naka-save na state.
export const STORAGE_KEY = "tindasense.v3";
const OLD_KEYS = ["tindasense.v1", "tindasense.v2"];

// Kunin ang naka-save na state. null kung wala o sira.
export function loadState() {
  try {
    // Linisin ang lumang bersyon para hindi mag-ipon.
    OLD_KEYS.forEach((k) => LocalStorage.remove(k));
    const raw = LocalStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    // Minimal na validation.
    if (!Array.isArray(raw.products)) return null;
    return raw;
  } catch (e) {
    return null;
  }
}

// I-save ang mga persistable na bahagi lang ng state.
export function saveState(state) {
  try {
    LocalStorage.set(STORAGE_KEY, {
      storeName: state.storeName,
      products: state.products,
      sales: state.sales,
      expenses: state.expenses,
      customers: state.customers,
      credits: state.credits,
      theme: state.theme,
      darkMode: state.darkMode,
      lang: state.lang,
      pin: state.pin,
    });
  } catch (e) {
    // Posibleng puno na ang storage (hal. masyadong malalaking litrato).
    // Hindi natin ic-crash ang app; babalaan lang sa console.
    // eslint-disable-next-line no-console
    console.warn("TindaSense: hindi ma-save sa LocalStorage", e);
  }
}

export function clearState() {
  LocalStorage.remove(STORAGE_KEY);
}
