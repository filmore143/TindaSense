<template>
  <q-card class="tw-w-[340px] tw-max-w-full tw-rounded-3xl tw-overflow-hidden tw-shadow-xl">
    <!-- Branded header -->
    <div
      class="tw-relative tw-px-5 tw-pt-5 tw-pb-6 tw-text-white"
      :class="isEdit ? 'ts-gradient' : 'ts-gradient-amber'"
    >
      <div class="tw-flex tw-items-center tw-gap-3">
        <div
          class="tw-h-11 tw-w-11 tw-rounded-2xl tw-bg-white/20 tw-flex tw-items-center tw-justify-center tw-backdrop-blur"
        >
          <q-icon :name="isEdit ? 'edit' : 'add_business'" size="24px" />
        </div>
        <div>
          <div class="tw-text-lg tw-font-bold tw-leading-tight">
            {{ isEdit ? $t("form.editTitle") : $t("form.newTitle") }}
          </div>
          <div class="tw-text-xs tw-text-white/80">
            {{ isEdit ? model.name : $t("form.newSub") }}
          </div>
        </div>
      </div>
    </div>

    <!-- Image picker, naka-overlap sa header -->
    <div class="tw--mt-5 tw-px-5">
      <div
        class="tw-rounded-2xl tw-bg-white tw-shadow-md tw-p-3 tw-flex tw-justify-center"
      >
        <ImagePicker v-model="model.image" @detected-name="onDetectedName" />
      </div>
    </div>

    <q-card-section class="tw-px-5 tw-pt-4 tw-pb-2 tw-space-y-3">
      <!-- Pangalan -->
      <q-input
        v-model="model.name"
        outlined
        dense
        :label="$t('form.name')"
        class="tw-bg-white"
      >
        <template #prepend><q-icon name="shopping_basket" /></template>
        <template #append>
          <q-badge
            color="indigo-1"
            text-color="indigo-8"
            class="tw-gap-1"
          >
            <q-icon name="auto_awesome" size="12px" /> AI
          </q-badge>
        </template>
      </q-input>

      <!-- Suggestion chip kung may nabasa ang OCR na iba sa kasalukuyan -->
      <div
        v-if="suggestion && suggestion !== model.name"
        class="tw--mt-1 tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-slate-500"
      >
        <span>{{ $t("form.aiSuggest") }}</span>
        <q-chip
          dense
          clickable
          color="indigo-1"
          text-color="indigo-8"
          icon="auto_awesome"
          @click="applySuggestion"
        >
          {{ suggestion }}
        </q-chip>
      </div>

      <!-- Kategorya -->
      <q-select
        v-model="model.category"
        outlined
        dense
        use-input
        new-value-mode="add-unique"
        input-debounce="0"
        :options="categoryOptions"
        :label="$t('form.category')"
        :hint="$t('form.categoryHint')"
      >
        <template #prepend><q-icon name="category" /></template>
      </q-select>

      <!-- Puhunan at Presyo -->
      <div class="tw-grid tw-grid-cols-2 tw-gap-3">
        <q-input
          v-model.number="model.cost"
          type="number"
          outlined
          dense
          :label="$t('form.cost')"
          prefix="₱"
        >
          <template #prepend><q-icon name="payments" /></template>
        </q-input>
        <q-input
          v-model.number="model.price"
          type="number"
          outlined
          dense
          :label="$t('form.sell')"
          prefix="₱"
        >
          <template #prepend><q-icon name="sell" /></template>
        </q-input>
      </div>

      <!-- Live profit chip -->
      <div
        v-if="margin !== null"
        class="tw-flex tw-items-center tw-justify-between tw-rounded-xl tw-px-3 tw-py-2 tw-text-sm tw-font-semibold"
        :class="
          margin > 0
            ? 'tw-bg-emerald-50 tw-text-emerald-700'
            : 'tw-bg-red-50 tw-text-red-600'
        "
      >
        <span class="tw-flex tw-items-center tw-gap-1">
          <q-icon :name="margin > 0 ? 'trending_up' : 'trending_down'" size="18px" />
          {{ $t("form.profitPer") }}
        </span>
        <span>₱{{ margin.toFixed(2) }}</span>
      </div>

      <!-- Stock at Benta/araw -->
      <div class="tw-grid tw-grid-cols-2 tw-gap-3">
        <q-input
          v-model.number="model.stock"
          type="number"
          outlined
          dense
          :label="$t('form.stockNow')"
        >
          <template #prepend><q-icon name="inventory_2" /></template>
        </q-input>
        <q-input
          v-model.number="model.dailyAvgSold"
          type="number"
          outlined
          dense
          :label="$t('form.dailySold')"
        >
          <template #prepend><q-icon name="local_fire_department" /></template>
        </q-input>
      </div>

      <!-- Yunit -->
      <q-select
        v-model="model.unit"
        outlined
        dense
        use-input
        new-value-mode="add-unique"
        input-debounce="0"
        :options="unitOptions"
        :label="$t('form.unit')"
        :hint="$t('form.unitHint')"
      >
        <template #prepend><q-icon name="straighten" /></template>
      </q-select>

      <!-- Barcode -->
      <q-input
        v-model="model.barcode"
        outlined
        dense
        :label="$t('form.barcode')"
        :hint="$t('form.barcodeHint')"
      >
        <template #prepend><q-icon name="qr_code" /></template>
        <template #append>
          <q-btn
            flat
            round
            dense
            icon="qr_code_scanner"
            color="accent"
            @click="scannerOpen = true"
          />
        </template>
      </q-input>

      <!-- Expiry date -->
      <q-input
        v-model="model.expiry"
        outlined
        dense
        :label="$t('form.expiry')"
        :hint="$t('form.expiryHint')"
      >
        <template #prepend><q-icon name="event" /></template>
        <template #append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="model.expiry" mask="YYYY-MM-DD" today-btn>
                <div class="row items-center justify-end q-gutter-sm">
                  <q-btn
                    v-if="model.expiry"
                    flat
                    dense
                    color="negative"
                    :label="$t('common.remove')"
                    @click="model.expiry = null"
                    v-close-popup
                  />
                  <q-btn v-close-popup :label="$t('common.ok')" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </q-card-section>

    <BarcodeScanner v-model="scannerOpen" @detected="onBarcode" />

    <!-- Actions -->
    <q-card-actions class="tw-px-5 tw-pb-5 tw-pt-1 tw-gap-2">
      <q-btn
        flat
        no-caps
        class="tw-flex-1 tw-rounded-xl"
        color="grey-7"
        :label="$t('common.cancel')"
        v-close-popup
      />
      <q-btn
        unelevated
        no-caps
        class="tw-flex-1 tw-rounded-xl tw-font-bold"
        :color="isEdit ? 'primary' : 'secondary'"
        :label="isEdit ? $t('common.save') : $t('common.add')"
        :icon="isEdit ? 'save' : 'add'"
        :disable="!valid"
        @click="submit"
      />
    </q-card-actions>
  </q-card>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters } from "vuex";
