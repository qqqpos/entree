<template>
  <div class="field-entry f3">
    <h4>{{$t('text.address')}}</h4>
    <div class="wrap" id="address">
      <div class="extra">
        <span v-show="direction">{{direction}}</span>
        <span v-show="duration">{{duration}}</span>
        <span v-show="distance">{{distance}}</span>
      </div>
      <i class="fa fa-location-arrow icon" :class="{load:search}"></i>
      <input :value="value" @click="focus" @input="$emit('input',$event.target.value)">
    </div>
    <template v-if="dropdown === 'list'">
      <transition name="menu" appear>
      <ul class="preset" v-outer-click="close">
        <li v-for="(profile,index) in customer.profiles" @click="set(profile)" :key="index">
          <span class="direction">{{profile.direction}}</span>
          <h4>
            <span>{{profile.address}}</span>
            <span class="city" v-show="profile.city">{{profile.city}}</span>
          </h4>
          <span class="name">{{profile.name}}</span>
        </li>
      </ul>
      </transition>
    </template>
    <template v-else-if="dropdown === 'autoComplete'">
      <ul class="autoComplete">
        <li v-for="(address,index) in list" :key="index" @click="autoFill(address)">
          <span class="street">{{address.street}}</span>
          <span class="city">{{address.city}}</span>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  props: ["value", "direction", "duration", "distance"],
  computed: {
    ...mapGetters(["customer"])
  },
  created() {
    this.$bus.on("GOOGLE_ADDRESS_QUERY", this.setSearchStatus);
  },
  beforeDestroy() {
    this.$bus.off("GOOGLE_ADDRESS_QUERY", this.setSearchStatus);
  },
  data() {
    return {
      search: false,
      dropdown: null,
      dict: [],
      list: []
    };
  },
  methods: {
    setSearchStatus(boolean) {
      this.search = boolean;
    },
    focus() {
      this.$emit("focus", "address");

      if (
        !this.value &&
        Array.isArray(this.customer.profiles) &&
        this.customer.profiles.length
      )
        this.dropdown = "list";
    },
    close() {
      this.dropdown = null;
    },
    set(profile) {
      this.setCustomer(profile);
      this.close();
    },
    autoFill({ street, city }) {
      this.close();

      const house = this.value.split(" ")[0];
      const address = house + " " + street;

      this.setCustomer({ address, city });
      this.$emit("query");
    },
    autoComplete(n) {
      const street = n
        .replace(/ +/g, " ")
        .split(" ")
        .slice(1)
        .join(" ");
      if (!street) this.dict = [];
      if (this.dict.length) {
        const regEx = new RegExp("^" + street);
        this.list = this.dict
          .filter(
            address => regEx.test(address.street) && street !== address.street
          )
          .slice(0, 5);

        this.dropdown = "autoComplete";
        return;
      }

      street &&
        this.$socket.emit("[AUTOCOMPLETE] STREET", street, list => {
          const regEx = new RegExp("^" + street);
          this.dict = list;
          this.list = this.dict
            .filter(
              address => regEx.test(address.street) && street !== address.street
            )
            .slice(0, 5);
          this.dropdown = "autoComplete";
        });
    },
    ...mapActions(["setCustomer"])
  },
  watch: {
    value: "autoComplete"
  }
};
</script>

<style scoped>
.wrap {
  position: relative;
}

.load:before {
  font-size: 1.5em;
  position: absolute;
  z-index: 2;
  color: #2196f3;
  right: 5px;
  top: -3px;
  text-shadow: 0 1px 3px #9e9e9e;
}

.extra {
  position: absolute;
  bottom: 33px;
  right: 32px;
}

.extra > span {
  border: 2px solid #eee;
  border-bottom: none;
  padding: 2px 6px;
  border-radius: 4px 4px 0 0;
  color: #009688;
  font-weight: bold;
  background: #fff;
}

.street {
  font-weight: bold;
  color: #3c3c3c;
}

.city {
  font-weight: normal;
  color: #9e9e9e;
}

h4 {
  display: flex;
  flex-direction: column;
}

ul.preset li {
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
}

.direction {
  width: 40px;
  text-align: center;
  margin-right: 5px;
  font-weight: bold;
  color: #009688;
}

.name {
  flex: 1;
  text-align: right;
  color: rgb(137, 137, 137);
}
</style>