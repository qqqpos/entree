<template>
  <div class="popupMask setting dark center" @click.self="init.reject(false)">
    <div class="editor" v-show="!component">
      <header class="row">
        <div>
          <h5>{{$t(init.edit ? 'title.edit' : 'title.create')}}</h5>
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
        <div class="wrap" v-if="tab === 'basic'" :key="1">
          <selector title="coupon.type" v-model="coupon.type" :opts="opts"></selector>
          <inputer title="text.alias" v-model.trim="coupon.alias" :length="25"></inputer>
          <inputer title="text.description" v-model="coupon.description" type="textarea"></inputer>
          <inputer title="coupon.requireAmount" v-model.number="coupon.requireAmount"></inputer>
          <template v-if="coupon.type === 'giveaway'">
            <selector title="text.item" v-model="search" :opts="itemOpts" :editable="true" @keydown.enter.native="query(search)" @update="addReference" class="width">
              <div class="items row" slot="items">
                <p v-for="(item,index) in coupon.reference" :key="index" class="relative">
                  <span class="f1" :title="'$ ' + item.price[0].toFixed(2)">{{item[language]}}</span>
                  <i class="fa fa-times light clickable" @click.stop="remove(index)"></i>
                </p>
              </div>
            </selector>
          </template>
          <inputer title="text.discount" v-model.number="coupon.discount" v-else></inputer>
          <switches title="coupon.allowStack" v-model="coupon.stack"></switches>   
        </div>
        <div class="wrap" v-else-if="tab === 'condition'" :key="2">
          <inputer title="coupon.code" v-model="coupon.code"></inputer>
          <inputer title="coupon.maxCount" v-model.number="coupon.maxCount"></inputer>
          <inputer title="thead.expire" v-model="coupon.expireDate" placeholder="YYYY-MM-DD"></inputer>
          <selector title="text.apply" v-model="coupon.apply" :opts="targets"></selector>
          <template v-if="coupon.apply === 'category'">
            <div class="checkboxes">
              <checkbox :title="name" v-model="coupon.reference" :val="name" v-for="(name,index) in categories" :key="index" :multiple="true" :translate="false"></checkbox>
            </div>
          </template>
          <template v-else-if="coupon.apply === 'item'">
            <selector title="text.search" v-model="search" :opts="itemOpts" :editable="true" @keydown.enter.native="query(search)" @update="addReference"></selector>
            <div class="items" v-show="coupon.reference.length">
              <p v-for="(item,index) in coupon.reference" :key="index">
                <span class="f1">{{item[language]}}</span>
                <i class="fa fa-trash" @click="remove(index)"></i>
              </p>
            </div>
          </template>
        </div>
      <footer>
        <div class="opt">
          <span class="del" @click="init.reject(true)" v-show="init.create">{{$t('button.delete')}}</span>
        </div>
        <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData" v-show="component"></div>
  </div>
</template>

<script>
import editor from "./helper/price";
import toggle from "../../common/toggle";
import inputer from "../../common/inputer";
import switches from "../../common/switches";
import selector from "../../common/selector";
import checkbox from "../../common/checkbox";

export default {
  props: ["init"],
  components: { editor, inputer, switches, toggle, selector, checkbox },
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
          tooltip: "coupon.tip.rebate",
          value: "rebate"
        },
        {
          label: this.$t("type.giveaway"),
          tooltip: "coupon.tip.giveaway",
          value: "giveaway"
        },
        {
          label: this.$t("type.voucher"),
          tooltip: "coupon.tip.voucher",
          value: "voucher"
        },
        {
          label: this.$t("type.discount"),
          tooltip: "coupon.tip.discount",
          value: "discount"
        }
      ],
      targets: [
        {
          label: this.$t("type.order"),
          tooltip: "coupon.tip.order",
          value: "order"
        },
        {
          label: this.$t("type.category"),
          tooltip: "coupon.tip.category",
          value: "category"
        },
        {
          label: this.$t("type.item"),
          tooltip: "coupon.tip.item",
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
      this.$socket.emit("[ITEM] SEARCH", keyword, items => {
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
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, item };
        this.component = "editor";
      })
        .then(update => {
          this.search = "";
          this.coupon.reference.push(update);
          this.exitComponent();
        })
        .catch(() => {
          this.search = "";
          this.exitComponent();
        });
    },
    remove(index) {
      this.coupon.reference.splice(index, 1);
    }
  }
};
</script>

<style scoped>
p {
  padding: 2px 7px;
  border: 1px solid #ccc;
  margin: 2px;
  border-radius: 4px;
  background: #f5f5f5;
}

.checkboxes {
  max-height: 252px;
  overflow: auto;
}

.items {
  flex-wrap: wrap;
}

.width >>> .inputWrap {
  max-width: 263px;
}
</style>