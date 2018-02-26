<template>
  <div class="popupMask setting center dark" @click.self="init.reject">
    <div class="editor">
      <header>
        <h5></h5>
        <h3>{{$t('title.interface')}}</h3>
      </header>
      <div class="wrap">
        <inputer v-model.trim="grid.head" title="text.title"></inputer>
        <inputer v-model.trim="grid.subhead" title="text.subtitle"></inputer>
        <selector title="text.function" v-model="grid.route" :opts="routers"></selector>
        <selector title="text.icon" v-model="grid.icon" :opts="icons"></selector>
        <switches v-model="grid.password" title="text.requireAccessPin"></switches>
      </div>
      <footer>
        <div class="opt">
          <checkbox v-model="grid.enable" title="text.enable"></checkbox>
        </div>
        <button class="btn" @click="init.resolve(grid)">{{$t('button.confirm')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import inputer from "../../common/inputer";
import selector from "../../common/selector";
import switches from "../../common/switches";
import checkbox from "../../common/checkbox";
export default {
  props: ["init"],
  components: { inputer, selector, switches, checkbox },
  data() {
    return {
      grid: JSON.parse(JSON.stringify(this.init.grid)),
      routers: [
        {
          label: this.$t("type.sales"),
          tooltip: "",
          value: "sale"
        },
        {
          label: this.$t("type.WALK_IN"),
          tooltip: "",
          value: "order"
        },
        {
          label: this.$t("type.PICK_UP"),
          tooltip: "",
          value: "pickup"
        },
        {
          label: this.$t("type.DELIVERY"),
          tooltip: "",
          value: "delivery"
        },
        {
          label: this.$t("type.DINE_IN"),
          tooltip: "",
          value: "table"
        },
        {
          label: this.$t("type.BUFFET"),
          tooltip: "",
          value: "buffet"
        },
        {
          label: this.$t("type.HIBACHI"),
          tooltip: "",
          value: "hibachi"
        },
        {
          label: this.$t("text.history"),
          tooltip: "",
          value: "history"
        },
        {
          label: this.$t("text.pickupList"),
          tooltip: "",
          value: "list"
        },
        {
          label: this.$t("text.setting"),
          tooltip: "",
          value: "setting"
        },
        {
          label: this.$t("text.cashDrawer"),
          tooltip: "",
          value: "cashDrawer"
        },
        {
          label: this.$t("text.lock"),
          tooltip: "",
          value: "lock"
        }
      ],
      icons: [
        {
          label: "User",
          tooltip: "",
          plainText: true,
          value: "fa-user"
        },
        {
          label: "Phone",
          tooltip: "",
          plainText: true,
          value: "fa-phone"
        },
        {
          label: "Card",
          tooltip: "",
          plainText: true,
          value: "fa-card"
        },
        {
          label: "Cutlery",
          tooltip: "",
          plainText: true,
          value: "fa-cutlery"
        },
        {
          label: "List",
          tooltip: "",
          plainText: true,
          value: "fa-list"
        },
        {
          label: "Inbox",
          tooltip: "",
          plainText: true,
          value: "fa-inbox"
        },
        {
          label: "Cog",
          tooltip: "",
          plainText: true,
          value: "fa-cog"
        },
        {
          label: "Lock",
          tooltip: "",
          plainText: true,
          value: "fa-lock"
        }
      ]
    };
  }
};
</script>