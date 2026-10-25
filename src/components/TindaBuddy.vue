<template>
  <div class="ts-buddy-wrap">
    <!-- Speech bubble -->
    <transition name="ts-bubble">
      <div v-if="message" :key="message" class="ts-buddy-bubble ts-card">
        <div class="tw-text-sm tw-font-medium tw-text-slate-700">
          {{ message }}
        </div>
        <div class="ts-buddy-bubble-tail"></div>
      </div>
    </transition>

    <!-- Teddy bear mascot -->
    <div class="ts-buddy" :class="moodClass" @click="onClick">
      <svg viewBox="0 0 130 150" width="98" height="113">
        <!-- shadow -->
        <ellipse cx="65" cy="143" rx="30" ry="5.5" fill="rgba(15,23,42,0.12)">
          <animate
            attributeName="rx"
            values="30;26;30"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </ellipse>

        <g class="ts-buddy-body">
          <!-- round bear body -->
          <ellipse cx="65" cy="120" rx="28" ry="24" :fill="fur" />
          <!-- tummy -->
          <ellipse cx="65" cy="122" rx="17" ry="16" :fill="belly" />
          <!-- apron (tindero touch) -->
          <path
            d="M54 108 L76 108 L80 140 Q65 145 50 140 Z"
            fill="#ffffff"
            opacity="0.92"
          />
          <circle cx="65" cy="126" r="4" fill="var(--ts-primary)" opacity="0.35" />

          <!-- legs -->
          <ellipse cx="52" cy="140" rx="9" ry="7" :fill="fur" />
          <ellipse cx="78" cy="140" rx="9" ry="7" :fill="fur" />
          <ellipse cx="52" cy="141" rx="5" ry="3.5" :fill="belly" />
          <ellipse cx="78" cy="141" rx="5" ry="3.5" :fill="belly" />

          <!-- arms / paws -->
          <g class="ts-buddy-arm-l">
            <ellipse cx="40" cy="116" rx="9" ry="7" :fill="fur" transform="rotate(-20 40 116)" />
          </g>
          <g class="ts-buddy-arm-r">
            <ellipse cx="90" cy="116" rx="9" ry="7" :fill="fur" transform="rotate(20 90 116)" />
          </g>

          <!-- BIG bear head -->
          <g class="ts-buddy-head">
            <!-- round ears -->
            <circle cx="36" cy="34" r="14" :fill="fur" />
            <circle cx="94" cy="34" r="14" :fill="fur" />
            <circle cx="36" cy="34" r="7" :fill="belly" />
            <circle cx="94" cy="34" r="7" :fill="belly" />

            <!-- face -->
            <circle cx="65" cy="58" r="40" :fill="fur" />

            <!-- tiny shopkeeper cap -->
            <path d="M38 40 Q65 16 92 40 Q92 30 65 28 Q38 30 38 40 Z" fill="var(--ts-primary-dark)" />
            <rect x="36" y="37" width="58" height="7" rx="3.5" fill="var(--ts-primary)" />

            <!-- muzzle -->
            <ellipse cx="65" cy="70" rx="20" ry="16" :fill="belly" />

            <!-- BIG shiny eyes -->
            <g class="ts-buddy-eyes">
              <ellipse cx="52" cy="58" rx="6.5" ry="8" fill="#ffffff" />
              <ellipse cx="78" cy="58" rx="6.5" ry="8" fill="#ffffff" />
              <circle cx="52" cy="60" r="5" fill="#2d2016" />
              <circle cx="78" cy="60" r="5" fill="#2d2016" />
              <circle cx="54" cy="57" r="2" fill="#fff" />
              <circle cx="80" cy="57" r="2" fill="#fff" />
            </g>

            <!-- rosy cheeks -->
            <circle cx="42" cy="68" r="5.5" fill="#ff9a9a" opacity="0.5" />
            <circle cx="88" cy="68" r="5.5" fill="#ff9a9a" opacity="0.5" />

            <!-- nose -->
            <ellipse cx="65" cy="64" rx="5" ry="4" fill="#3b2a20" />
            <!-- mouth -->
            <path
              d="M65 68 L65 73 M65 73 Q59 78 54 74 M65 73 Q71 78 76 74"
              stroke="#5c4330"
              stroke-width="2.2"
              fill="none"
              stroke-linecap="round"
            />
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

