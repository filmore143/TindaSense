import { boot } from "quasar/wrappers";
import { translate } from "src/i18n";

// Global na $t(key, params) na nakabatay sa kasalukuyang wika sa store.
export default boot(({ app, store }) => {
  app.config.globalProperties.$t = (key, params) => {
    const lang = store.getters["tindasense/lang"] || "tl";
    return translate(lang, key, params);
  };
});
