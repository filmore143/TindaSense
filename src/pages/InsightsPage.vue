<template>
  <q-page class="ts-page q-pa-md">
    <!-- AI header -->
    <div class="ts-stat ts-gradient q-mb-md" style="padding: 20px">
      <q-icon class="ts-stat-icon" name="auto_awesome" />
      <div class="row items-center q-gutter-x-sm">
        <q-icon name="auto_awesome" size="22px" />
        <div class="text-weight-bold text-subtitle1">TindaSense AI</div>
      </div>
      <div class="text-caption q-mt-xs" style="opacity: 0.9">
        {{ $t("ai.sub") }}
      </div>
      <div class="row q-gutter-sm q-mt-sm">
        <q-chip dense color="white" text-color="negative" icon="priority_high">
          {{ alertCounts.danger }} {{ $t("ai.urgent") }}
        </q-chip>
        <q-chip dense color="white" text-color="warning" icon="warning">
          {{ alertCounts.warning }} {{ $t("ai.warning") }}
        </q-chip>
      </div>
    </div>

    <!-- Charts -->
    <div class="ts-section-title q-mb-sm">
      <q-icon name="insights" color="accent" /> {{ $t("ai.salesTrend") }}
    </div>

    <!-- Benta kada araw (last 7 days) -->
    <q-card flat class="ts-card-flat q-pa-md q-mb-sm">
      <div class="row items-center justify-between q-mb-xs">
        <div class="text-weight-bold">{{ $t("ai.salesWeek") }}</div>
        <q-btn-toggle
          v-model="metric"
          dense
          unelevated
          size="sm"
          no-caps
          toggle-color="primary"
          color="grey-3"
          text-color="grey-8"
          :options="metricOptions"
        />
      </div>
      <BarChart
        :data="weeklyChart"
        :color="metric === 'net' ? '#16a34a' : '#0f766e'"
      />
      <div class="tw-flex tw-justify-between tw-text-xs tw-text-slate-500 tw-mt-1">
        <span>{{ $t("ai.total") }}: ₱{{ weeklyTotal.toLocaleString() }}</span>
        <span :class="trendColor">{{ trendLabel }}</span>
      </div>
    </q-card>

    <!-- Top sellers -->
    <q-card flat class="ts-card-flat q-pa-md q-mb-sm">
      <div class="text-weight-bold q-mb-sm">
        <q-icon name="military_tech" color="amber-8" size="18px" /> {{ $t("ai.topEarners") }}
      </div>
      <RankBars :data="topSellersChart(5)" />
    </q-card>

    <!-- Sales by category -->
    <q-card flat class="ts-card-flat q-pa-md q-mb-md">
      <div class="text-weight-bold q-mb-sm">
        <q-icon name="donut_large" color="indigo-6" size="18px" /> {{ $t("ai.byCategory") }}
      </div>
      <RankBars :data="salesByCategory" />
    </q-card>

    <!-- Recommendations -->
    <div class="ts-section-title q-mb-sm">
      <q-icon name="tips_and_updates" color="accent" /> {{ $t("ai.recommendations") }}
    </div>

    <div
      v-if="dailyRecommendations.length === 0"
      class="ts-alert ts-alert--success q-pa-md q-mb-md"
    >
      <q-icon name="check_circle" color="positive" /> {{ $t("ai.noReco") }}
    </div>

    <q-card
      v-for="(rec, i) in dailyRecommendations"
      :key="i"
      flat
      class="ts-alert q-pa-md q-mb-sm"
      :class="`ts-alert--${rec.type}`"
    >
      <div class="row no-wrap items-start">
        <q-icon
          :name="rec.icon"
          :color="colorFor(rec.type)"
          size="24px"
          class="q-mr-sm q-mt-xs"
        />
        <div class="col">
          <div class="text-weight-bold">{{ rec.title }}</div>
          <div class="text-body2 ts-muted">{{ rec.message }}</div>
        </div>
      </div>
    </q-card>

    <!-- Stockout prediction -->
    <div class="ts-section-title q-mt-lg q-mb-sm">
      <q-icon name="schedule" color="negative" /> {{ $t("ai.whenOut") }}
    </div>
    <q-card flat class="ts-card-flat q-mb-md">
      <q-list separator>
        <q-item v-for="p in predictedStockouts" :key="p.id">
          <q-item-section>
            <q-item-label>{{ p.name }}</q-item-label>
            <q-item-label caption>
              {{ p.stock }} {{ p.unit }} · ~{{ p.dailyAvgSold }}/{{ $t("prod.daysLeft") }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge
              :color="p.level === 'low' ? 'warning' : 'negative'"
              :label="p.level === 'out' ? $t('prod.lvlOut') : `${p.daysLeft} ${$t('prod.daysLeft')}`"
            />
          </q-item-section>
        </q-item>
        <q-item v-if="predictedStockouts.length === 0">
          <q-item-section class="ts-muted text-caption">
            {{ $t("ai.enough") }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- Profit ranking -->
    <div class="ts-section-title q-mb-sm">
      <q-icon name="leaderboard" color="positive" /> {{ $t("ai.profitPerProduct") }}
    </div>
    <q-card flat class="ts-card-flat">
      <q-list separator>
        <q-item v-for="(p, idx) in productPerformance" :key="p.id">
          <q-item-section avatar>
            <q-avatar
              size="30px"
              :color="p.totalProfit > 0 ? 'green-1' : 'red-1'"
              :text-color="p.totalProfit > 0 ? 'positive' : 'negative'"
              class="text-weight-bold"
            >
              {{ idx + 1 }}
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ p.name }}</q-item-label>
            <q-item-label caption>
              {{ p.soldQty }} {{ $t("ai.sold") }} · {{ p.marginPct }}% {{ $t("ai.margin") }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div
              class="text-weight-bold ts-peso"
              :class="p.totalProfit > 0 ? 'text-positive' : 'text-negative'"
            >
              ₱{{ p.totalProfit.toLocaleString() }}
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters } from "vuex";
import BarChart from "components/BarChart.vue";
import RankBars from "components/RankBars.vue";

