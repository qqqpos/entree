<template>
  <transition name="pop">
    <div class="frame" v-show="this.$route.name === 'Dashboard'" @click="go">
      <i class="fa fa-3x fa-phone"></i>
      <div class="caller">
        <h3>{{customer.phone | tel}}</h3>
        <h5>{{customer.address}}
          <span class="city" v-show="customer.city">{{customer.city}}</span>
        </h5>
      </div>
      <div class="tags">
        <span class="tag" v-for="(tag,index) in customer.tags" :key="index">{{$t('tag.'+tag)}}</span>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapActions } from "vuex";
export default {
  props: ["init"],
  data() {
    return {
      customer: {}
    };
  },
  created() {
    this.customer = this.init.customer;
  },
  methods: {
    go() {
      this.setCustomer(this.customer);
      this.setTicket({ type: "DELIVERY" });
      this.$router.push({ name: "Information" });
      this.init.resolve();
    },
    ...mapActions(["setCustomer", "setTicket"])
  }
};
</script>

<style scoped>
.frame {
  min-width: 250px;
  max-width: 330px;
  position: fixed;
  top: 65px;
  left: 100px;
  background: #fafafa;
  color: #3c3c3c;
  font-size: initial;
  border-radius: 4px;
  display: flex;
  padding: 10px 15px;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

i {
  border-right: 1px solid #eee;
  padding-right: 15px;
  color: #03a9f4;
  text-shadow: 0 1px 1px #3f51b5;
}

.caller {
  flex: 1;
  margin-left: 15px;
}

h5 {
  color: rgba(0, 0, 0, 0.75);
  font-weight: normal;
}

.tags {
  position: absolute;
  display: flex;
  top: -20px;
  background: transparent;
  align-items: center;
  flex-wrap: wrap;
}

.tag {
  font-size: 14px;
  margin: 4px 0px 4px 4px;
  background: #ff9800;
  color: #fff;
  text-shadow: 0 1px 1px #333;
  padding: 3px 4px;
  border-radius: 2px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.6);
}
</style>