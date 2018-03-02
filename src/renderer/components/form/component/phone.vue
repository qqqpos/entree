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
      <ul class="autoComplete">
        <li v-for="(profile,index) in list" :key="index" @click="set(profile)">
          <div class="f1">
            <h4>{{profile.phone | phone}}</h4>
            <p class="address">{{profile.address}}</p>
          </div>
          <span>{{profile.lastDate | fromNow}}</span>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  props: ["value"],
  data() {
    return {
      logs: [],
      list: [],
      dropdown: null
    };
  },
  computed: {
    ...mapGetters(["customer"])
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
      log.customer
        ? this.setCustomer(log.customer)
        : this.$emit("input", log.phone);

      this.dropdown = null;
    },
    set(profile) {
      this.setCustomer(profile);
      this.$emit("focus", "address");
      this.list = [];
      this.dropdown = null;
    },
    ...mapActions(["setCustomer"])
  },
  watch: {
    value(n) {
      const phone = n.replace(/\D/g, "");

      if (phone.length === 10) {
        this.$socket.emit("[CUSTOMER] FROM_PHONE", phone, profile => {
          if (profile) {
            this.setCustomer(profile);
            this.$emit("focus", "address");
            this.list = [];
            this.dropdown = null;
          }
        });
      } else if (phone.length > 3) {
        this.$socket.emit("[AUTOCOMPLETE] PHONE", phone, results => {
          this.list = results;
          this.dropdown = "autocomplete";
        });
      } else {
        this.dropdown = null;
        this.list = [];
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

.autoComplete li {
  display: flex;
  align-items: center;
}
</style>