export default defineComponent({
  name: "InsightsPage",
  components: { BarChart, RankBars },
  data() {
    return {
      metric: "revenue",
    };
  },
  computed: {
    ...mapGetters("tindasense", [
      "dailyRecommendations",
      "predictedStockouts",
      "productPerformance",
      "alertCounts",
      "dailySalesSeries",
      "topSellersChart",
      "salesByCategory",
      "lang",
    ]),
    metricOptions() {
      this.lang;
      return [
        { label: this.$t("ai.metricSales"), value: "revenue" },
        { label: this.$t("ai.metricProfit"), value: "net" },
      ];
    },
    weekSeries() {
      return this.dailySalesSeries(7);
    },
    weeklyChart() {
      return this.weekSeries.map((d) => ({
        label: d.label,
        value: d[this.metric],
      }));
    },
    weeklyTotal() {
      return this.weekSeries.reduce((sum, d) => sum + d[this.metric], 0);
    },
    // Ikumpara ang unang kalahati vs. ikalawang kalahati ng linggo.
    trend() {
      const vals = this.weekSeries.map((d) => d[this.metric]);
      const half = Math.floor(vals.length / 2);
      const first = vals.slice(0, half).reduce((a, b) => a + b, 0);
      const second = vals.slice(half).reduce((a, b) => a + b, 0);
      if (first === 0) return second > 0 ? 100 : 0;
      return Math.round(((second - first) / Math.abs(first)) * 100);
    },
    trendLabel() {
      this.lang;
      const t = this.trend;
      if (t > 0) return `▲ ${t}% ${this.$t("ai.trendUp")}`;
      if (t < 0) return `▼ ${Math.abs(t)}% ${this.$t("ai.trendDown")}`;
      return `— ${this.$t("ai.trendFlat")}`;
    },
    trendColor() {
      if (this.trend > 0) return "tw-text-emerald-600";
      if (this.trend < 0) return "tw-text-red-500";
      return "tw-text-slate-400";
    },
  },
  methods: {
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
