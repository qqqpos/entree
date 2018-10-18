<template>
  <dialog open class="flex-center" @click.self="back">
    <div class="frame-common">
      <header>
        <h3>{{$t('title.split')}}</h3>
        <h5>{{$t('tip.selectSplitOrder')}}</h5>
      </header>
      <div class="wrap">
        <div class="row" v-if="splits.length">
          <ticket v-for="(invoice,index) in splits" :key="index" :invoice="invoice"></ticket>
        </div>
        <div class="placeholder" v-else>
          <i class="far fa-smile"></i>
          <p>{{$t('coupon.tip.noCoupon')}}</p>
        </div>
      </div>
      <footer>
        <button class="btn" @click="confirm" :disabled="!selected">{{$t('button.edit')}}</button>
      </footer>
    </div>
  </dialog>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ticket from "../history/component/ticket";

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
      const { type, number } = this.order;

      this.setApp({ newTicket: false });
      this.setTicket({ type, number });
      this.$router.push({ path: "/main/menu" });
    },
    update(number) {
      this.selected = true;

      this.$nextTick(() => {
        const dom = document.querySelector(".ticket.active");
        dom && dom.classList.remove("active");

        Array.from(document.querySelectorAll(".ticket")).some(target => {
          if (target.dataset.number == number) {
            target.classList.add("active");
            return true;
          }
        });
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

.row {
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
}

.row > div {
  margin: 5px;
  width: 120px;
  height: 95px;
}
</style>