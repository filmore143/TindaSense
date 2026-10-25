<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="close"
    @hide="stop"
    @show="onShow"
  >
    <q-card class="tw-w-[360px] tw-max-w-full tw-rounded-3xl tw-overflow-hidden">
      <!-- Header -->
      <div class="ts-gradient tw-text-white tw-px-4 tw-py-3 tw-flex tw-items-center tw-gap-2">
        <q-icon name="qr_code_scanner" size="22px" />
        <div class="tw-font-bold">I-scan ang barcode</div>
        <q-space />
        <q-btn flat round dense icon="close" @click="close" />
      </div>

      <!-- Camera -->
      <div class="tw-relative tw-bg-black" style="min-height: 240px">
        <video
          ref="video"
          autoplay
          playsinline
          muted
          class="tw-w-full tw-block"
          style="max-height: 60vh; object-fit: cover"
        ></video>

        <!-- Aiming guide -->
        <div
          v-if="!starting && !errorMsg"
          class="tw-pointer-events-none tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center"
        >
          <div
            class="tw-border-2 tw-border-white/80 tw-rounded-xl"
            style="width: 72%; height: 90px; box-shadow: 0 0 0 9999px rgba(0,0,0,0.35)"
          ></div>
        </div>

        <div
          v-if="starting"
          class="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-text-white tw-text-sm"
        >
          <q-spinner size="26px" class="q-mr-sm" /> Binubuksan ang camera...
        </div>
      </div>

      <q-card-section class="tw-text-center tw-text-xs tw-py-3">
        <div v-if="errorMsg" class="tw-text-red-600">{{ errorMsg }}</div>
        <div v-else class="tw-text-slate-500">
          Itutok ang barcode sa loob ng kahon.
        </div>

        <!-- Manual fallback -->
        <div class="tw-mt-3 tw-flex tw-items-center tw-gap-2">
          <q-input
            v-model="manual"
            dense
            outlined
            class="tw-flex-1"
            placeholder="O i-type ang barcode"
            @keyup.enter="submitManual"
          />
          <q-btn
            unelevated
            dense
            color="primary"
            icon="check"
            :disable="!manual"
            @click="submitManual"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "BarcodeScanner",
  props: {
    modelValue: { type: Boolean, default: false },
  },
  emits: ["update:modelValue", "detected"],
  data() {
    return {
      starting: false,
      errorMsg: "",
      manual: "",
      reader: null,
      controls: null,
      scanning: false,
    };
  },
  beforeUnmount() {
    this.stop();
  },
  methods: {
    close() {
      this.$emit("update:modelValue", false);
    },
    // Tatawagin kapag KITA na talaga ang dialog (video element handa na).
    onShow() {
      this.start();
    },
    async start() {
      this.errorMsg = "";
      this.manual = "";
      this.starting = true;
      this.scanning = true;

      // Siguraduhing may camera API.
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.starting = false;
        this.errorMsg =
          "Walang camera sa device/browser na ito. I-type na lang ang barcode.";
        return;
      }

      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        this.reader = new BrowserMultiFormatReader();

        // Hintaying mai-render ang <video>.
        await this.$nextTick();
        const video = this.$refs.video;
        if (!video) {
          throw new Error("no-video-element");
        }

        // decodeFromVideoDevice: undefined = hayaan ang browser pumili
        // (default back camera sa mobile). Callback kada detection.
        this.controls = await this.reader.decodeFromVideoDevice(
          undefined,
          video,
          (result, err, controls) => {
            if (!this.controls && controls) this.controls = controls;
            if (result) {
              this.onDetected(result.getText());
            }
            // Ang 'err' kada frame kapag walang nakita ay normal — i-ignore.
          }
        );
        this.starting = false;
      } catch (e) {
        this.starting = false;
        const name = (e && e.name) || "";
        if (name === "NotAllowedError") {
          this.errorMsg =
            "Hindi pinahintulutan ang camera. Payagan ito sa browser settings.";
        } else if (name === "NotFoundError") {
          this.errorMsg = "Walang nahanap na camera sa device na ito.";
        } else {
          this.errorMsg =
            "Hindi mabuksan ang camera. I-type na lang ang barcode sa ibaba.";
        }
        // eslint-disable-next-line no-console
        console.error("Barcode scan error:", e);
      }
    },
    submitManual() {
      if (this.manual) this.onDetected(this.manual);
    },
    onDetected(value) {
      if (!value || !this.scanning) return;
      this.scanning = false;
      this.$emit("detected", String(value).trim());
      this.stop();
      this.close();
    },
    stop() {
      this.scanning = false;
      if (this.controls) {
        try {
          this.controls.stop();
        } catch (e) {
          /* noop */
        }
        this.controls = null;
      }
      this.reader = null;
      const video = this.$refs.video;
      if (video && video.srcObject) {
        video.srcObject.getTracks().forEach((t) => t.stop());
        video.srcObject = null;
      }
    },
  },
});
</script>
