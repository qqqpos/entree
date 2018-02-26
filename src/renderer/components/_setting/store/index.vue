<template>
    <div>
        <section class="card">
            <header>{{$t('setting.storeInfo')}}</header>
            <article>
                <smart-input v-model="store.name" label="text.storeName" reg="^[a-zA-Z0-9_. ]{5,30}$" :disable="true"></smart-input>
                <smart-input v-model="store.address" label="text.address" reg="^\d+\s[A-z]+\s[A-z]+"></smart-input>
                <smart-input v-model="store.city" label="text.city" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
                <smart-input v-model="store.state" label="text.state" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
                <smart-input v-model="store.zipCode" label="text.zipCode" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
                <smart-input v-model="store.contact" label="text.contactInfo" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
                <smart-option v-model="store.type" :options="storeTypes" label="text.storeType"></smart-option>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.delivery')}}
                <span class="tip"></span>
            </header>
            <article>
                <smart-switch v-model="store.delivery" label="text.delivery"></smart-switch>
                <smart-input v-model.number="store.deliveryCharge" label="text.deliveryFee" :disable="!store.delivery"></smart-input>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.googleMatrix')}}
                <span class="tip">{{$t('setting.googleMatrixTip')}}</span>
            </header>
            <article>
                <smart-switch v-model="store.calcDistance" label="text.enable"></smart-switch>
                <smart-input v-model="store.mapAPI" label="text.api" :disable="!store.calcDistance"></smart-input>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.employee')}}
                <span class="tip"></span>
            </header>
            <article>
                <smart-switch v-model="store.timeCard" label="text.timeCard"></smart-switch>
                <smart-switch v-model="store.timeCardReport" label="text.timeCardReport"></smart-switch>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.email')}}
                <span class="tip">{{$t('setting.emailTip')}}</span>
            </header>
            <article>
                <smart-input v-model="store.email" reg="^[a-zA-Z0-9.-_]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$" label="text.email"></smart-input>
                <smart-input v-model="store.emailPassword" label="text.password"></smart-input>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.timeZone')}}
                <span class="tip"></span>
            </header>
            <article>
                <smart-option v-model="store.timeZone" :options="timezones" label="text.area"></smart-option>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.reward')}}</header>
            <article>
                <smart-switch v-model="store.reward" label="text.enable"></smart-switch>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.settledReceipt')}}
                <span class="tip"></span>
            </header>
            <article>
                <smart-switch v-model="store.noReceipt" label="text.noReceipt" tip="tip.doNotAskReceiptAfterSettle"></smart-switch>
            </article>
        </section>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import smartInput from "../common/smartInput";
import smartSwitch from "../common/smartSwitch";
import smartOption from "../common/smartOption";
export default {
  components: { smartInput, smartSwitch, smartOption },
  created() {
    this.store = Object.assign({}, this.config.store);
  },
  data() {
    return {
      store: null,
      change: false,
      timezones: [
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Phoenix",
        "America/Los_Angeles",
        "America/Anchorage",
        "America/Adak",
        "Pacific/Honolulu"
      ],
      storeTypes: [
        { label: this.$t("type.chineseTakeOut"), value: "chineseTakeOut" },
        { label: this.$t("type.chineseDineIn"), value: "chineseDineIn" },
        { label: this.$t("type.japaneseDineIn"), value: "japaneseDineIn" },
        { label: this.$t("type.thaiDineIn"), value: "thaiDineIn" },
        { label: this.$t("type.vietDineIn"), value: "vietDineIn" },
        { label: this.$t("type.buffet"), value: "buffet" },
        { label: this.$t("type.retail"), value: "retail" }
      ]
    };
  },
  computed: {
    ...mapGetters(["config"])
  },
  watch: {
    store: {
      handler(n) {
        let keys = Object.keys(n);
        let isChanged = keys.some(key => {
          return typeof n[key] === "string"
            ? n[key] !== this.config.store[key]
            : JSON.stringify(n[key]) !== JSON.stringify(this.config.store[key]);
        });
        isChanged ? this.$emit("change", n) : this.$emit("unchanged");
      },
      deep: true
    }
  }
};
</script>