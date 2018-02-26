<template>
  <div>
    <toggle title="text.timecard" tooltip="tip.timecard" v-model="store.timecard" @update="updateTimecard"></toggle>
        <toggle title="text.tipReport" tooltip="tip.tipReport" v-model="store.tipReport" @update="updateTipReport" :disabled="!store.timecard"></toggle>
    <toggle title="setting.googleMatrix" true-tooltip="tip.matrixService" false-tooltip="tip.disableMatrix" v-model="store.matrix.enable" :conditionalTooltip="true" @update="updateMatrix">
      <transition name="dropdown">
        <div v-if="store.matrix.enable" class="opt">
          <switches title="text.autoCorrectAddress" v-model="store.matrix.autoCorrect"></switches>
          <inputer title="text.coordinate" v-model="store.matrix.coordinate" @update="updateStoreCoordinate"></inputer>
          <inputer title="text.api" v-model="store.matrix.api" @blur="updateAPI"></inputer>
        </div>
      </transition>
    </toggle>
    <toggle title="setting.emailService" tooltip="tip.emailService" v-model="store.email.enable" @update="updateEmail">
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
    <toggle title="text.menuID" v-model="display.menuID" @update="updateMenuID"></toggle>
    <toggle title="text.favoriteItem" v-model="display.favorite" @update="updateFavorite"></toggle>
    <toggle title="text.alphabetical" tooltip="tip.alphabetical" v-model="display.alphabetical" @update="updateAlphabetical"></toggle>
  </div>
</template>

<script>
import toggle from "../common/toggle";
import inputer from "../common/inputer";
import switches from "../common/switches";
export default {
  components: { toggle, switches, inputer },
  data() {
    return {
      store: JSON.parse(JSON.stringify(this.$store.getters.store)),
      display: JSON.parse(JSON.stringify(this.$store.getters.config.display))
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
    updateAPI() {
      let value = this.store.matrix.api;
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
      let value = this.store.email.username;
      this.update({
        key: "store.email.username",
        value
      });
    },
    updatePassword() {
      let value = this.store.email.password;
      this.update({
        key: "store.email.password",
        value
      });
    },
    updateMenuID(value) {
      this.update({
        key: "display.menuID",
        value
      });
    },
    updateFavorite(value) {
      this.update({
        key: "display.favorite",
        value
      });
    },
    updateTemplate(value) {
      this.update({
        key: "display.autoTemplate",
        value
      });
    },
    updateAlphabetical(value) {
      this.update({
        key: "display.alphabetical",
        value
      });
    },
    updateStoreCoordinate(value) {
      this.update({
        key: "store.matrix.coordinate",
        value
      });
    },
    updateTimecard(value) {
      this.update({
        key: "store.timecard",
        value
      });
    },
    updateTipReport(value) {
      this.update({
        key: "store.tipReport",
        value
      });
    }
  }
};
</script>