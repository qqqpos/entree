<template>
  <div class="field-entry f1">
    <h4>{{$t('text.phone')}}</h4>
    <div class="wrap" id="phone">
      <i class="fa fa-phone icon"></i>
      <input type="text" :value="value" @click="focus" @input="$emit('input',$event.target.value)">
    </div>
    <template v-if="dropdown === 'list'">
      <transition name="menu" appear>
      <ul class="preset" v-outer-click="close">
        <li v-for="(log,index) in logs" :class="{new:log.new}" @click="get(log)" :key="index">
          <h4>{{log.phone | phone}}
            <span class="time">{{log.time | fromNow(true)}}</span>
          </h4>
          <div class="address" v-if="log.customer">
            <span>{{log.customer.address}}</span>
          </div>
        </li>
      </ul>
      </transition>
    </template>
    <template v-else>

    </template>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  props: ["value"],
  data() {
    return {
      logs: [],
      dropdown: null
    };
  },
  created() {
    this.$socket.emit("[CALL] LAST", logs => {
      this.logs = logs;
    });
  },
  methods: {
    focus() {
      this.$emit("focus", "phone");

      if (!this.value) this.dropdown = "list";
    },
    close() {
      this.dropdown = null;
    },
    get(log) {
      if (log.customer) {
        this.setCustomer(log.customer);
        this.dropdown = null;
      } else {
      }
    },
    ...mapActions(["setCustomer"])
  },
  watch: {
    value(n) {
      const phone = n.replace(/\D/g, "");

      if (phone.length === 10) {
        this.$socket.emit("[CUSTOMER] FROM_PHONE", phone, profile => {
          console.log(profile);
          this.setCustomer(profile);
          this.$emit("focus", "address");
        });
      }
    }
  }
};
</script>

<style scoped>
.address {
  color: #a23900;
}
.time {
  float: right;
  color: rgba(0, 0, 0, 0.5);
}
</style>