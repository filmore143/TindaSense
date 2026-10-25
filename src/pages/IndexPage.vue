<template>
  <q-page class="ts-page q-pa-md">
    <!-- Greeting + mascot -->
    <div class="row items-end justify-between q-mb-md no-wrap">
      <div>
        <div class="text-h6 text-weight-bold">{{ greeting }} 👋</div>
        <div class="ts-muted text-caption">
          {{ $t("dash.summarySub") }}
        </div>
      </div>
      <TindaBuddy
        :message="buddyMessage"
        :mood="buddyMood"
        @poke="nextBuddyMessage"
      />
    </div>

    <!-- Period toggle -->
    <q-btn-toggle
      v-model="period"
      spread
      no-caps
      unelevated
      dense
      class="q-mb-sm ts-period-toggle"
      toggle-color="primary"
      color="white"
      text-color="grey-7"
      :options="periodOptions"
    />

    <!-- Hero: net profit for selected period -->
    <div
      class="ts-stat ts-gradient q-mb-md ts-animate-in"
      :class="rangeSummary.netProfit < 0 ? 'ts-gradient-amber' : ''"
    >
      <q-icon class="ts-stat-icon" name="savings" />
      <div class="ts-stat-label">{{ $t("dash.netProfit", { period: periodLabel }) }}</div>
      <div class="ts-stat-value text-h4 ts-peso">
        ₱{{ fmt(rangeSummary.netProfit) }}
      </div>
      <div class="row items-center q-gutter-x-sm q-mt-xs text-caption">
        <div><q-icon name="sell" size="14px" /> {{ $t("dash.sales") }}: ₱{{ fmt(rangeSummary.revenue) }}</div>
        <div>·</div>
        <div><q-icon name="receipt_long" size="14px" /> {{ $t("dash.expenses") }}: ₱{{ fmt(rangeSummary.totalExpenses) }}</div>
      </div>
    </div>

    <!-- Quick stats -->
    <div class="row q-col-gutter-sm q-mb-md ts-stagger">
      <div class="col-6">
        <q-card flat class="ts-card-flat q-pa-md">
          <q-icon name="shopping_bag" color="primary" size="22px" />
          <div class="text-h6 text-weight-bold q-mt-xs">{{ summary.itemsSold }}</div>
          <div class="ts-muted text-caption">{{ $t("dash.itemsSold") }}</div>
        </q-card>
      </div>
      <div class="col-6">
        <q-card flat class="ts-card-flat q-pa-md">
          <q-icon name="trending_up" color="positive" size="22px" />
          <div class="text-h6 text-weight-bold q-mt-xs ts-peso">
            ₱{{ fmt(summary.grossProfit) }}
          </div>
          <div class="ts-muted text-caption">{{ $t("dash.grossProfit") }}</div>
        </q-card>
      </div>
      <div class="col-6">
        <q-card
          flat
          class="ts-card-flat q-pa-md tw-cursor-pointer"
          @click="inventoryOpen = true"
        >
          <div class="row items-center justify-between">
            <q-icon name="inventory" color="accent" size="22px" />
            <q-icon name="edit" color="grey-5" size="16px" />
          </div>
          <div class="text-h6 text-weight-bold ts-peso q-mt-xs">
            ₱{{ fmt(inventoryValue) }}
          </div>
          <div class="ts-muted text-caption">{{ $t("dash.inventoryValue") }}</div>
        </q-card>
      </div>
      <div class="col-6">
        <q-card flat class="ts-card-flat q-pa-md">
          <q-icon name="warning" color="negative" size="22px" />
          <div class="text-h6 text-weight-bold q-mt-xs">{{ predictedStockouts.length }}</div>
          <div class="ts-muted text-caption">{{ $t("dash.stockouts") }}</div>
        </q-card>
      </div>
      <div class="col-12">
        <q-card
          flat
          class="ts-card-flat q-pa-md row items-center justify-between tw-cursor-pointer"
          @click="$router.push('/utang')"
        >
          <div class="row items-center q-gutter-sm">
            <q-icon name="handshake" color="secondary" size="22px" />
            <div>
              <div class="text-h6 text-weight-bold ts-peso">
                ₱{{ fmt(totalReceivables) }}
              </div>
              <div class="ts-muted text-caption">
                {{ $t("dash.receivables") }} · {{ debtorsCount }} {{ $t("dash.suki") }}
              </div>
            </div>
          </div>
          <q-icon name="chevron_right" color="grey-5" />
        </q-card>
      </div>
    </div>

    <!-- Today's AI recommendation -->
    <div class="row items-center justify-between q-mb-sm">
      <div class="ts-section-title">
        <q-icon name="auto_awesome" color="accent" /> {{ $t("dash.recoTitle") }}
      </div>
      <q-btn
        flat
        dense
        no-caps
        size="sm"
        color="primary"
        :label="$t('dash.all')"
        to="/insights"
      />
    </div>

    <div v-if="topRecs.length === 0" class="ts-alert ts-alert--success q-pa-md">
      <q-icon name="check_circle" color="positive" /> {{ $t("dash.allGood") }}
    </div>

    <transition-group name="ts-fade" tag="div">
      <q-card
        v-for="(rec, i) in topRecs"
        :key="rec.title + i"
        flat
        class="ts-alert q-pa-md q-mb-sm"
        :class="`ts-alert--${rec.type}`"
      >
        <div class="row no-wrap items-start">
          <q-icon
            :name="rec.icon"
            :color="colorFor(rec.type)"
            size="22px"
            class="q-mr-sm q-mt-xs"
          />
          <div class="col">
            <div class="text-weight-bold">{{ rec.title }}</div>
            <div class="text-body2 ts-muted">{{ rec.message }}</div>
          </div>
        </div>
      </q-card>
    </transition-group>

    <!-- Puhunan sa stock — breakdown at mabilisang edit -->
    <q-dialog v-model="inventoryOpen" position="bottom">
      <q-card
        class="tw-w-full tw-rounded-t-3xl tw-overflow-hidden"
        style="max-width: 480px"
      >
        <div class="ts-gradient tw-text-white tw-px-5 tw-py-4">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div>
              <div class="tw-text-lg tw-font-bold">Puhunan sa stock</div>
              <div class="tw-text-xs tw-text-white/80">
                Kabuuan ng (puhunan × stock) ng bawat paninda
              </div>
            </div>
            <div class="tw-text-2xl tw-font-bold ts-peso">
              ₱{{ fmt(inventoryValue) }}
            </div>
          </div>
        </div>

        <q-list style="max-height: 56vh; overflow-y: auto">
          <q-item v-for="p in inventoryRows" :key="p.id">
            <q-item-section>
              <q-item-label>{{ p.name }}</q-item-label>
              <q-item-label caption>
                ₱{{ p.cost }} × {{ p.stock }} {{ p.unit }}
              </q-item-label>
            </q-item-section>
            <q-item-section side class="tw-flex-row tw-items-center">
              <span class="text-weight-bold ts-peso q-mr-sm">
                ₱{{ fmt(p.cost * p.stock) }}
              </span>
              <q-btn
                flat
                round
                dense
                size="sm"
                icon="edit"
                color="accent"
                @click="openInvEdit(p)"
              />
              <q-btn
                flat
                round
                dense
                size="sm"
                icon="delete_outline"
                color="negative"
                @click="askDeleteProduct(p)"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <q-separator />
        <div class="tw-px-5 tw-py-3 tw-text-xs tw-text-slate-500">
          Baguhin ang puhunan o stock para mag-update ang kabuuan.
        </div>
      </q-card>
    </q-dialog>

    <!-- Mabilisang edit ng puhunan/stock ng isang paninda -->
    <q-dialog v-model="invEditOpen">
      <q-card class="ts-card" style="min-width: 300px">
        <q-card-section>
          <div class="text-weight-bold">I-adjust ang paninda</div>
          <div class="ts-muted text-caption">{{ invForm.name }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-sm">
            <q-input
              v-model.number="invForm.cost"
              class="col"
              type="number"
              outlined
              dense
              label="Puhunan"
              prefix="₱"
              min="0"
            />
            <q-input
              v-model.number="invForm.stock"
              class="col"
              type="number"
              outlined
              dense
              label="Stock"
              min="0"
            />
          </div>
          <div class="tw-mt-3 tw-rounded-xl tw-bg-slate-50 tw-px-3 tw-py-2 tw-text-sm tw-flex tw-justify-between">
            <span class="tw-text-slate-500">Halaga sa stock</span>
            <span class="tw-font-bold ts-peso">
              ₱{{ fmt((invForm.cost || 0) * (invForm.stock || 0)) }}
            </span>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Kanselahin" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            label="I-save"
            @click="saveInvEdit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters, mapActions } from "vuex";
import TindaBuddy from "components/TindaBuddy.vue";

export default defineComponent({
  name: "IndexPage",
  components: { TindaBuddy },
  data() {
    return {
      inventoryOpen: false,
      invEditOpen: false,
      invForm: { id: null, name: "", cost: 0, stock: 0 },
      buddyIndex: 0,
      period: "today",
    };
  },
  computed: {
    ...mapGetters("tindasense", [
      "todaySummary",
      "earningsForRange",
      "inventoryValue",
      "predictedStockouts",
      "dailyRecommendations",
      "totalReceivables",
      "debtorsCount",
      "products",
      "lang",
    ]),
    summary() {
      return this.todaySummary;
    },
    periodOptions() {
      // Depende sa lang (nakamap para reactive).
      this.lang;
      return [
        { label: this.$t("dash.periodDay"), value: "today" },
        { label: this.$t("dash.periodWeek"), value: "week" },
        { label: this.$t("dash.periodMonth"), value: "month" },
        { label: this.$t("dash.periodYear"), value: "year" },
      ];
    },
    periodDays() {
      return { today: 1, week: 7, month: 30, year: 365 }[this.period] || 1;
    },
    periodLabel() {
      this.lang;
      return this.$t(`dash.period.${this.period}`);
    },
    rangeSummary() {
      return this.earningsForRange(this.periodDays);
    },
    // Mga paninda na may stock, naka-sort ayon sa laki ng puhunan.
    inventoryRows() {
      return [...this.products]
        .filter((p) => p.stock > 0 || p.cost > 0)
        .sort((a, b) => b.cost * b.stock - a.cost * a.stock);
    },
    topRecs() {
      return this.dailyRecommendations.slice(0, 3);
    },
    greeting() {
      this.lang;
      const h = new Date().getHours();
      if (h < 11) return this.$t("dash.goodMorning");
      if (h < 18) return this.$t("dash.goodAfternoon");
      return this.$t("dash.goodEvening");
    },
    // Mga tip/bati ng mascot base sa totoong estado ng tindahan.
    buddyTips() {
      const tips = [];
      if (this.products.length === 0) {
        tips.push({
          text: "Kumusta! Magsimula tayo — mag-add ng unang paninda mo. 🛒",
          mood: "wave",
        });
      } else {
        tips.push({ text: "Handa na ako tumulong sa tindahan! 😊", mood: "wave" });
      }
      if (this.summary.netProfit > 0) {
        tips.push({
          text: `Ayos! May kita kang ₱${this.fmt(
            this.summary.netProfit
          )} ngayon. 🎉`,
          mood: "happy",
        });
      } else if (this.summary.revenue > 0 && this.summary.netProfit <= 0) {
        tips.push({
          text: "Ingat sa gastos ngayon — bantayan natin ang tubo. 🤔",
          mood: "think",
        });
      }
      if (this.predictedStockouts.length > 0) {
        tips.push({
          text: `May ${this.predictedStockouts.length} paninda na mauubos na. Baka oras na mag-restock! 📦`,
          mood: "think",
        });
      }
      if (this.debtorsCount > 0) {
        tips.push({
          text: `May ${this.debtorsCount} suki na may utang (₱${this.fmt(
            this.totalReceivables
          )}). Huwag kalimutang singilin. 😉`,
          mood: "happy",
        });
      }
      tips.push({
        text: "Pindutin mo ako para sa isa pang tip! 👆",
        mood: "happy",
      });
      return tips;
    },
    buddyMessage() {
      const tips = this.buddyTips;
      return tips[this.buddyIndex % tips.length].text;
    },
    buddyMood() {
      const tips = this.buddyTips;
      return tips[this.buddyIndex % tips.length].mood;
    },
  },
  methods: {
    ...mapActions("tindasense", ["updateProduct", "deleteProduct"]),
    nextBuddyMessage() {
      this.buddyIndex = (this.buddyIndex + 1) % this.buddyTips.length;
    },
    askDeleteProduct(p) {
      this.$q
        .dialog({
          title: "Tanggalin ang paninda?",
          message: `Mabubura ang ${p.name} at ang mga benta record nito. Hindi na ito maibabalik.`,
          cancel: { label: "Kanselahin", flat: true },
          ok: { label: "Tanggalin", color: "negative", unelevated: true },
        })
        .onOk(() => {
          this.deleteProduct(p.id);
          this.$q.notify({
            message: `Natanggal: ${p.name}`,
            icon: "delete",
            color: "negative",
          });
        });
    },
    openInvEdit(p) {
      this.invForm = {
        id: p.id,
        name: p.name,
        cost: p.cost,
        stock: p.stock,
      };
      this.invEditOpen = true;
    },
    saveInvEdit() {
      this.updateProduct({
        id: this.invForm.id,
        changes: {
          cost: Number(this.invForm.cost) || 0,
          stock: Number(this.invForm.stock) || 0,
        },
      });
      this.$q.notify({
        message: `Na-update ang ${this.invForm.name}.`,
        icon: "check",
        color: "accent",
      });
      this.invEditOpen = false;
    },
    fmt(n) {
      return Number(n || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    },
    colorFor(type) {
      return {
        danger: "negative",
        warning: "warning",
        success: "positive",
        info: "accent",
      }[type];
    },
  },
});
</script>
