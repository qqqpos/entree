<template>
  <dialog open class="flex-center" @click.self="back">
    <div class="frame-common">
      <header>
        <h3>{{$t('title.split')}}</h3>
        <h5>Please select one ticket to edit</h5>
      </header>
      <div class="wrap">
        <div class="row flex-center flex-wrap" v-if="splits.length">
          <ticket v-for="(invoice,index) in splits" :key="index" :invoice="invoice"></ticket>
        </div>
        <div class="placeholder" v-else>
          <i class="far fa-smile"></i>
          <p>{{$t('coupon.tip.noCoupon')}}</p>
        </div>
      </div>
      <footer>
        <button class="btn" @click="confirm" :disabled="!selected">{{$t('button.confirm')}}</button>
      </footer>
    </div>
  </dialog>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ticket from "../../history/component/ticket";

export default {
  props: ["init"],
  components: { ticket },
  data() {
    return {
      splits: this.init.splits,
      selected: false
    };
  },
  methods: {
    confirm() {
      this.setApp({ newTicket: false });
      this.setTicket({ type: "DINE_IN", number: this.order.number });
      this.$router.push({ path: "/main/menu" });
    },
    update(number) {
      this.selected = true;

      this.$nextTick(() => {
        let dom = document.querySelector(".ticket.active");
        dom && dom.classList.remove("active");
        dom = document.querySelectorAll(".ticket");

        for (let i = 0; i < dom.length; i++) {
          if (dom[i].dataset.number == number) {
            dom[i] && dom[i].classList.add("active");
            break;
          }
        }
      });
    },
    back() {
      this.setOrder(this.init.parent);
      this.init.reject(false);
    },
    ...mapActions(["setApp", "setOrder", "setTicket"])
  },
  watch: {
    "order.number": "update"
  },
  computed: {
    ...mapGetters(["order"])
  }
};
</script>

<style scoped>
.wrap {
  width: 700px;
  height: 315px;
  padding: 15px;
}

.row > div {
  margin: 5px;
  width: 120px;
  height: 95px;
}
</style>