<template>
  <div class="popupMask setting dark center" @click.self="init.reject(false)">
    <div class="editor">
      <header>
        <div>
          <h5 v-if="init.edit">{{$t('title.edit')}}</h5>
          <h5 v-else>{{$t('title.create')}}</h5>
          <h3>{{$t('title.coupon')}}</h3>
        </div>
        <nav class="tabs">
          <div>
            <input type="radio" v-model="tab" value="basic" name="tab" id="basic">
            <label for="basic">{{$t('setting.basic')}}</label>
          </div>
          <div>
            <input type="radio" v-model="tab" value="condition" name="tab" id="condition">
            <label for="condition">{{$t('setting.condition')}}</label>
          </div>
        </nav>
      </header>
      <template v-if="tab === 'basic'">
        <div class="wrap">
          <selector title="text.type" v-model="coupon.type" :opts="opts"></selector>
          <inputer title="text.alias" v-model.trim="coupon.alias" :length="27"></inputer>
          <inputer title="text.content" v-model="coupon.description" type="textarea"></inputer>
          <inputer title="text.couponCode" v-model="coupon.code"></inputer>
          <inputer title="text.customFooter" v-model="coupon.footer" type="textarea"></inputer>
          <template v-if="coupon.type === 'giveaway'">
            <selector title="text.search" v-model="search" :opts="itemOpts" :editable="true" @keydown.enter.native="query(search)" @update="addReference"></selector>
            <div class="items" v-show="coupon.reference.length">
              <p v-for="(item,index) in coupon.reference" :key="index">
                <span class="item">{{item[language]}}</span>
                <i class="fa fa-trash" @click="remove(index)"></i>
              </p>
            </div>
          </template>
          <inputer title="text.amount" v-model.number="coupon.discount" v-else></inputer>
        </div>
      </template>
      <template v-else-if="tab === 'condition'">
        <div class="wrap">
          <toggle v-model="coupon.expire.enable" title="text.expiration" :defaultStyle="false">
            <transition name="dropdown">
              <div class="opt" v-if="coupon.expire.enable">
                <inputer title="thead.count" v-model.number="coupon.expire.count"></inputer>
                <inputer title="thead.expire" v-model="coupon.expire.date" placeholder="YYYY-MM-DD"></inputer>
              </div>
            </transition>
          </toggle>
          <toggle title="text.setCondition" v-model="coupon.require.enable" :defaultStyle="false">
            <transition name="dropdown">
              <div class="opt" v-if="coupon.require.enable">
                <inputer title="text.amountGreaterThan" v-model.number="coupon.require.amount"></inputer>
              </div>
            </transition>
          </toggle>
          <switches title="text.couponStack" v-model="coupon.stack"></switches>
          <selector title="text.apply" v-model="coupon.apply" :opts="applyTargets"></selector>
          <template v-if="coupon.apply === 'category'">
            <div class="checkboxes">
              <checkbox :title="name" v-model="coupon.reference" :val="name" v-for="(name,index) in categories" :key="index" :multiple="true" :translate="false"></checkbox>
            </div>
          </template>
          <template v-else-if="coupon.apply === 'item'">
            <selector title="text.search" v-model="search" :opts="itemOpts" :editable="true" @keydown.enter.native="query(search)" @update="addReference"></selector>
            <div class="items" v-show="coupon.reference.length">
              <p v-for="(item,index) in coupon.reference" :key="index">
                <span class="item">{{item[language]}}</span>
                <i class="fa fa-trash" @click="remove(index)"></i>
              </p>
            </div>
          </template>
        </div>
      </template>
      <footer>
        <div class="opt">
          <span class="del" @click="init.reject(true)" v-show="coupon._id">{{$t('button.delete')}}</span>
        </div>
        <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import toggle from "../../common/toggle";
import inputer from "../../common/inputer";
import switches from "../../common/switches";
import selector from "../../common/selector";
import checkbox from "../../common/checkbox";

export default {
  props: ["init"],
  components: { inputer, switches, toggle, selector, checkbox },
  data() {
    return {
      tab: "basic",
      condition: false,
      component: null,
      componentData: null,
      language: this.$store.getters.language,
      categories: [],
      itemOpts: [],
      search: "",
      coupon: JSON.parse(JSON.stringify(this.init.coupon)),
      opts: [
        {
          label: this.$t("type.rebate"),
          tooltip: "tip.coupon.rebate",
          value: "rebate"
        },
        {
          label: this.$t("type.giveaway"),
          tooltip: "tip.coupon.giveaway",
          value: "giveaway"
        },
        {
          label: this.$t("type.voucher"),
          tooltip: "tip.coupon.voucher",
          value: "voucher"
        },
        {
          label: this.$t("type.discount"),
          tooltip: "tip.coupon.discount",
          value: "discount"
        }
      ],
      applyTargets: [
        {
          label: this.$t("type.order"),
          tooltip: "tip.coupon.order",
          value: "order"
        },
        {
          label: this.$t("type.category"),
          tooltip: "tip.coupon.category",
          value: "category"
        },
        {
          label: this.$t("type.item"),
          tooltip: "tip.coupon.item",
          value: "item"
        }
      ]
    };
  },
  created() {
    this.$socket.emit("[CATEGORY] LIST", categories => {
      this.categories = categories;
    });
  },
  methods: {
    query(keyword) {
      this.$socket.emit("[MENU] SEARCH", keyword, items => {
        this.itemOpts = items.map(item => ({
          label: item[this.language],
          tooltip: item.category,
          plainText: true,
          value: this.coupon.type === "giveaway" ? item : item._id
        }));
      });
    },
    confirm() {
      this.init.resolve(this.coupon);
    },
    addReference(item) {
      this.search = "";
      this.coupon.reference.push(item);
    },
    remove(index) {
      this.coupon.reference.splice(index, 1);
    }
  }
};
</script>

<style scoped>
header {
  flex-direction: row;
}

.items {
  margin-left: 80px;
  border: 1px solid #eee;
  background: #fff;
  border-radius: 2px;
  padding: 10px 5px;
  margin-top: 5px;
}

p {
  display: flex;
  padding: 0 10px;
}

.item {
  flex: 1;
}
</style>