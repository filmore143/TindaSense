<template>
  <q-page class="ts-page q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6 text-weight-bold">{{ $t("utang.title") }}</div>
      <q-btn
        round
        color="primary"
        icon="person_add"
        size="sm"
        @click="openAddCustomer = true"
      />
    </div>

    <!-- Summary -->
    <div class="ts-stat ts-gradient-amber q-mb-md" style="padding: 18px">
      <q-icon class="ts-stat-icon" name="handshake" />
      <div class="ts-stat-label">{{ $t("utang.totalReceivables") }}</div>
      <div class="ts-stat-value text-h4 ts-peso">₱{{ fmt(totalReceivables) }}</div>
      <div class="text-caption q-mt-xs" style="opacity: 0.9">
        {{ $t("utang.debtorsCount", { n: debtorsCount }) }}
      </div>
    </div>

    <!-- Debtor list -->
    <div class="ts-section-title q-mb-sm">{{ $t("utang.customers") }}</div>

    <!-- Mascot empty-state: walang suki pa -->
    <div
      v-if="customerBalances.length === 0"
      class="column items-center q-mt-lg"
    >
      <TindaBuddy mood="wave" :message="$t('utang.emptyMsg')" />
      <q-btn
        unelevated
        no-caps
        color="primary"
        icon="person_add"
        :label="$t('utang.emptyBtn')"
        class="q-mt-md tw-rounded-xl tw-font-bold"
        @click="openAddCustomer = true"
      />
    </div>

    <q-card
      v-for="c in customerBalances"
      :key="c.id"
      flat
      class="ts-card q-mb-sm q-pa-md tw-cursor-pointer ts-animate-in"
      @click="openCustomer(c)"
    >
      <div class="row no-wrap items-center">
        <q-avatar
          size="42px"
          :color="c.balance > 0 ? 'amber-2' : 'green-2'"
          :text-color="c.balance > 0 ? 'orange-9' : 'green-9'"
          class="q-mr-md text-weight-bold"
        >
          {{ initials(c.name) }}
        </q-avatar>
        <div class="col">
          <div class="text-weight-bold">{{ c.name }}</div>
          <div class="ts-muted text-caption">
            <template v-if="c.lastDate">{{ $t("utang.lastMove") }}: {{ formatDate(c.lastDate) }}</template>
            <template v-else>{{ $t("utang.noTxn") }}</template>
          </div>
        </div>
        <div class="text-right">
          <div
            class="text-weight-bold ts-peso"
            :class="c.balance > 0 ? 'text-negative' : 'text-positive'"
          >
            ₱{{ fmt(c.balance) }}
          </div>
          <div class="text-caption ts-muted">
            {{ c.balance > 0 ? $t("utang.hasUtang") : $t("utang.paid") }}
          </div>
        </div>
      </div>
    </q-card>

    <!-- Add customer dialog -->
    <q-dialog v-model="openAddCustomer">
      <q-card class="ts-card" style="min-width: 300px">
        <q-card-section>
          <div class="text-weight-bold">{{ $t("utang.newCustomer") }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="newCustomerName"
            outlined
            dense
            :label="$t('utang.customerName')"
            autofocus
            @keyup.enter="confirmAddCustomer"
          >
            <template #prepend><q-icon name="person" /></template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            :label="$t('common.add')"
            :disable="!newCustomerName"
            @click="confirmAddCustomer"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Customer detail sheet -->
    <q-dialog v-model="detailOpen" position="bottom">
      <q-card
        v-if="activeCustomer"
        class="tw-w-full tw-rounded-t-3xl tw-overflow-hidden"
        style="max-width: 480px"
      >
        <!-- Header -->
        <div class="ts-gradient tw-text-white tw-px-5 tw-py-4">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div>
              <div class="tw-text-lg tw-font-bold">{{ activeCustomer.name }}</div>
              <div class="tw-text-xs tw-text-white/80">{{ $t("utang.balance") }}</div>
            </div>
            <div class="tw-text-2xl tw-font-bold ts-peso">
              ₱{{ fmt(activeCustomer.balance) }}
            </div>
          </div>
          <!-- Loyalty tier -->
          <div
            class="tw-mt-2 tw-inline-flex tw-items-center tw-gap-1 tw-rounded-full tw-bg-white/20 tw-px-3 tw-py-1 tw-text-xs tw-font-semibold"
          >
            <q-icon :name="stats.tier.icon" size="15px" />
            {{ $t("utang.tier." + stats.tier.name) }}
          </div>
        </div>

        <!-- Loyalty / history stats -->
        <div class="tw-grid tw-grid-cols-3 tw-gap-2 tw-px-5 tw-py-3">
          <div class="tw-text-center tw-rounded-xl tw-bg-slate-50 tw-py-2">
            <div class="tw-text-base tw-font-bold ts-peso">
              ₱{{ fmt(stats.totalUtang) }}
            </div>
            <div class="tw-text-[11px] tw-text-slate-500">{{ $t("utang.totalBought") }}</div>
          </div>
          <div class="tw-text-center tw-rounded-xl tw-bg-slate-50 tw-py-2">
            <div class="tw-text-base tw-font-bold">{{ stats.visits }}</div>
            <div class="tw-text-[11px] tw-text-slate-500">{{ $t("utang.timesBought") }}</div>
          </div>
          <div class="tw-text-center tw-rounded-xl tw-bg-slate-50 tw-py-2">
            <div class="tw-text-base tw-font-bold ts-peso">
              ₱{{ fmt(stats.avgPerVisit) }}
            </div>
            <div class="tw-text-[11px] tw-text-slate-500">{{ $t("utang.avgPer") }}</div>
          </div>
        </div>
        <div
          v-if="stats.firstDate"
          class="tw-px-5 tw--mt-1 tw-pb-1 tw-text-[11px] tw-text-slate-400 tw-text-center"
        >
          {{ $t("utang.sinceLast", { first: formatDate(stats.firstDate), last: formatDate(stats.lastDate) }) }}
        </div>

        <!-- Quick actions -->
        <div class="tw-flex tw-gap-2 tw-px-5 tw-py-3">
          <q-btn
            unelevated
            no-caps
            class="tw-flex-1 tw-rounded-xl tw-font-bold"
            color="negative"
            icon="add_shopping_cart"
            :label="$t('utang.addUtang')"
            @click="openEntry('utang')"
          />
          <q-btn
            unelevated
            no-caps
            class="tw-flex-1 tw-rounded-xl tw-font-bold"
            color="positive"
            icon="payments"
            :label="$t('utang.pay')"
            @click="openEntry('bayad')"
          />
        </div>

        <!-- Ledger -->
        <q-separator />
        <q-list style="max-height: 46vh; overflow-y: auto">
          <q-item-label header class="text-weight-bold">
            {{ $t("utang.list") }} ({{ activeCustomer.entries.length }})
          </q-item-label>
          <q-item v-for="e in activeCustomer.entries" :key="e.id">
            <q-item-section avatar>
              <q-avatar
                size="34px"
                :color="e.type === 'utang' ? 'red-1' : 'green-1'"
                :text-color="e.type === 'utang' ? 'negative' : 'positive'"
                :icon="e.type === 'utang' ? 'add_shopping_cart' : 'payments'"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                {{ e.type === "utang" ? $t("utang.entryUtang") : $t("utang.entryBayad") }}
                <span v-if="e.note" class="ts-muted">— {{ e.note }}</span>
                <q-badge
                  v-if="e.type === 'bayad' && e.method"
                  class="q-ml-xs"
                  :color="methodColor(e.method)"
                  :label="e.method"
                />
              </q-item-label>
              <q-item-label caption>
                <q-icon name="event" size="12px" />
                {{ formatDate(e.date) }}
                <template v-if="e.type === 'bayad' && e.method">
                  · {{ $t("utang.paidVia", { method: e.method }) }}
                </template>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row items-center no-wrap q-gutter-x-xs">
                <span
                  class="text-weight-bold"
                  :class="e.type === 'utang' ? 'text-negative' : 'text-positive'"
                >
                  {{ e.type === "utang" ? "+" : "−" }}₱{{ fmt(e.amount) }}
                </span>
                <q-btn
                  flat
                  round
                  dense
                  size="sm"
                  icon="delete_outline"
                  color="grey-6"
                  @click="removeEntry(e)"
                />
              </div>
            </q-item-section>
          </q-item>
          <q-item v-if="activeCustomer.entries.length === 0">
            <q-item-section class="ts-muted text-caption">
              {{ $t("utang.noList") }}
            </q-item-section>
          </q-item>
        </q-list>

        <q-separator />
        <div class="tw-px-5 tw-py-3">
          <q-btn
            flat
            no-caps
            color="negative"
            icon="person_remove"
            :label="$t('utang.removeCustomer')"
            size="sm"
            @click="removeCustomer"
          />
        </div>
      </q-card>
    </q-dialog>

    <!-- Add utang/bayad entry dialog -->
    <q-dialog v-model="entryOpen">
      <q-card class="ts-card" style="min-width: 320px">
        <q-card-section>
          <div class="text-weight-bold">
            {{ entryType === "utang" ? $t("utang.addEntry") : $t("utang.payEntry") }}
          </div>
          <div class="ts-muted text-caption">{{ activeCustomer?.name }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none q-gutter-y-sm">
          <q-input
            v-model.number="entryAmount"
            type="number"
            outlined
            dense
            :label="$t('rec.amount')"
            prefix="₱"
            autofocus
            min="1"
          />
          <q-input
            v-if="entryType === 'utang'"
            v-model="entryNote"
            outlined
            dense
            :label="$t('utang.whatBought')"
          />

          <!-- Petsa kung kailan kinuha / binayad -->
          <q-input
            v-model="entryDate"
            outlined
            dense
            :label="entryType === 'utang' ? $t('utang.dateTaken') : $t('utang.datePaid')"
          >
            <template #prepend><q-icon name="event" /></template>
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="entryDate" mask="YYYY-MM-DD" today-btn>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup :label="$t('common.ok')" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <!-- Mode of payment (para sa bayad lang) -->
          <div v-if="entryType === 'bayad'">
            <div class="ts-muted text-caption q-mb-xs">{{ $t("utang.payMethod") }}</div>
            <div class="row q-gutter-sm">
              <q-chip
                v-for="m in paymentMethods"
                :key="m.value"
                clickable
                class="ts-pay-chip"
                :class="{ 'ts-pay-chip--active': entryMethod === m.value }"
                :color="entryMethod === m.value ? 'positive' : undefined"
                :text-color="entryMethod === m.value ? 'white' : undefined"
                :icon="m.icon"
                @click="entryMethod = m.value"
              >
                {{ m.label }}
              </q-chip>
            </div>
            <!-- I-type kung ano ang "Iba pa" -->
            <q-input
              v-if="entryMethod === 'Iba pa'"
              v-model="customMethod"
              outlined
              dense
              class="q-mt-sm"
              :label="$t('utang.whatUsed')"
              autofocus
            >
              <template #prepend><q-icon name="edit" /></template>
            </q-input>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" v-close-popup />
          <q-btn
            unelevated
            :color="entryType === 'utang' ? 'negative' : 'positive'"
            :label="entryType === 'utang' ? $t('utang.doUtang') : $t('utang.doPay')"
            :disable="!entryAmount || entryAmount <= 0"
            @click="confirmEntry"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters, mapActions } from "vuex";
import TindaBuddy from "components/TindaBuddy.vue";

export default defineComponent({
  name: "UtangPage",
  components: { TindaBuddy },
  data() {
    return {
      openAddCustomer: false,
      newCustomerName: "",
      detailOpen: false,
      activeId: null,
      entryOpen: false,
      entryType: "utang",
      entryAmount: null,
      entryNote: "",
      entryDate: "",
      entryMethod: "Cash",
      customMethod: "",
    };
  },
  computed: {
    ...mapGetters("tindasense", [
      "customerBalances",
      "totalReceivables",
      "debtorsCount",
      "customerStats",
      "lang",
    ]),
    paymentMethods() {
      this.lang;
      return [
        { label: "Cash", value: "Cash", icon: "payments" },
        { label: "GCash", value: "GCash", icon: "account_balance_wallet" },
        { label: "Maya", value: "Maya", icon: "credit_card" },
        { label: "Maribank", value: "Maribank", icon: "account_balance" },
        { label: this.$t("utang.methodOther"), value: "Iba pa", icon: "more_horiz" },
      ];
    },
    // Laging sariwa mula sa getter (para mag-update pagkatapos ng galaw).
    activeCustomer() {
      if (this.activeId == null) return null;
      return this.customerBalances.find((c) => c.id === this.activeId) || null;
    },
    // History/loyalty stats ng kasalukuyang suki.
    stats() {
      if (this.activeId == null) {
        return {
          totalUtang: 0,
          totalBayad: 0,
          balance: 0,
          visits: 0,
          avgPerVisit: 0,
          firstDate: null,
          lastDate: null,
          tier: { name: "Bagong suki", icon: "person", color: "grey-6" },
        };
      }
      return this.customerStats(this.activeId);
    },
  },
  methods: {
    ...mapActions("tindasense", [
      "addCustomer",
      "addCredit",
      "deleteCredit",
      "deleteCustomer",
    ]),
    fmt(n) {
      return Number(n || 0).toLocaleString("en-PH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    },
    // Petsa na mas madaling basahin (hal. "Okt 19, 2026").
    formatDate(iso) {
      if (!iso) return "";
      const d = new Date(iso);
      if (isNaN(d)) return iso;
      return d.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    methodColor(method) {
      return (
        {
          Cash: "green-6",
          GCash: "blue-6",
          Maya: "teal-6",
          Maribank: "orange-7",
        }[method] || "grey-6"
      );
    },
    initials(name) {
      return (name || "?")
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    },
    confirmAddCustomer() {
      if (!this.newCustomerName) return;
      this.addCustomer(this.newCustomerName);
      this.$q.notify({ message: "Naidagdag ang suki.", icon: "check" });
      this.newCustomerName = "";
      this.openAddCustomer = false;
    },
    openCustomer(c) {
      this.activeId = c.id;
      this.detailOpen = true;
    },
    openEntry(type) {
      this.entryType = type;
      this.entryAmount = null;
      this.entryNote = "";
      this.entryMethod = "Cash";
      this.customMethod = "";
      this.entryDate = this.todayIso();
      this.entryOpen = true;
    },
    todayIso() {
      return new Date().toISOString().slice(0, 10);
    },
    confirmEntry() {
      if (!this.entryAmount || this.entryAmount <= 0) return;
      // Kung "Iba pa", gamitin ang tinype; kung blangko, "Iba pa" na lang.
      const method =
        this.entryMethod === "Iba pa"
          ? this.customMethod.trim() || "Iba pa"
          : this.entryMethod;
      this.addCredit({
        customerId: this.activeId,
        type: this.entryType,
        amount: this.entryAmount,
        note: this.entryNote,
        method,
        date: this.entryDate || this.todayIso(),
      });
      this.$q.notify({
        message:
          this.entryType === "utang"
            ? `Naidagdag na utang: ₱${this.entryAmount}`
            : `Nabayaran: ₱${this.entryAmount}`,
        icon: "check",
        color: this.entryType === "utang" ? "negative" : "positive",
      });
      this.entryOpen = false;
    },
    removeEntry(e) {
      this.$q
        .dialog({
          title: "Burahin?",
          message: `${e.type === "utang" ? "Utang" : "Bayad"} na ₱${e.amount}`,
          cancel: { label: "Kanselahin", flat: true },
          ok: { label: "Burahin", color: "negative", unelevated: true },
        })
        .onOk(() => this.deleteCredit(e.id));
    },
    removeCustomer() {
      const name = this.activeCustomer ? this.activeCustomer.name : "";
      this.$q
        .dialog({
          title: "Tanggalin ang suki?",
          message: `Mabubura si ${name} at lahat ng listahan niya.`,
          cancel: { label: "Kanselahin", flat: true },
          ok: { label: "Tanggalin", color: "negative", unelevated: true },
        })
        .onOk(() => {
          this.deleteCustomer(this.activeId);
          this.detailOpen = false;
          this.activeId = null;
        });
    },
  },
});
</script>
