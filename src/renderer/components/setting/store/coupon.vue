<template>
    <div>
        <div class="tab-content wide">
            <header class="nav">
                <h3>{{$t('setting.title.coupon')}}</h3>
                <nav>
                    <span @click="createCoupon">{{$t('button.new')}}</span>
                </nav>
            </header>
            <div class="tableWrap relative">
                <table v-if="coupons.length">
                    <thead>
                        <tr>
                            <th>{{$t('text.enable')}}</th>
                            <th>{{$t('coupon.type')}}</th>
                            <th>{{$t('coupon.name')}}</th>
                            <th>{{$t('coupon.expire')}}</th>
                            <th>{{$t('coupon.performance')}}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(coupon,index) in coupons" :key="index">
                            <td><switches v-model="coupon.enable" class="boxCenter"></switches></td>
                            <td class="text-center">{{$t('type.'+coupon.type)}}</td>
                            <td class="text-center" :title="coupon.description">{{coupon.alias}}</td>
                            <td class="text-center">{{getDate(coupon.expireDate)}}</td>
                            <td class="text-center">{{$t('text.times',coupon.count)}} / {{coupon.maxCount ? coupon.maxCount : $t('coupon.infinity')}}</td>
                            <td class="clickable text-center" @click="edit(coupon,false,index)"><i class="fas fa-pen-square light space"></i>{{$t('button.edit')}}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="placeholder" v-else>
                  <i class="far fa-grin-tongue-squint"></i>
                  <p>{{$t('coupon.tip.noCoupon')}}</p>
                </div>
            </div>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import editor from "./editor/coupon";
import switches from "../common/switches";

export default {
  components: { editor, switches },
  data() {
    return {
      today: Date.now(),
      componentData: null,
      component: null,
      coupons: []
    };
  },
  beforeRouteEnter: (to, from, next) => {
    appSocket.emit("[COUPON] LIST", data => {
      next(vm => {
        vm.coupons = data || [];
      });
    });
  },
  methods: {
    createCoupon() {
      const coupon = {
        _id: ObjectId().toString(),
        code: "",
        alias: "",
        description: "",
        // 'rebate':        '满减券',
        // 'giveaway':      '礼物券',
        // 'voucher':       '现金券',
        // 'discount':      '折扣券',
        type: "",
        discount: 0,
        stack: false,
        expireDate: null, // expire date
        count: 0,
        maxCount: 0, // expire count,
        requireAmount: 0,
        require: {
          enable: false,
          amount: 0,
          item: [],
          exclude: []
        },
        apply: "",
        include: true,
        reference: []
      };

      this.edit(coupon, true);
    },
    edit(coupon, create = false, index) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, coupon, edit: !create };
        this.component = "editor";
      })
        .then(update => {
          this.$socket.emit("[COUPON] UPDATE", update, data => {
            create
              ? this.coupons.push(update)
              : this.coupons.splice(index, 1, data);

            this.exitComponent();
          });
        })
        .catch(remove => {
          this.exitComponent();

          remove &&
            this.$socket.emit("[COUPON] REMOVE", coupon._id, () => {
              this.coupons.splice(index, 1);
            });
        });
    },
    getDate(date) {
      return date
        ? this.$t("coupon.expireAt", date)
        : this.$t("coupon.neverExpire");
    }
  }
};
</script>

<style scoped>
.nav {
  background: #fff;
  color: #3c3c3c;
}

.tableWrap {
  padding: 15px;
  height: 639px;
  background: #f1f1f1;
}

.tableWrap table {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

thead th {
  color: #37474f;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
</style>


