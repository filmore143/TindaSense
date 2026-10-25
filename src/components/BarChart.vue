<template>
  <div class="tw-w-full">
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      class="tw-w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- Baseline -->
      <line
        :x1="pad"
        :y1="baseY"
        :x2="width - pad"
        :y2="baseY"
        stroke="#e2e8f0"
        stroke-width="1"
      />

      <!-- Bars -->
      <g v-for="(d, i) in data" :key="i">
        <rect
          :x="barX(i)"
          :y="barY(d.value)"
          :width="barWidth"
          :height="barHeight(d.value)"
          :rx="Math.min(6, barWidth / 2)"
          :fill="color"
        >
          <title>{{ d.label }}: {{ d.value }}</title>
        </rect>
        <!-- Value sa taas -->
        <text
          :x="barX(i) + barWidth / 2"
          :y="barY(d.value) - 4"
          text-anchor="middle"
          font-size="9"
          fill="#64748b"
        >
          {{ compact(d.value) }}
        </text>
        <!-- Label sa ilalim -->
        <text
          :x="barX(i) + barWidth / 2"
          :y="height - 4"
          text-anchor="middle"
          font-size="9"
          fill="#94a3b8"
        >
          {{ d.label }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "BarChart",
  props: {
    // [{ label, value }]
    data: { type: Array, default: () => [] },
    color: { type: String, default: "#0f766e" },
    height: { type: Number, default: 150 },
  },
  data() {
    return {
      width: 320,
      pad: 14,
      topPad: 18,
    };
  },
  computed: {
    baseY() {
      return this.height - 16;
    },
    chartHeight() {
      return this.baseY - this.topPad;
    },
    maxValue() {
      const max = Math.max(1, ...this.data.map((d) => d.value || 0));
      return max;
    },
    slot() {
      return (this.width - this.pad * 2) / Math.max(1, this.data.length);
    },
    barWidth() {
      return this.slot * 0.6;
    },
  },
  methods: {
    barX(i) {
      return this.pad + this.slot * i + (this.slot - this.barWidth) / 2;
    },
    barHeight(v) {
      return Math.max(1, (Math.max(0, v) / this.maxValue) * this.chartHeight);
    },
    barY(v) {
      return this.baseY - this.barHeight(v);
    },
    compact(v) {
      if (Math.abs(v) >= 1000) return (v / 1000).toFixed(1) + "k";
      return String(v);
    },
  },
});
</script>
