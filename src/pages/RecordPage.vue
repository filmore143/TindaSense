<template>
  <q-page class="ts-page q-pa-md">
    <div class="text-h6 text-weight-bold q-mb-sm">{{ $t("rec.title") }}</div>

    <q-tabs
      v-model="tab"
      dense
      class="bg-white rounded-borders q-mb-md"
      active-color="primary"
      indicator-color="primary"
      no-caps
    >
      <q-tab name="sale" icon="sell" :label="$t('rec.tabSale')" />
      <q-tab name="expense" icon="receipt_long" :label="$t('rec.tabExpense')" />
    </q-tabs>

    <!-- BENTA -->
    <div v-if="tab === 'sale'">
      <q-card flat class="ts-card q-pa-md q-mb-md">
        <q-btn
          unelevated
          no-caps
          color="accent"
          icon="qr_code_scanner"
          :label="$t('rec.scanBarcode')"
          class="full-width q-mb-md tw-rounded-xl tw-font-bold"
          @click="scannerOpen = true"
        />

        <q-select
          v-model="saleProduct"
          :options="productOptions"
          :label="$t('rec.selectProduct')"
          outlined
          dense
          emit-value
          map-options
          class="q-mb-sm"
        />
        <div v-if="selectedProduct" class="ts-muted text-caption q-mb-sm">
          {{ $t("rec.price") }}: ₱{{ selectedProduct.price }} · {{ $t("rec.stock") }}:
          {{ selectedProduct.stock }} {{ selectedProduct.unit }}
        </div>
        <div class="row items-center q-gutter-sm">
          <q-input
            v-model.number="saleQty"
            type="number"
            outlined
            dense
            :label="$t('rec.qty')"
            min="1"
            class="col"
          />
          <q-btn
            unelevated
            color="primary"
            icon="add"
            :label="$t('rec.record')"
            :disable="!saleProduct || saleQty < 1"
            @click="submitSale"
          />
        </div>
        <div
          v-if="selectedProduct"
          class="q-mt-sm text-caption text-positive text-weight-bold"
        >
          {{ $t("rec.profitHere") }}: ₱{{ ((selectedProduct.price - selectedProduct.cost) * (saleQty || 0)).toFixed(2) }}
        </div>
      </q-card>
    </div>

    <!-- GASTOS -->
    <div v-else>
      <q-card flat class="ts-card q-pa-md q-mb-md">
        <q-input
          v-model="expenseLabel"
          outlined
          dense
          :label="$t('rec.expenseFor')"
          class="q-mb-sm"
        />
        <div class="row items-center q-gutter-sm">
          <q-input
            v-model.number="expenseAmount"
            type="number"
            outlined
            dense
            :label="$t('rec.amount') + ' ₱'"
            min="1"
            class="col"
          />
          <q-btn
            unelevated
            color="secondary"
            icon="add"
            :label="$t('rec.record')"
            :disable="!expenseLabel || !expenseAmount"
            @click="submitExpense"
          />
        </div>
      </q-card>
    </div>

    <!-- Today's log -->
    <div class="ts-section-title q-mb-sm">{{ $t("rec.today") }}</div>

    <q-card flat class="ts-card-flat q-mb-sm">
      <q-list separator>
        <q-item-label header class="text-weight-bold">
          {{ $t("rec.salesCount") }} ({{ salesToday.length }})
        </q-item-label>
        <q-item v-for="s in salesTodayView" :key="'s' + s.id">
          <q-item-section avatar>
            <q-avatar color="green-1" text-color="positive" icon="sell" size="34px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ s.name }}</q-item-label>
            <q-item-label caption>{{ s.qty }} x ₱{{ s.price }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row items-center no-wrap q-gutter-x-xs">
              <span class="text-positive text-weight-bold">
                +₱{{ (s.qty * s.price).toLocaleString() }}
              </span>
              <q-btn
                flat
                round
                dense
                size="sm"
                icon="delete_outline"
                color="grey-6"
                @click="askDeleteSale(s)"
              >
                <q-tooltip>{{ $t("rec.deleteSale") }}</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
        <q-item v-if="salesToday.length === 0">
          <q-item-section class="ts-muted text-caption">
            {{ $t("rec.noSales") }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <q-card flat class="ts-card-flat">
      <q-list separator>
        <q-item-label header class="text-weight-bold">
          {{ $t("rec.expenseCount") }} ({{ expensesToday.length }})
        </q-item-label>
        <q-item v-for="e in expensesToday" :key="'e' + e.id">
          <q-item-section avatar>
            <q-avatar color="red-1" text-color="negative" icon="receipt_long" size="34px" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ e.label }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row items-center no-wrap q-gutter-x-xs">
              <span class="text-negative text-weight-bold">
                -₱{{ e.amount.toLocaleString() }}
              </span>
              <q-btn
                flat
                round
                dense
                size="sm"
                icon="delete_outline"
                color="grey-6"
                @click="askDeleteExpense(e)"
              >
                <q-tooltip>{{ $t("rec.deleteExpense") }}</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
        <q-item v-if="expensesToday.length === 0">
          <q-item-section class="ts-muted text-caption">
            {{ $t("rec.noExpenses") }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- Barcode scanner -->
    <BarcodeScanner v-model="scannerOpen" @detected="onBarcode" />

    <!-- Assign barcode sa produkto (kapag di kilala) -->
    <q-dialog v-model="assignOpen">
      <q-card class="ts-card" style="min-width: 320px">
        <q-card-section>
          <div class="text-weight-bold">{{ $t("rec.newBarcode") }}</div>
          <div class="ts-muted text-caption">
            {{ $t("rec.assignWhich", { code: pendingBarcode }) }}
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-select
            v-model="assignProductId"
            :options="productOptions"
            :label="$t('rec.selectProduct')"
            outlined
            dense
            emit-value
            map-options
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            :label="$t('rec.assign')"
            :disable="!assignProductId"
            @click="confirmAssign"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters, mapActions } from "vuex";
import BarcodeScanner from "components/BarcodeScanner.vue";
import { playKaching, playClick, playWarning } from "src/lib/sound";

export default defineComponent({
  name: "RecordPage",
  components: { BarcodeScanner },
  data() {
    return {
      tab: "sale",
      saleProduct: null,
      saleQty: 1,
      expenseLabel: "",
      expenseAmount: null,
      scannerOpen: false,
      assignOpen: false,
      pendingBarcode: "",
      assignProductId: null,
    };
  },
  computed: {
    ...mapGetters("tindasense", [
      "products",
      "productById",
      "productByBarcode",
      "salesToday",
      "expensesToday",
      "stockStatus",
      "lang",
    ]),
    productOptions() {
      return this.products.map((p) => ({
        label: `${p.name} (₱${p.price})`,
        value: p.id,
      }));
    },
    selectedProduct() {
      return this.saleProduct ? this.productById(this.saleProduct) : null;
    },
    salesTodayView() {
      return this.salesToday.map((s) => {
        const p = this.productById(s.productId) || {};
        return { ...s, name: p.name || "—", price: p.price || 0 };
      });
    },
  },
  methods: {
    ...mapActions("tindasense", [
      "recordSale",
      "recordExpense",
      "deleteSale",
      "deleteExpense",
      "assignBarcode",
    ]),
    onBarcode(code) {
      const product = this.productByBarcode(code);
      if (product) {
        this.saleProduct = product.id;
        this.$q.notify({
          message: `Nahanap: ${product.name}`,
          icon: "qr_code_scanner",
          color: "positive",
        });
      } else {
        // Di kilalang barcode — itanong kung aling produkto.
        this.pendingBarcode = code;
        this.assignProductId = null;
        this.assignOpen = true;
      }
    },
    confirmAssign() {
      if (!this.assignProductId) return;
      this.assignBarcode({
        id: this.assignProductId,
        barcode: this.pendingBarcode,
      });
      this.saleProduct = this.assignProductId;
      const p = this.productById(this.assignProductId);
      this.$q.notify({
        message: `Na-assign ang barcode sa ${p ? p.name : "produkto"}.`,
        icon: "check",
        color: "accent",
      });
      this.assignOpen = false;
    },
    askDeleteSale(s) {
      this.$q
        .dialog({
          title: "Burahin ang benta?",
          message: `${s.name} — ${s.qty} x ₱${s.price}. Ibabalik ang stock.`,
          cancel: { label: "Kanselahin", flat: true },
          ok: { label: "Burahin", color: "negative", unelevated: true },
        })
        .onOk(() => {
          this.deleteSale(s.id);
          this.$q.notify({
            message: "Nabura ang benta.",
            icon: "delete",
            color: "negative",
          });
        });
    },
    askDeleteExpense(e) {
      this.$q
        .dialog({
          title: "Burahin ang gastos?",
          message: `${e.label} — ₱${e.amount}`,
          cancel: { label: "Kanselahin", flat: true },
          ok: { label: "Burahin", color: "negative", unelevated: true },
        })
        .onOk(() => {
          this.deleteExpense(e.id);
          this.$q.notify({
            message: "Nabura ang gastos.",
            icon: "delete",
            color: "negative",
          });
        });
    },
    submitSale() {
      const pid = this.saleProduct;
      const name = this.selectedProduct.name;
      this.recordSale({ productId: pid, qty: this.saleQty });
      playKaching();
      this.$q.notify({
        message: `Narecord: ${name} x${this.saleQty}`,
        icon: "check",
        color: "positive",
      });
      this.saleQty = 1;

      // Low-stock check: kung naging kritikal/ubos ang produkto pagkatapos ng benta.
      this.$nextTick(() => this.checkLowStock(pid, name));
    },
    checkLowStock(productId, name) {
      const st = this.stockStatus.find((p) => p.id === productId);
      if (!st) return;
      if (st.level === "out") {
        playWarning();
        this.$q.notify({
          message: `Ubos na ang ${name}! Mag-restock na.`,
          icon: "error",
          color: "negative",
          timeout: 4000,
        });
      } else if (st.level === "critical") {
        playWarning();
        this.$q.notify({
          message: `Kritikal na ang stock ng ${name} (${st.stock} ${st.unit} na lang).`,
          icon: "warning",
          color: "warning",
          timeout: 4000,
        });
      }
    },
    submitExpense() {
      this.recordExpense({
        label: this.expenseLabel,
        amount: this.expenseAmount,
      });
      playClick();
      this.$q.notify({
        message: `Gastos narecord: ₱${this.expenseAmount}`,
        icon: "check",
        color: "secondary",
      });
      this.expenseLabel = "";
      this.expenseAmount = null;
    },
  },
});
</script>
