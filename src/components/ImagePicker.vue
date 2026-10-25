<template>
  <div>
    <div class="row items-center q-gutter-md">
      <!-- Preview -->
      <div class="ts-img-preview" @click="triggerUpload">
        <img v-if="modelValue" :src="modelValue" alt="Litrato ng produkto" />
        <div v-else class="column items-center justify-center full-height ts-muted">
          <q-icon name="add_a_photo" size="26px" />
          <div class="text-caption q-mt-xs">Walang litrato</div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="column q-gutter-sm">
        <q-btn
          outline
          no-caps
          color="primary"
          icon="photo_camera"
          label="Kuhanan"
          size="sm"
          @click="openCamera"
        />
        <q-btn
          outline
          no-caps
          color="accent"
          icon="upload"
          label="Mag-upload"
          size="sm"
          @click="triggerUpload"
        />
        <q-btn
          v-if="modelValue"
          flat
          no-caps
          color="negative"
          icon="delete"
          label="Alisin"
          size="sm"
          @click="clear"
        />
      </div>
    </div>

    <!-- OCR status -->
    <div
      v-if="ocrBusy"
      class="tw-mt-3 tw-flex tw-items-center tw-gap-2 tw-rounded-xl tw-bg-indigo-50 tw-px-3 tw-py-2 tw-text-indigo-700 tw-text-xs"
    >
      <q-spinner-dots size="18px" />
      <span>Binabasa ang pangalan sa litrato... {{ ocrPct }}%</span>
    </div>
    <div
      v-else-if="ocrError"
      class="tw-mt-3 tw-flex tw-items-center tw-gap-2 tw-rounded-xl tw-bg-red-50 tw-px-3 tw-py-2 tw-text-red-600 tw-text-xs"
    >
      <q-icon name="error_outline" size="16px" />
      <span>{{ ocrError }}</span>
    </div>
    <div
      v-else-if="ocrDone"
      class="tw-mt-3 tw-flex tw-items-center tw-gap-2 tw-rounded-xl tw-bg-emerald-50 tw-px-3 tw-py-2 tw-text-emerald-700 tw-text-xs"
    >
      <q-icon name="auto_awesome" size="16px" />
      <span v-if="lastDetected">Nakita: “{{ lastDetected }}” — i-edit kung mali.</span>
      <span v-else>Walang malinaw na pangalan. I-type na lang o subukan muli nang mas malapit.</span>
    </div>

    <!-- Upload input lang (gallery / files) -->
    <input
      ref="uploadInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onFile"
    />
    <!-- Fallback: native camera capture kapag walang getUserMedia -->
    <input
      ref="captureInput"
      type="file"
      accept="image/*"
      capture="environment"
      class="hidden"
      @change="onFile"
    />

    <!-- In-app camera -->
    <q-dialog v-model="cameraOpen" @hide="stopCamera">
      <q-card class="tw-w-[340px] tw-max-w-full tw-rounded-3xl tw-overflow-hidden">
        <div class="tw-relative tw-bg-black">
          <video
            ref="video"
            autoplay
            playsinline
            muted
            class="tw-w-full tw-block"
            style="max-height: 70vh; object-fit: cover"
          ></video>
          <div
            v-if="starting"
            class="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-text-white"
          >
            <q-spinner size="28px" class="q-mr-sm" /> Binubuksan ang camera...
          </div>
        </div>
        <q-card-actions class="tw-justify-between tw-px-4 tw-py-3">
          <q-btn flat round icon="close" color="grey-7" v-close-popup />
          <q-btn
            round
            unelevated
            color="primary"
            icon="camera"
            size="lg"
            :disable="starting"
            @click="capturePhoto"
          />
          <q-btn
            flat
            round
            icon="cameraswitch"
            color="grey-7"
            @click="switchCamera"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { readProductName } from "src/lib/ocr";