// Mga cute, maliwanag na kulay ng bear: [fur, belly/snout]
const BEAR_COLORS = [
  ["#c08552", "#ecd3b4"], // classic brown
  ["#f4a261", "#ffe0c2"], // honey tan
  ["#f9a8d4", "#fde4f1"], // pink
  ["#7dd3c0", "#e3fbf4"], // mint
  ["#fcd34d", "#fff7dd"], // golden
  ["#c4b5fd", "#f3f0ff"], // lavender
  ["#7ec8f3", "#e0f2fe"], // sky blue
  ["#fca5a5", "#ffe4e4"], // coral
];

export default defineComponent({
  name: "TindaBuddy",
  props: {
    message: { type: String, default: "" },
    mood: { type: String, default: "happy" }, // happy | wave | think
  },
  emits: ["poke"],
  data() {
    return {
      // Random na kulay sa bawat pag-load.
      colorIndex: Math.floor(Math.random() * BEAR_COLORS.length),
    };
  },
  computed: {
    moodClass() {
      return `ts-buddy--${this.mood}`;
    },
    fur() {
      return BEAR_COLORS[this.colorIndex][0];
    },
    belly() {
      return BEAR_COLORS[this.colorIndex][1];
    },
  },
  methods: {
    onClick() {
      // Magpalit ng kulay tuwing tatapikin, tapos i-emit ang poke.
      this.colorIndex = (this.colorIndex + 1) % BEAR_COLORS.length;
      this.$emit("poke");
    },
  },
});
</script>

<style scoped>
.ts-buddy-wrap {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

/* Bouncier idle bob (mas pambata) */
.ts-buddy {
  cursor: pointer;
  transform-origin: bottom center;
  animation: ts-buddy-bob 2.4s ease-in-out infinite;
  flex-shrink: 0;
  user-select: none;
}
@keyframes ts-buddy-bob {
  0%,
  100% {
    transform: translateY(0) rotate(0deg) scale(1);
  }
  50% {
    transform: translateY(-6px) rotate(-2deg) scale(1.02);
  }
}
.ts-buddy:active {
  transform: scale(0.92);
}

/* Smooth na palit ng kulay ng bear */
.ts-buddy svg ellipse,
.ts-buddy svg circle {
  transition: fill 0.4s ease;
}

/* Blink — mas mabilis at cute */
.ts-buddy-eyes {
  animation: ts-blink 3.5s infinite;
  transform-origin: center 66px;
}
@keyframes ts-blink {
  0%,
  90%,
  100% {
    transform: scaleY(1);
  }
  94% {
    transform: scaleY(0.08);
  }
}

/* Head bobble (mas playful) */
.ts-buddy-head {
  transform-origin: 65px 92px;
  animation: ts-head-tilt 4s ease-in-out infinite;
}
@keyframes ts-head-tilt {
  0%,
  100% {
    transform: rotate(-2deg);
  }
  50% {
    transform: rotate(3deg);
  }
}

/* Waving right arm kapag mood=wave */
.ts-buddy--wave .ts-buddy-arm-r {
  transform-origin: 84px 118px;
  animation: ts-wave 0.7s ease-in-out infinite;
}
@keyframes ts-wave {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-28deg);
  }
}

/* Thinking: mas mabilis na bobble */
.ts-buddy--think .ts-buddy-head {
  animation: ts-head-tilt 2s ease-in-out infinite;
}

/* Speech bubble */
.ts-buddy-bubble {
  position: relative;
  padding: 10px 12px;
  max-width: 190px;
  border-radius: 16px;
  margin-bottom: 26px;
}
.ts-buddy-bubble-tail {
  position: absolute;
  right: -7px;
  bottom: 14px;
  width: 14px;
  height: 14px;
  background: var(--ts-surface);
  transform: rotate(45deg);
  border-radius: 2px;
}

.ts-bubble-enter-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.ts-bubble-leave-active {
  transition: opacity 0.2s ease;
}
.ts-bubble-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.9);
}
.ts-bubble-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .ts-buddy,
  .ts-buddy-eyes,
  .ts-buddy-head,
  .ts-buddy--wave .ts-buddy-arm-r {
    animation: none !important;
  }
}
</style>
