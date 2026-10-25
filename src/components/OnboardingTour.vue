<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @update:model-value="(v) => $emit('update:modelValue', v)"
  >
    <q-card class="tw-w-[340px] tw-max-w-full tw-rounded-3xl tw-overflow-hidden">
      <!-- Illustration header -->
      <div class="ts-gradient tw-text-white tw-px-6 tw-pt-7 tw-pb-6 tw-text-center tw-relative">
        <div class="ts-onb-emoji">{{ steps[step].emoji }}</div>
        <div class="tw-text-lg tw-font-bold tw-mt-2">{{ steps[step].title }}</div>
        <div class="tw-text-sm tw-text-white/85 tw-mt-1">
          {{ steps[step].text }}
        </div>
      </div>

      <!-- Feature list (step-specific) -->
      <q-card-section class="tw-px-5 tw-py-4">
        <div
          v-for="(item, i) in steps[step].items"
          :key="i"
          class="tw-flex tw-items-center tw-gap-3 tw-py-1.5"
        >
          <q-avatar
            size="34px"
            :color="item.color"
            text-color="white"
            :icon="item.icon"
          />
          <div>
            <div class="tw-text-sm tw-font-semibold tw-text-slate-800">
              {{ item.label }}
            </div>
            <div class="tw-text-xs tw-text-slate-500">{{ item.desc }}</div>
          </div>
        </div>
      </q-card-section>

      <!-- Dots + actions -->
      <div class="tw-flex tw-justify-center tw-gap-1.5 tw-pb-2">
        <div
          v-for="(s, i) in steps"
          :key="i"
          class="ts-onb-dot"
          :class="{ 'ts-onb-dot--active': i === step }"
        ></div>
      </div>

      <q-card-actions class="tw-px-5 tw-pb-5 tw-pt-1 tw-gap-2">
        <q-btn
          flat
          no-caps
          color="grey-6"
          :label="$t('onb.skip')"
          @click="finish"
        />
        <q-space />
        <q-btn
          unelevated
          no-caps
          class="tw-rounded-xl tw-font-bold tw-px-5"
          color="primary"
          :label="step < steps.length - 1 ? $t('onb.next') : $t('onb.start')"
          @click="next"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters } from "vuex";

export default defineComponent({
  name: "OnboardingTour",
  props: {
    modelValue: { type: Boolean, default: false },
  },
  emits: ["update:modelValue"],
  watch: {
    modelValue(open) {
      if (open) this.step = 0; // laging mag-umpisa sa unang slide
    },
  },
  data() {
    return {
      step: 0,
    };
  },
  computed: {
    ...mapGetters("tindasense", ["lang"]),
    steps() {
      this.lang;
      const t = (k) => this.$t(k);
      return [
        {
          emoji: "👋",
          title: t("onb.s1Title"),
          text: t("onb.s1Text"),
          items: [
            { icon: "dashboard", color: "teal-6", label: t("onb.s1aLabel"), desc: t("onb.s1aDesc") },
            { icon: "auto_awesome", color: "indigo-5", label: t("onb.s1bLabel"), desc: t("onb.s1bDesc") },
          ],
        },
        {
          emoji: "🛒",
          title: t("onb.s2Title"),
          text: t("onb.s2Text"),
          items: [
            { icon: "inventory_2", color: "teal-6", label: t("onb.s2aLabel"), desc: t("onb.s2aDesc") },
            { icon: "point_of_sale", color: "green-6", label: t("onb.s2bLabel"), desc: t("onb.s2bDesc") },
            { icon: "menu_book", color: "orange-7", label: t("onb.s2cLabel"), desc: t("onb.s2cDesc") },
          ],
        },
        {
          emoji: "✨",
          title: t("onb.s3Title"),
          text: t("onb.s3Text"),
          items: [
            { icon: "palette", color: "purple-5", label: t("onb.s3aLabel"), desc: t("onb.s3aDesc") },
            { icon: "lock", color: "blue-grey-6", label: t("onb.s3bLabel"), desc: t("onb.s3bDesc") },
            { icon: "store", color: "teal-6", label: t("onb.s3cLabel"), desc: t("onb.s3cDesc") },
          ],
        },
      ];
    },
  },
  methods: {
    next() {
      if (this.step < this.steps.length - 1) {
        this.step += 1;
      } else {
        this.finish();
      }
    },
    finish() {
      this.$emit("update:modelValue", false);
    },
  },
});
</script>

<style scoped>
.ts-onb-emoji {
  font-size: 48px;
  line-height: 1;
  animation: ts-onb-pop 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes ts-onb-pop {
  0% {
    transform: scale(0.4);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.ts-onb-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #cbd5e1;
  transition: all 0.2s ease;
}
.ts-onb-dot--active {
  width: 20px;
  border-radius: 999px;
  background: var(--ts-primary);
}
</style>