export default defineComponent({
  name: "ImagePicker",
  props: {
    modelValue: {
      type: String,
      default: null,
    },
    // I-on/off ang OCR (hal. patayin sa edit kung ayaw na).
    ocr: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:modelValue", "detected-name"],
  data() {
    return {
      cameraOpen: false,
      starting: false,
      stream: null,
      facingMode: "environment",
      ocrBusy: false,
      ocrDone: false,
      ocrPct: 0,
      lastDetected: "",
      ocrError: "",
      ocrRawText: "",
    };
  },
  beforeUnmount() {
    this.stopCamera();
  },
  methods: {
    hasCameraApi() {
      return !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      );
    },
    async openCamera() {
      // Kapag walang live camera API, gamitin ang native capture input
      // (magbubukas ng camera app sa karamihang mobile).
      if (!this.hasCameraApi()) {
        this.$refs.captureInput.click();
        return;
      }
      this.cameraOpen = true;
      this.$nextTick(() => this.startCamera());
    },
    async startCamera() {
      this.starting = true;
      try {
        this.stopStream();
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: this.facingMode },
          audio: false,
        });
        const video = this.$refs.video;
        if (video) {
          video.srcObject = this.stream;
          await video.play().catch(() => {});
        }
      } catch (e) {
        // Walang permiso o walang camera: bumalik sa native capture.
        this.cameraOpen = false;
        this.$q.notify({
          message: "Hindi mabuksan ang camera. Gamitin ang upload o pahintulutan ang camera.",
          color: "negative",
        });
        this.$refs.captureInput.click();
      } finally {
        this.starting = false;
      }
    },
    switchCamera() {
      this.facingMode =
        this.facingMode === "environment" ? "user" : "environment";
      this.startCamera();
    },
    capturePhoto() {
      const video = this.$refs.video;
      if (!video || !video.videoWidth) return;

      const maxSize = 640;
      let w = video.videoWidth;
      let h = video.videoHeight;
      if (w > h && w > maxSize) {
        h = Math.round((h * maxSize) / w);
        w = maxSize;
      } else if (h > maxSize) {
        w = Math.round((w * maxSize) / h);
        h = maxSize;
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(video, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

      this.$emit("update:modelValue", dataUrl);
      this.cameraOpen = false;
      this.runOcr(dataUrl);
    },
    stopStream() {
      if (this.stream) {
        this.stream.getTracks().forEach((t) => t.stop());
        this.stream = null;
      }
    },
    stopCamera() {
      this.stopStream();
    },
    triggerUpload() {
      this.$refs.uploadInput.click();
    },
    clear() {
      this.$emit("update:modelValue", null);
    },
    onFile(e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = ""; // reset para pwede ulit ang parehong file
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        this.$q.notify({ message: "Litrato lang ang pwede.", color: "negative" });
        return;
      }

      this.resizeToDataUrl(file, 640)
        .then((dataUrl) => {
          this.$emit("update:modelValue", dataUrl);
          this.runOcr(dataUrl);
        })
        .catch(() => {
          this.$q.notify({
            message: "Hindi mabasa ang litrato.",
            color: "negative",
          });
        });
    },
    // Patakbuhin ang on-device OCR para hulaan ang pangalan ng produkto.
    async runOcr(dataUrl) {
      if (!this.ocr) return;
      this.ocrBusy = true;
      this.ocrDone = false;
      this.ocrPct = 0;
      this.lastDetected = "";
      this.ocrError = "";
      try {
        const { name, text } = await readProductName(dataUrl, (p) => {
          this.ocrPct = Math.round(p * 100);
        });
        this.lastDetected = name;
        // Panatilihin ang raw text para sa debugging/feedback.
        this.ocrRawText = (text || "").trim();
        if (name) this.$emit("detected-name", name);
      } catch (e) {
        // Ipakita ang tunay na dahilan sa halip na tahimik na pumalya.
        this.ocrError =
          (e && e.message) || "Hindi tumakbo ang OCR. Subukan ulit.";
        // eslint-disable-next-line no-console
        console.error("OCR error:", e);
      } finally {
        this.ocrBusy = false;
        this.ocrDone = true;
      }
    },
    // I-resize para hindi masyadong malaki ang base64 na itatago.
    resizeToDataUrl(file, maxSize) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            let { width, height } = img;
            if (width > height && width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            } else if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.8));
          };
          img.onerror = reject;
          img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
  },
});
</script>

<style scoped>
.ts-img-preview {
  width: 96px;
  height: 96px;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
}
.ts-img-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hidden {
  display: none;
}
</style>
