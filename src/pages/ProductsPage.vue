<template>
  <q-page class="ts-page q-pa-md">
    <div class="row items-center justify-between q-mb-sm">
      <div class="text-h6 text-weight-bold">{{ $t("prod.title") }}</div>
      <div class="row items-center q-gutter-sm">
        <q-btn
          round
          color="primary"
          icon="add"
          size="sm"
          @click="openAdd = true"
        />
        <q-btn round flat dense icon="more_vert" size="sm">
          <q-menu>
            <q-list style="min-width: 180px">
              <q-item clickable v-close-popup @click="resetDialog = true">
                <q-item-section avatar>
                  <q-icon name="restart_alt" color="negative" />
                </q-item-section>
                <q-item-section>{{ $t("prod.reset") }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>

    <q-input
      v-model="search"
      dense
      outlined
      rounded
      :placeholder="$t('prod.search')"
      class="q-mb-md bg-white"
    >
      <template #prepend><q-icon name="search" /></template>
    </q-input>

    <!-- Filter chips -->
    <div class="q-mb-md">
      <q-chip
        v-for="f in filters"
        :key="f.value"
        clickable
        class="ts-pay-chip"
        :class="{ 'ts-pay-chip--active': activeFilter === f.value }"
        :color="activeFilter === f.value ? 'primary' : undefined"
        :text-color="activeFilter === f.value ? 'white' : undefined"
        @click="activeFilter = f.value"
      >
        {{ f.label }}
      </q-chip>
    </div>

    <q-card
      v-for="p in filteredProducts"
      :key="p.id"
      flat
      class="ts-card q-mb-sm q-pa-md ts-animate-in"
    >
      <div class="row no-wrap items-center">
        <q-avatar
          rounded
          size="54px"
          class="q-mr-md ts-thumb"
          :color="p.image ? undefined : 'grey-3'"
        >
          <img v-if="p.image" :src="p.image" alt="" />
          <q-icon v-else name="inventory_2" color="grey-6" size="26px" />
        </q-avatar>
        <div class="col">
          <div class="row items-center q-gutter-x-xs">
            <span class="text-weight-bold">{{ p.name }}</span>
            <q-badge
              :color="levelColor(p.level)"
              :label="levelLabel(p.level)"
              class="ts-pill"
            />
            <q-badge
              v-if="p.expiryLevel === 'expired'"
              color="negative"
              label="Expired"
              class="ts-pill"
            />
            <q-badge
              v-else-if="p.expiryLevel === 'soon'"
              color="orange-8"
              :label="`Exp ${p.expiryDays}d`"
              class="ts-pill"
            />
          </div>
          <div class="ts-muted text-caption">{{ p.category }}</div>

          <div class="row q-gutter-x-md q-mt-xs text-caption">
            <div>
              {{ $t("prod.cost") }} <b class="ts-peso">₱{{ p.cost }}</b>
            </div>
            <div>
              {{ $t("prod.price") }} <b class="ts-peso">₱{{ p.price }}</b>
            </div>
            <div :class="p.margin > 0 ? 'text-positive' : 'text-negative'">
              {{ $t("prod.profit") }} <b class="ts-peso">₱{{ p.margin.toFixed(2) }}</b>
            </div>
          </div>

          <!-- Stock bar -->
          <div class="row items-center q-gutter-x-sm q-mt-sm">
            <q-linear-progress
              :value="stockRatio(p)"
              :color="levelColor(p.level)"
              track-color="grey-3"
              rounded
              size="8px"
              class="col"
            />
            <div class="text-caption ts-muted" style="min-width: 118px">
              {{ p.stock }} {{ p.unit }} ·
              <template v-if="p.level === 'out'">{{ $t("prod.outNow") }}</template>
              <template v-else>~{{ p.daysLeft }} {{ $t("prod.daysLeft") }}</template>
            </div>
          </div>
        </div>

        <div class="column q-ml-sm">
          <q-btn
            flat
            round
            dense
            icon="add_box"
            color="primary"
            @click="openRestock(p)"
          >
            <q-tooltip>Mag-restock</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="edit"
            color="accent"
            @click="openEdit(p)"
          >
            <q-tooltip>I-edit</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="delete_outline"
            color="negative"
            @click="openDelete(p)"
          >
            <q-tooltip>Tanggalin</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card>

    <!-- Mascot empty-state: walang produkto pa -->
    <div
      v-if="products.length === 0"
      class="column items-center q-mt-lg"
    >
      <TindaBuddy mood="wave" :message="$t('prod.emptyMsg')" />
      <q-btn
        unelevated
        no-caps
        color="primary"
        icon="add"
        :label="$t('prod.emptyBtn')"
        class="q-mt-md tw-rounded-xl tw-font-bold"
        @click="openAdd = true"
      />
    </div>

    <!-- Walang tumugma sa filter/search -->
    <div
      v-else-if="filteredProducts.length === 0"
      class="text-center ts-muted q-mt-xl"
    >
      <q-icon name="inventory_2" size="40px" />
      <div class="q-mt-sm">{{ $t("prod.noMatch") }}</div>
    </div>

    <!-- Restock dialog -->
    <q-dialog v-model="restockDialog">
      <q-card class="ts-card" style="min-width: 300px">
        <q-card-section>
          <div class="text-weight-bold">{{ $t("prod.restock") }}</div>
          <div class="ts-muted text-caption">{{ active?.name }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model.number="restockQty"
            type="number"
            outlined
            dense
            :label="$t('prod.restockQty')"
            autofocus
            min="1"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            :label="$t('common.save')"
            @click="confirmRestock"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete confirm dialog -->
    <q-dialog v-model="deleteDialog">
      <q-card class="ts-card" style="min-width: 300px">
        <q-card-section class="row items-center no-wrap">
          <q-avatar color="red-1" text-color="negative" icon="warning" />
          <div class="q-ml-md">
            <div class="text-weight-bold">{{ $t("prod.deleteTitle") }}</div>
            <div class="ts-muted text-caption">
              {{ $t("prod.deleteMsg", { name: active?.name }) }}
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" v-close-popup />
          <q-btn
            unelevated
            color="negative"
            :label="$t('common.delete')"
            @click="confirmDelete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Reset demo dialog -->
    <q-dialog v-model="resetDialog">
      <q-card class="ts-card" style="min-width: 300px">
        <q-card-section class="row items-center no-wrap">
          <q-avatar color="red-1" text-color="negative" icon="restart_alt" />
          <div class="q-ml-md">
            <div class="text-weight-bold">{{ $t("prod.resetTitle") }}</div>
            <div class="ts-muted text-caption">
              {{ $t("prod.resetMsg") }}
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" v-close-popup />
          <q-btn
            unelevated
            color="negative"
            :label="$t('common.remove')"
            @click="confirmReset"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit product dialog -->
    <q-dialog v-model="editDialog">
      <ProductForm
        v-model="editForm"
        is-edit
        @submit="confirmEdit"
      />
    </q-dialog>

    <!-- Add product dialog -->
    <q-dialog v-model="openAdd">
      <ProductForm v-model="form" @submit="confirmAdd" />
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters, mapActions } from "vuex";
import ProductForm from "components/ProductForm.vue";
import TindaBuddy from "components/TindaBuddy.vue";
import { playSuccess } from "src/lib/sound";

const emptyForm = () => ({
  name: "",
  category: "",
  cost: null,
  price: null,
  stock: 0,
  dailyAvgSold: 1,
  unit: "pcs",
  image: null,
  barcode: null,
  expiry: null,
});

export default defineComponent({
  name: "ProductsPage",
  components: { ProductForm, TindaBuddy },
  data() {
    return {
      search: "",
      activeFilter: "all",
      restockDialog: false,
      restockQty: 1,
      deleteDialog: false,
      resetDialog: false,
      editDialog: false,
      editForm: emptyForm(),
      active: null,
      openAdd: false,
      form: emptyForm(),
    };
  },
  computed: {
    ...mapGetters("tindasense", ["stockStatus", "products", "lang"]),
    filters() {
      this.lang;
      return [
        { label: this.$t("prod.filterAll"), value: "all" },
        { label: this.$t("prod.filterLow"), value: "low" },
        { label: this.$t("prod.filterEarning"), value: "earning" },
        { label: this.$t("prod.filterLosing"), value: "losing" },
      ];
    },
    filteredProducts() {
      const q = this.search.trim().toLowerCase();
      return this.stockStatus.filter((p) => {
        if (q && !p.name.toLowerCase().includes(q)) return false;
        if (this.activeFilter === "low")
          return ["low", "critical", "out"].includes(p.level);
        if (this.activeFilter === "earning") return p.margin > 0;
        if (this.activeFilter === "losing") return p.margin <= 0;
        return true;
      });
    },
  },
  methods: {
    ...mapActions("tindasense", [
      "restock",
      "addProduct",
      "deleteProduct",
      "updateProduct",
      "resetDemo",
    ]),
    confirmReset() {
      this.resetDemo();
      this.$q.notify({
        message: "Naibalik sa demo data.",
        icon: "restart_alt",
      });
      this.resetDialog = false;
    },
    levelColor(level) {
      return {
        out: "negative",
        critical: "negative",
        low: "warning",
        ok: "positive",
      }[level];
    },
    levelLabel(level) {
      return {
        out: this.$t("prod.lvlOut"),
        critical: this.$t("prod.lvlCritical"),
        low: this.$t("prod.lvlLow"),
        ok: this.$t("prod.lvlOk"),
      }[level];
    },
    stockRatio(p) {
      // Relative sa 7 araw na supply para visual lang.
      const target = (p.dailyAvgSold || 1) * 7;
      return Math.min(1, p.stock / target);
    },
    openRestock(p) {
      this.active = p;
      this.restockQty = Math.max(1, Math.round((p.dailyAvgSold || 1) * 7));
      this.restockDialog = true;
    },
    confirmRestock() {
      if (this.active && this.restockQty > 0) {
        this.restock({ id: this.active.id, qty: this.restockQty });
        this.$q.notify({
          message: `Nadagdagan ang ${this.active.name} ng ${this.restockQty}`,
          icon: "check",
        });
      }
      this.restockDialog = false;
    },
    openEdit(p) {
      this.active = p;
      // Kopya lang ng mga nae-edit na field (hindi ang computed na level/daysLeft).
      this.editForm = {
        id: p.id,
        name: p.name,
        category: p.category,
        cost: p.cost,
        price: p.price,
        stock: p.stock,
        dailyAvgSold: p.dailyAvgSold,
        unit: p.unit,
        image: p.image || null,
        barcode: p.barcode || null,
        expiry: p.expiry || null,
      };
      this.editDialog = true;
    },
    confirmEdit() {
      const { id, ...changes } = this.editForm;
      this.updateProduct({
        id,
        changes: {
          name: changes.name,
          category: changes.category,
          cost: Number(changes.cost),
          price: Number(changes.price),
          stock: Number(changes.stock),
          dailyAvgSold: Number(changes.dailyAvgSold),
          unit: changes.unit,
          image: changes.image,
          barcode: changes.barcode || null,
          expiry: changes.expiry || null,
        },
      });
      this.$q.notify({
        message: `Na-update: ${changes.name}`,
        icon: "check",
        color: "accent",
      });
      this.editDialog = false;
    },
    openDelete(p) {
      this.active = p;
      this.deleteDialog = true;
    },
    confirmDelete() {
      if (this.active) {
        const name = this.active.name;
        this.deleteProduct(this.active.id);
        this.$q.notify({
          message: `Natanggal: ${name}`,
          icon: "delete",
          color: "negative",
        });
      }
      this.deleteDialog = false;
    },
    confirmAdd() {
      this.addProduct({ ...this.form });
      playSuccess();
      this.$q.notify({ message: `Naidagdag: ${this.form.name}`, icon: "check" });
      this.form = emptyForm();
      this.openAdd = false;
    },
  },
});
</script>
