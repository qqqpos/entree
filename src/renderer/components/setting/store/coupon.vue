<template>
  <div>
    <div class="tab-content">
      <header class="nav">
        <div class="title">
          <h3>{{$t('setting.title.couponList')}}</h3>
        </div>
        <nav>
          <span @click="create">{{$t('button.new')}}</span>
        </nav>
      </header>
      <table class="setting">
        <thead>
          <tr>
            <th>{{$t('thead.name')}}</th>
            <th>{{$t('thead.discount')}}</th>
            <th>{{$t('thead.expire')}}</th>
            <th>{{$t('thead.count')}}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(coupon,index) in coupons" :key="index">
            <td>{{coupon.alias}}</td>
            <td class="amount" v-if="coupon.type === 'discount'">{{coupon.discount}} %</td>
            <td class="amount" v-else>$ {{coupon.discount | decimal}}</td>
            <td :class="{expired: (coupon.expire.enable && today > coupon.expire.date)}">{{format(coupon.expire.date)}}</td>
            <td>{{coupon.count}}</td>
            <td class="opt" @click="edit(coupon,index)">
              <i class="fa fa-ellipsis-v"></i>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import editor from "./editor/coupon";
export default {
  props: ["init"],
  components: { editor },
  data() {
    return {
      componentData: null,
      component: null,
      coupons: [],
      today: Date.now()
    };
  },
  beforeRouteEnter: (to, from, next) => {
    appSocket.emit("[COUPON] LIST", data => {
      next(vm => {
        vm.coupons = data;
      });
    });
  },
  methods: {
    format(date) {
      return date
        ? moment(date).format("YYYY-MM-DD")
        : this.$t("text.neverExpire");
    },
    create() {
      let coupon = {
        code: "",
        alias: "",
        discount: 0,
        stack: false,
        expire: {
          enable: false,
          count: 0,
          date: ""
        },
        count: 0,
        // 'rebate':        '满减券',
        // 'giveaway':      '礼物券',
        // 'voucher':       '现金券',
        // 'discount':      '折扣券',
        // 'complimentary': '体验券'
        type: "",
        require: {
          enable: false,
          amount: 0,
          item: [],
          exclude: []
        },
        apply: "", // order , category, item,
        include: true,
        reference: []
      };

      this.edit(coupon);
    },
    edit(coupon, index) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, coupon, edit: !!coupon._id };
        this.component = "editor";
      })
        .then(update => {
          this.$socket.emit("[COUPON] UPDATE", update, data => {
            this.coupons.splice(index, 1, data);
            this.$socket.emit("[COUPON] LIST", coupons => {
              this.coupons = coupons;
              this.exitComponent();
            });
          });
        })
        .catch(remove => {
          this.exitComponent();
          remove &&
            this.$socket.emit("[COUPON] REMOVE", coupon._id, () => {
              this.coupons.splice(index, 1);
            });
        });
    }
  }
};
</script>