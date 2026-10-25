<template>
  <q-layout view="hHh lpR fFf">
    <!-- Branded header -->
    <q-header class="ts-gradient">
      <div class="ts-shell">
        <q-toolbar class="q-py-sm">
          <q-avatar size="38px" class="q-mr-sm ts-logo-avatar">
            <img :src="logo" alt="TindaSense" />
          </q-avatar>
          <div class="column tw-cursor-pointer" @click="openRename">
            <q-toolbar-title class="text-weight-bold" style="font-size: 18px">
              TindaSense
            </q-toolbar-title>
            <div
              class="text-caption text-white row items-center q-gutter-x-xs"
              style="opacity: 0.85"
            >
              <span>{{ storeName }}</span>
              <q-icon name="edit" size="12px" />
            </div>
          </div>
          <q-space />
          <!-- Donate -->
          <q-btn flat round dense icon="favorite" @click="donateOpen = true">
            <q-tooltip>Suportahan ang developer</q-tooltip>
          </q-btn>

          <!-- Theme picker -->
          <q-btn flat round dense icon="palette">
            <q-menu anchor="bottom right" self="top right">
              <div class="q-pa-md" style="min-width: 220px">
                <div class="text-weight-bold q-mb-sm">Piliin ang kulay</div>
                <div class="row q-gutter-sm">
                  <div
                    v-for="t in themes"
                    :key="t.value"
                    class="ts-swatch"
                    :class="{ 'ts-swatch--active': theme === t.value }"
                    :style="{ background: t.swatch }"
                    @click="pickTheme(t.value)"
                  >
                    <q-icon
                      v-if="theme === t.value"
                      name="check"
                      color="white"
                      size="18px"
                    />
                    <q-tooltip>{{ t.label }}</q-tooltip>
                  </div>
                </div>
              </div>
            </q-menu>
          </q-btn>

          <q-btn flat round dense icon="notifications" :to="'/insights'">
            <q-badge
              v-if="alertCounts.danger > 0"
              color="red"
              floating
              rounded
            >
              {{ alertCounts.danger }}
            </q-badge>
          </q-btn>

          <!-- Settings -->
          <q-btn flat round dense icon="more_vert">
            <q-menu anchor="bottom right" self="top right">
              <q-list style="min-width: 210px">
                <q-item clickable v-close-popup @click="shareApp">
                  <q-item-section avatar>
                    <q-icon name="share" color="primary" />
                  </q-item-section>
                  <q-item-section>{{ $t("settings.share") }}</q-item-section>
                </q-item>

                <q-item clickable @click="toggleDark">
                  <q-item-section avatar>
                    <q-icon
                      :name="darkMode ? 'light_mode' : 'dark_mode'"
                      :color="darkMode ? 'amber-6' : 'blue-grey-7'"
                    />
                  </q-item-section>
                  <q-item-section>
                    {{ darkMode ? $t("settings.light") : $t("settings.dark") }}
                  </q-item-section>
                </q-item>

                <q-item clickable @click="toggleSound">
                  <q-item-section avatar>
                    <q-icon
                      :name="muted ? 'volume_off' : 'volume_up'"
                      :color="muted ? 'grey-6' : 'positive'"
                    />
                  </q-item-section>
                  <q-item-section>
                    {{ muted ? $t("settings.soundOn") : $t("settings.soundOff") }}
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="startTour">
                  <q-item-section avatar>
                    <q-icon name="help_outline" color="info" />
                  </q-item-section>
                  <q-item-section>{{ $t("settings.tour") }}</q-item-section>
                </q-item>

                <q-separator spaced />

                <q-item-label header class="q-py-xs">
                  {{ $t("settings.language") }}
                </q-item-label>
                <q-item
                  v-for="l in languages"
                  :key="l.value"
                  clickable
                  v-close-popup
                  :active="lang === l.value"
                  active-class="text-primary"
                  @click="pickLang(l.value)"
                >
                  <q-item-section avatar>
                    <span style="font-size: 20px">{{ l.flag }}</span>
                  </q-item-section>
                  <q-item-section>{{ l.label }}</q-item-section>
                  <q-item-section side v-if="lang === l.value">
                    <q-icon name="check" color="primary" />
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="pinAction">
                  <q-item-section avatar>
                    <q-icon :name="hasPin ? 'lock_reset' : 'lock'" color="accent" />
                  </q-item-section>
                  <q-item-section>
                    {{ hasPin ? $t("settings.changePin") : $t("settings.setPin") }}
                  </q-item-section>
                </q-item>

                <q-item
                  v-if="hasPin"
                  clickable
                  v-close-popup
                  @click="removePinAction"
                >
                  <q-item-section avatar>
                    <q-icon name="lock_open" color="negative" />
                  </q-item-section>
                  <q-item-section>{{ $t("settings.removePin") }}</q-item-section>
                </q-item>

                <q-item v-if="hasPin" clickable v-close-popup @click="lock">
                  <q-item-section avatar>
                    <q-icon name="logout" color="grey-7" />
                  </q-item-section>
                  <q-item-section>{{ $t("settings.lockNow") }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-toolbar>
      </div>
    </q-header>

    <q-page-container>
      <div class="ts-shell">
        <router-view v-slot="{ Component }">
          <transition name="ts-page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </q-page-container>

    <!-- Bottom navigation -->
    <q-footer class="bg-white" bordered>
      <div class="ts-shell">
        <q-tabs
          v-model="tab"
          class="text-grey-6 ts-bottom-nav"
          active-color="primary"
          indicator-color="transparent"
          dense
          no-caps
          stretch
          spread
        >
          <q-route-tab
            name="dashboard"
            to="/"
            exact
            icon="dashboard"
            :label="$t('nav.home')"
          />
          <q-route-tab
            name="products"
            to="/products"
            icon="inventory_2"
            :label="$t('nav.products')"
          />
          <q-route-tab
            name="record"
            to="/record"
            icon="point_of_sale"
            :label="$t('nav.record')"
          />
          <q-route-tab
            name="utang"
            to="/utang"
            icon="menu_book"
            :label="$t('nav.utang')"
          />
          <q-route-tab name="insights" to="/insights" icon="auto_awesome">
            <template #default>
              <q-icon name="auto_awesome" size="24px" />
              <div class="text-caption">{{ $t("nav.ai") }}</div>
              <q-badge
                v-if="alertCounts.total > 0"
                color="negative"
                floating
                rounded
                style="top: 4px; right: 8px"
              >
                {{ alertCounts.total }}
              </q-badge>
            </template>
          </q-route-tab>
        </q-tabs>
      </div>
    </q-footer>

    <!-- Donate / support the developer -->
    <DonateDialog v-model="donateOpen" />

    <!-- First-time onboarding -->
    <OnboardingTour v-model="onboardingOpen" @update:model-value="onTourClose" />
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import { mapGetters, mapActions } from "vuex";
import { LocalStorage } from "quasar";
import DonateDialog from "components/DonateDialog.vue";
import OnboardingTour from "components/OnboardingTour.vue";
import logo from "src/assets/tindasense-logo.svg";
import { isMuted, toggleMuted, playClick } from "src/lib/sound";
import { LANGUAGES } from "src/i18n";

const ONBOARD_KEY = "tindasense.onboarded";

export default defineComponent({
  name: "MainLayout",
  components: { DonateDialog, OnboardingTour },
  setup() {
    return {
      tab: ref("dashboard"),
    };
  },
  data() {
    return {
      logo,
      donateOpen: false,
      onboardingOpen: false,
      muted: isMuted(),
      languages: LANGUAGES,
      themes: [
        { value: "teal", label: "Teal", swatch: "linear-gradient(135deg,#0f766e,#0891b2)" },
        { value: "emerald", label: "Emerald", swatch: "linear-gradient(135deg,#059669,#34d399)" },
        { value: "ocean", label: "Ocean", swatch: "linear-gradient(135deg,#0ea5e9,#4f46e5)" },
        { value: "indigo", label: "Indigo", swatch: "linear-gradient(135deg,#4f46e5,#a855f7)" },
        { value: "grape", label: "Grape", swatch: "linear-gradient(135deg,#7c3aed,#db2777)" },
        { value: "rose", label: "Rose", swatch: "linear-gradient(135deg,#e11d48,#fb7185)" },
        { value: "amber", label: "Amber", swatch: "linear-gradient(135deg,#f59e0b,#ef4444)" },
      ],
    };
  },
  computed: {
    ...mapGetters("tindasense", [
      "storeName",
      "alertCounts",
      "theme",
      "hasPin",
      "predictedStockouts",
      "darkMode",
      "lang",
    ]),
  },
  watch: {
    theme: {
      immediate: true,
      handler(val) {
        this.applyTheme(val);
      },
    },
    darkMode: {
      immediate: true,
      handler(val) {
        if (this.$q && this.$q.dark) this.$q.dark.set(!!val);
      },
    },
  },
  mounted() {
    this.applyTheme(this.theme);
    if (this.$q && this.$q.dark) this.$q.dark.set(this.darkMode);
    // Ipakita ang tutorial sa first-time user lang.
    if (LocalStorage.getItem(ONBOARD_KEY) !== true) {
      this.onboardingOpen = true;
    }
    // Alerto kung may kritikal/ubos na stock pagbukas ng app.
    this.$nextTick(() => this.checkCriticalStockOnLoad());
  },
  methods: {
    onTourClose(val) {
      // Kapag isinara/natapos ang tour, tandaan para hindi na ulit lumabas.
      if (val === false) {
        LocalStorage.set(ONBOARD_KEY, true);
      }
    },
    startTour() {
      this.onboardingOpen = true;
    },
    ...mapActions("tindasense", [
      "setStoreName",
      "setTheme",
      "setPin",
      "lock",
      "setDarkMode",
      "setLang",
    ]),
    pickLang(val) {
      this.setLang(val);
    },
    toggleDark() {
      this.setDarkMode(!this.darkMode);
    },
    toggleSound() {
      this.muted = toggleMuted();
      if (!this.muted) playClick(); // feedback na bukas na
    },
    checkCriticalStockOnLoad() {
      const critical = this.predictedStockouts.filter(
        (p) => p.level === "out" || p.level === "critical"
      );
      if (critical.length === 0) return;
      this.$q.notify({
        message:
          critical.length === 1
            ? `Kritikal ang stock ng ${critical[0].name}.`
            : `${critical.length} produkto ang kritikal/ubos na ang stock.`,
        caption: "Tingnan sa Produkto o AI insights.",
        icon: "inventory_2",
        color: "warning",
        timeout: 5000,
        actions: [{ label: "Tingnan", color: "white", handler: () => this.$router.push("/products") }],
      });
    },
    pinAction() {
      this.$q
        .dialog({
          title: this.hasPin ? "Palitan ang PIN" : "Mag-set ng PIN",
          message: "Maglagay ng 4-digit na PIN.",
          prompt: {
            model: "",
            type: "password",
            inputmode: "numeric",
            maxlength: 4,
            isValid: (v) => /^\d{4}$/.test(v),
          },
          cancel: { label: "Kanselahin", flat: true },
          ok: { label: "I-save", color: "primary", unelevated: true },
        })
        .onOk((val) => {
          this.setPin(val);
          this.$q.notify({ message: "Naka-set na ang PIN.", icon: "lock" });
        });
    },
    removePinAction() {
      this.$q
        .dialog({
          title: "Alisin ang PIN?",
          message: "Ilagay ang kasalukuyang PIN para kumpirmahin.",
          prompt: {
            model: "",
            type: "password",
            inputmode: "numeric",
            maxlength: 4,
          },
          cancel: { label: "Kanselahin", flat: true },
          ok: { label: "Alisin", color: "negative", unelevated: true },
        })
        .onOk((val) => {
          if (this.$store.getters["tindasense/checkPin"](val)) {
            this.setPin(null);
            this.$q.notify({
              message: "Naalis na ang PIN.",
              icon: "lock_open",
            });
          } else {
            this.$q.notify({ message: "Mali ang PIN.", color: "negative" });
          }
        });
    },
    async shareApp() {
      const shareData = {
        title: "TindaSense",
        text: "Subukan ang TindaSense — AI business assistant para sa sari-sari store!",
        url: window.location.origin,
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(shareData.url);
          this.$q.notify({
            message: "Nakopya ang link! I-paste mo na lang.",
            icon: "content_copy",
          });
        }
      } catch (e) {
        // Kinansela ng user o walang permiso — huwag i-crash.
      }
    },
    applyTheme(val) {
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", val || "teal");
      }
    },
    pickTheme(val) {
      this.setTheme(val);
    },
    openRename() {
      this.$q
        .dialog({
          title: "Pangalan ng tindahan",
          message: "Ilagay ang pangalan ng iyong tindahan.",
          prompt: {
            model: this.storeName,
            type: "text",
            isValid: (v) => !!v && v.trim().length > 0,
          },
          cancel: { label: "Kanselahin", flat: true },
          ok: { label: "I-save", color: "primary", unelevated: true },
        })
        .onOk((val) => {
          this.setStoreName(val);
          this.$q.notify({ message: "Na-update ang pangalan.", icon: "check" });
        });
    },
  },
});
</script>
