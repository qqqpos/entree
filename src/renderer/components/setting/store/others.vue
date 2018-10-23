<template>
  <div>
    <div class="tab-content">
      <header class="nav">
        <h3 class="title">{{$t('setting.title.other')}}</h3>
      </header>
      <external title="text.timecard" @open="$router.push({name:'Setting.store.timecard'})">
        <i class="fas fa-user-clock icon" slot="icon"></i>
      </external>
      <toggle title="setting.googleMatrix" true-tooltip="tip.matrixService" false-tooltip="tip.disableMatrix" v-model="store.matrix.enable" :conditionalTooltip="true" @update="updateMatrix">
        <transition name="dropdown">
          <div v-if="store.matrix.enable" class="opt">
            <switches title="setting.autoCorrectAddress" v-model="store.matrix.autoCorrect" @update="updateAutoCorrect"></switches>
            <switches title="setting.fuzzySearch" v-model="store.matrix.fuzzy" @update="updateFuzzy"></switches>
            <inputer title="text.coordinate" v-model="store.matrix.coordinate" @update="updateStoreCoordinate"></inputer>
            <inputer title="text.api" v-model="store.matrix.api" @update="updateAPI" v-show="operator.role === 'Developer'"></inputer>
          </div>
        </transition>
      </toggle>
      <toggle title="setting.emailService" tooltip="tip.emailService" v-model="store.email.enable" @update="updateEmail" :disabled="true">
        <transition name="dropdown">
          <div v-if="store.email.enable" class="opt">
            <inputer title="text.username" v-model="store.email.username" @update="updateUser"></inputer>
            <inputer title="text.password" v-model="store.email.password" @update="updatePassword" type="password"></inputer>
            <switches title="text.autoEmailPromotion" v-model="store.email.coupon" :disabled="true"></switches>
            <switches title="text.emailReceipt" v-model="store.email.receipt" :disabled="true"></switches>
            <switches title="text.autoEmailConfirmation" v-model="store.email.reservation" :disabled="true"></switches>
            <switches title="text.emailReport" v-model="store.email.report" :disabled="true"></switches>
          </div>
        </transition>
      </toggle>
      <toggle title="text.autoLogin" v-model="store.autoLogin" @update="updateAutoLogin" tooltip="tip.autoLogin"></toggle>
      <toggle title="setting.onlineOrder" v-model="store.onlineOrder" @update="updateOnlineOrder" :disabled="operator.role !== 'Developer'"></toggle>
      <toggle title="setting.inventoryControl" v-model="store.inventoryControl" @update="updateInventoryCtrl"></toggle>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

import toggle from "../common/toggle";
import inputer from "../common/inputer";
import switches from "../common/switches";
import external from "../common/external";

export default {
  components: { toggle, switches, inputer, external },
  data() {
    return {
      operator: this.$store.getters.op,
      store: JSON.parse(JSON.stringify(this.$store.getters.store))
    };
  },
  methods: {
    update(data) {
      this.$socket.emit("[CONFIG] UPDATE", data);
    },
    updateMatrix(value) {
      this.update({
        key: "store.matrix.enable",
        value
      });
    },
    updateAPI(value) {
      this.update({
        key: "store.matrix.api",
        value
      });
    },
    updateEmail(value) {
      this.update({
        key: "store.email.enable",
        value
      });
    },
    updateUser() {
      const value = this.store.email.username;
      this.update({
        key: "store.email.username",
        value
      });
    },
    updatePassword() {
      const value = this.store.email.password;
      this.update({
        key: "store.email.password",
        value
      });
    },
    updateAutoLogin(value) {
      this.update({
        key: "store.autoLogin",
        value
      });
    },
    updateStoreCoordinate(value) {
      this.update({
        key: "store.matrix.coordinate",
        value
      });
    },
    updateAutoCorrect(value) {
      this.update({
        key: "store.matrix.autoCorrect",
        value
      });
    },
    updateFuzzy(value) {
      this.update({
        key: "store.matrix.fuzzy",
        value
      });
    },
    updateOnlineOrder(value) {
      this.update({
        key: "store.onlineOrder",
        value
      });
    },
    updateInventoryCtrl(value) {
      this.update({
        key: "store.inventoryControl",
        value
      });
    },
    ...mapActions(["setMenu"])
  }
};
</script>