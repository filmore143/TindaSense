<template>
  <div class="ts-lock ts-gradient">
    <div class="ts-lock-inner">
      <q-icon name="lock" size="42px" color="white" />
      <div class="tw-text-white tw-text-xl tw-font-bold tw-mt-2">
        {{ storeName }}
      </div>
      <div class="tw-text-white/80 tw-text-sm tw-mb-5">
        Ilagay ang PIN para magbukas
      </div>

      <!-- PIN dots -->
      <div class="tw-flex tw-gap-3 tw-mb-6" :class="{ 'ts-shake': error }">
        <div
          v-for="i in 4"
          :key="i"
          class="ts-dot"
          :class="{ 'ts-dot--filled': entered.length >= i }"
        ></div>
      </div>

      <!-- Keypad -->
      <div class="ts-keypad">
        <button
          v-for="n in keys"
          :key="n.val + (n.action || '')"
          class="ts-key"
          :class="{ 'ts-key--action': n.action }"
          @click="press(n)"
        >
          <q-icon v-if="n.icon" :name="n.icon" size="22px" />
          <span v-else>{{ n.val }}</span>
        </button>
      </div>

      <div v-if="error" class="tw-text-white tw-text-sm tw-mt-4">
        Mali ang PIN. Subukan ulit.
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { mapGetters, mapActions } from "vuex";

export default defineComponent({
  name: "LockScreen",
  data() {
    return {
      entered: "",
      error: false,
      keys: [
        { val: "1" },
        { val: "2" },
        { val: "3" },
        { val: "4" },
        { val: "5" },
        { val: "6" },
        { val: "7" },
        { val: "8" },
        { val: "9" },
        { val: "", action: "blank" },
        { val: "0" },
        { val: "", action: "del", icon: "backspace" },
      ],
    };
  },
  computed: {
    ...mapGetters("tindasense", ["storeName", "checkPin"]),
  },
  methods: {
    ...mapActions("tindasense", ["unlock"]),
    press(n) {
      if (n.action === "blank") return;
      if (n.action === "del") {
        this.entered = this.entered.slice(0, -1);
        return;
      }
      if (this.entered.length >= 4) return;
      this.entered += n.val;
      if (this.entered.length === 4) this.submit();
    },
    submit() {
      if (this.checkPin(this.entered)) {
        this.unlock();
      } else {
        this.error = true;
        setTimeout(() => {
          this.entered = "";
          this.error = false;
        }, 700);
      }
    },
  },
});
</script>

<style scoped>
.ts-lock {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ts-lock-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
}
.ts-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.7);
  transition: background 0.15s ease, transform 0.15s ease;
}
.ts-dot--filled {
  background: #ffffff;
  transform: scale(1.1);
}
.ts-keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.ts-key {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  font-size: 26px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, transform 0.1s ease;
}
.ts-key:active {
  background: rgba(255, 255, 255, 0.34);
  transform: scale(0.92);
}
.ts-key--action {
  background: transparent;
}
.ts-shake {
  animation: ts-shake 0.4s;
}
@keyframes ts-shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}
</style>
