<template>
    <div>
        <text-input title="text.storeName" v-model="store.name" :disabled="true">
            <div class="change" @click="register">
                <span>{{$t('button.register')}}</span>
            </div>
        </text-input>
        <text-input title="text.address" v-model="store.address" @update="updateAddress"></text-input>
        <text-input title="text.city" v-model="store.city" @update="updateCity"></text-input>
        <text-input title="text.state" v-model="store.state" @update="updateState"></text-input>
        <text-input title="text.zipCode" v-model="store.zipCode" @update="updateZipCode"></text-input>
        <text-input title="text.contactInfo" v-model="store.contact" @update="updateContact"></text-input>
        <text-list title="text.timezone" v-model="store.timeZone" :opts="timeZones" @update="updateTimeZone"></text-list>
        <text-list title="text.storeType" v-model="store.type" :opts="types" @update="updateStoreType"></text-list>
        <external title="text.openHour" @open="editHour"></external>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import toggle from "../common/toggle";
import external from "../common/external";
import textList from "../common/textList";
import textInput from "../common/textInput";
import register from "./component/register";
export default {
  components: { toggle, external, textInput, textList, register },
  data() {
    return {
      componentData: null,
      component: null,
      store: null,
      types: [
        {
          label: "type.chineseTakeOut",
          tooltip: "",
          value: "chineseTakeOut"
        },
        {
          label: "type.chineseDineIn",
          tooltip: "",
          value: "chineseDineIn"
        },
        {
          label: "type.japaneseDineIn",
          tooltip: "",
          value: "japaneseDineIn"
        },
        {
          label: "type.thaiDineIn",
          tooltip: "",
          value: "thaiDineIn"
        },
        {
          label: "type.vietDineIn",
          tooltip: "",
          value: "vietDineIn"
        },
        {
          label: "type.retail",
          tooltip: "",
          value: "retail"
        },
        {
          label: "type.buffet",
          tooltip: "",
          value: "buffet"
        },
        {
          label: "type.fastFood",
          tooltip: "",
          value: "fastFood"
        }
      ],
      timeZones: [
        {
          label: "text.easternTime",
          tooltip: "GMT - 5",
          value: "EST"
        },
        {
          label: "text.centralTime",
          tooltip: "GMT - 6",
          value: "CST"
        },
        {
          label: "text.mountainTime",
          tooltip: "GMT - 7",
          value: "MST"
        },
        {
          label: "text.pacificTime",
          tooltip: "GMT - 8",
          value: "PST"
        }
      ]
    };
  },
  created() {
    this.store = Object.assign({}, this.$store.getters.config.store);
  },
  methods: {
    register() {
      this.$p("register");
    },
    editHour() {},
    update(data) {
      this.$socket.emit("[CONFIG] UPDATE", data);
    },
    updateAddress(value) {
      this.update({
        key: "store.address",
        value
      });
    },
    updateCity(value) {
      this.update({
        key: "store.city",
        value
      });
    },
    updateState(value) {
      this.update({
        key: "store.state",
        value
      });
    },
    updateZipCode(value) {
      this.update({
        key: "store.zipCode",
        value
      });
    },
    updateContact(value) {
      this.update({
        key: "store.contact",
        value
      });
    },
    updateTimeZone(value) {
      this.update({
        key: "store.timeZone",
        value
      });
    },
    updateStoreType(value) {
      this.update({
        key: "store.type",
        value
      });
    }
  }
};
</script>
