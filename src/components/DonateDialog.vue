<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="(v) => $emit('update:modelValue', v)"
  >
    <q-card class="tw-w-[340px] tw-max-w-full tw-rounded-3xl tw-overflow-hidden">
      <!-- Header -->
      <div class="ts-gradient tw-text-white tw-px-5 tw-pt-5 tw-pb-6 tw-relative">
        <q-btn
          flat
          round
          dense
          icon="close"
          class="tw-absolute tw-right-2 tw-top-2"
          v-close-popup
        />
        <div class="tw-flex tw-flex-col tw-items-center tw-text-center">
          <div class="ts-heart">❤️</div>
          <div class="tw-text-lg tw-font-bold tw-mt-1">{{ $t("donate.title") }}</div>
          <div class="tw-text-xs tw-text-white/85 tw-mt-1 tw-px-2">
            {{ $t("donate.sub") }}
          </div>
        </div>
      </div>

      <q-card-section class="tw-px-5 tw-pt-4 tw-pb-2">
        <!-- QR / payment card -->
        <div class="tw-flex tw-justify-center">
          <img
            v-if="hasQr"
            :src="qrSrc"
            alt="Donate QR"
            class="tw-w-full tw-max-w-[260px] tw-rounded-2xl tw-shadow-md"
            @error="hasQr = false"
          />
          <div
            v-else
            class="tw-w-full tw-max-w-[260px] tw-aspect-[4/5] tw-flex tw-flex-col tw-items-center tw-justify-center tw-text-center tw-text-slate-400 tw-border-2 tw-border-dashed tw-border-slate-200 tw-rounded-2xl tw-px-4"
          >
            <q-icon name="qr_code_2" size="46px" />
            <div class="tw-text-xs tw-mt-2">
              Ilagay ang <b>donate.jpeg</b> sa <b>public/</b> folder para dito
              lumitaw ang QR.
            </div>
          </div>
        </div>

        <!-- Appreciation chips -->
        <div class="tw-flex tw-justify-center tw-gap-2 tw-mt-4">
          <q-chip
            v-for="t in tiers"
            :key="t"
            dense
            class="ts-pay-chip tw-font-semibold"
          >
            ₱{{ t }}
          </q-chip>
        </div>
      </q-card-section>

      <q-card-section class="tw-px-5 tw-pb-5 tw-pt-2">
        <q-btn
          unelevated
          no-caps
          class="full-width tw-rounded-xl tw-font-bold"
          color="primary"
          icon="favorite"
          :label="$t('donate.thanks')"
          v-close-popup
        />
        <div class="tw-text-center tw-text-[11px] tw-text-slate-400 tw-mt-2">
          {{ $t("donate.footer") }}
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters } from "vuex";

export default defineComponent({
  name: "DonateDialog",
  props: {
    modelValue: { type: Boolean, default: false },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      hasQr: true,
      // Nasa public/ folder — walang build error kahit wala pa ang file;
      // ang @error handler ang magpapakita ng placeholder.
      qrSrc: "/donate.jpeg",
      tiers: [20, 50, 100],
    };
  },
  computed: {
    ...mapGetters("tindasense", ["lang"]),
  },
});
</script>

<style scoped>
.ts-heart {
  font-size: 34px;
  animation: ts-heart-beat 1.3s ease-in-out infinite;
}
@keyframes ts-heart-beat {
  0%,
  100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.18);
  }
  40% {
    transform: scale(1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ts-heart {
    animation: none;
  }
}
</style>
