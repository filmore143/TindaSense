<template>
  <div class="tw-w-full tw-space-y-2">
    <div v-for="(d, i) in data" :key="i">
      <div class="tw-flex tw-justify-between tw-text-xs tw-mb-1">
        <span class="tw-font-medium tw-text-slate-700 tw-truncate tw-pr-2">
          {{ d.label }}
        </span>
        <span class="tw-text-slate-500 tw-whitespace-nowrap">
          {{ prefix }}{{ fmt(d.value) }}{{ d.qty != null ? ` · ${d.qty}` : "" }}
        </span>
      </div>
      <div class="tw-h-2.5 tw-rounded-full tw-bg-slate-100 tw-overflow-hidden">
        <div
          class="tw-h-full tw-rounded-full tw-transition-all"
          :style="{
            width: pct(d.value) + '%',
            background: colorAt(i),
          }"
        ></div>
      </div>
    </div>
    <div v-if="data.length === 0" class="tw-text-xs tw-text-slate-400 tw-py-2">
      Wala pang datos.
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "RankBars",
  props: {
    data: { type: Array, default: () => [] }, // [{ label, value, qty? }]
    prefix: { type: String, default: "₱" },
    colors: {
      type: Array,
      default: () => ["#0f766e", "#0891b2", "#6366f1", "#f59e0b", "#f97316"],
    },
  },
  computed: {
    max() {
      return Math.max(1, ...this.data.map((d) => Math.abs(d.value) || 0));
    },
  },
  methods: {
    pct(v) {
      return Math.max(3, (Math.abs(v) / this.max) * 100);
    },
    colorAt(i) {
      return this.colors[i % this.colors.length];
    },
    fmt(n) {
      return Number(n || 0).toLocaleString("en-PH");
    },
  },
});
</script>
