import { boot } from "quasar/wrappers";
import { saveState } from "src/store/tindasense/persist";

// I-save ang tindasense state sa LocalStorage tuwing may nagbabago.
export default boot(({ store }) => {
  store.subscribe((mutation, state) => {
    if (mutation.type.startsWith("tindasense/")) {
      saveState(state.tindasense);
    }
  });
});