import ImagePicker from "components/ImagePicker.vue";
import BarcodeScanner from "components/BarcodeScanner.vue";

export default defineComponent({
  name: "ProductForm",
  components: { ImagePicker, BarcodeScanner },
  props: {
    modelValue: { type: Object, required: true },
    isEdit: { type: Boolean, default: false },
    categoryOptions: {
      type: Array,
      default: () => [
        "Noodles",
        "Beverage",
        "Coffee",
        "Snacks",
        "Household",
        "Milk",
        "Bakery",
        "Tobacco",
      ],
    },
    unitOptions: {
      type: Array,
      default: () => ["pcs", "btl", "sachet", "pack", "stick", "loaf", "kg"],
    },
  },
  emits: ["update:modelValue", "submit"],
  data() {
    return {
      suggestion: "",
      scannerOpen: false,
    };
  },
  computed: {
    ...mapGetters("tindasense", ["lang"]),
    // Two-way bridge papunta sa parent form object.
    model: {
      get() {
        return this.modelValue;
      },
      set(v) {
        this.$emit("update:modelValue", v);
      },
    },
    margin() {
      const { price, cost } = this.model;
      if (price == null || cost == null || price === "" || cost === "")
        return null;
      return Number(price) - Number(cost);
    },
    valid() {
      return !!this.model.name && this.model.price != null && this.model.price !== "";
    },
  },
  methods: {
    onDetectedName(name) {
      this.suggestion = name;
      // Auto-fill lang kung wala pang pangalan ang user na nilagay,
      // para hindi mabura ang manu-manong na-type.
      if (!this.model.name || !this.model.name.trim()) {
        this.model = { ...this.model, name };
      }
    },
    applySuggestion() {
      this.model = { ...this.model, name: this.suggestion };
    },
    onBarcode(code) {
      this.model = { ...this.model, barcode: code };
    },
    submit() {
      if (this.valid) this.$emit("submit");
    },
  },
});
</script>
