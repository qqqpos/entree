<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <div>
                    <h3>{{$t('title.changeLog')}}</h3>
                    <h5>{{$t('tip.foundRecords',init.records.length)}}</h5>
                </div>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <ul class="record">
                    <li v-for="(change,index) in records" :key="index" :data-time="change.time | moment('HH:mm')">
                        <p class="info"><i class="fas fa-user-edit space light"></i>{{change.operator}}</p>
                        <p class="changes" v-if="change.actions.length">
                          <span class="diff">{{$t('CHANGE.CHANGES',change.actions.length)}}</span>
                          <template v-if="change.priceChange !== 0">
                            <span v-if="change.priceChange > 0" class="gain"><i class="fas fa-sort-up space"></i>{{change.priceChange | decimal}}</span>
                            <span v-if="change.priceChange < 0" class="lose"><i class="fas fa-sort-down space"></i>{{change.priceChange | decimal}}</span>
                          </template>
                        </p>
                        <p class="changes" v-else>{{$t(index === 0 ?'CHANGE.CREATE_ORDER' : 'CHANGE.UNCHANGED')}}</p>
                        <div class="link" @click="view(change.actions)" v-show="change.actions.length">
                            <i class="fas fa-list light"></i>
                            <span>{{$t('text.recordDetail')}}</span>
                        </div>
                        <div class="view" @click="preview(change.order)">
                            <i class="fas fa-print light" v-if="change.isPrint"></i>
                            <i class="fas fa-file-invoice light" v-else></i>
                            <span>{{$t('text.preview')}}</span>
                        </div>
                    </li>
                </ul>
                <paginator :of="init.records" :max="5" :contain="10" @page="setPage"></paginator>
            </div>
        </div>
        <ul class="log relative" v-show="actions">
            <li v-for="(action,index) in actions" :key="index">
                <p v-html="parse(action)" class="detail"></p>
            </li>
        </ul>
        <div :is="component" :init="componentData" class="preview"></div>
    </div>
</template>

<script>
import ticket from "../../common/ticket";
import paginator from "../../common/paginator";

export default {
  props: ["init"],
  components: { ticket, paginator },
  data() {
    return {
      language: this.$store.getters.language,
      componentData: null,
      component: null,
      actions: null,
      page:0
    };
  },
  methods: {
    view(actions) {
      this.exitComponent();
      this.actions = this.actions === actions ? null : actions;
    },
    preview(ticket) {
      this.actions = null;
      this.$open("ticket", { ticket, exit: true });
    },
    parse([type, ...value]) {
      switch (type) {
        case "CHANGE.ITEM_QTY_LESS":
        case "CHANGE.ITEM_QTY_MORE":
        case "CHANGE.ITEM_PRICE":
          return this.$t(type, value[0][this.language], value[1], value[2])
            .split("|")
            .map(text => `<span>${text}</span>`)
            .join("");
          break;
        case "CHANGE.ITEM_ADD":
        case "CHANGE.ITEM_REMOVE":
          return this.$t(type, value[1], value[0][this.language])
            .split("|")
            .map(text => `<span>${text}</span>`)
            .join("");
        case "CHANGE.ITEM_SIDE":
          return this.$t(
            type,
            value[0][this.language],
            value[1][this.language],
            value[2][this.language]
          )
            .split("|")
            .map(text => `<span>${text}</span>`)
            .join("");
        case "CHANGE.ITEM_CHOICE_SET":
          return this.$t(type, value[0][this.language])
            .split("|")
            .map(text => `<span>${text}</span>`)
            .join("");
        case "CHANGE.ITEM_PRINT":
          return (
            this.$t(type, value.length)
              .split("|")
              .map(text => `<span>${text}</span>`)
              .join("") +
            "<ul>" +
            value
              .map(
                item =>
                  `<li><span>${item.qty} x </span><span>${
                    item[this.language]
                  }</span></li>`
              )
              .join("") +
            "</ul>"
          );
        case "CHANGE.ORDER_TYPE":
          return this.$t(
            type,
            this.$t("type." + value[0]),
            this.$t("type." + value[1])
          )
            .split("|")
            .map(text => `<span>${text}</span>`)
            .join("");
        case "CHANGE.ORDER_VOID":
        case "CHANGE.ORDER_RESTORED":
          return this.$t(type);
        default:
          return this.$t(type, value[0], value[1])
            .split("|")
            .map(text => `<span>${text}</span>`)
            .join("");
      }
    },
    setPage(n){
      this.page = n;
    }
  },
  computed: {
    records() {
      const min = this.page * 10;
      const max = min + 10;

      return this.init.records.slice(min, max);
    }
  }
};
</script>

<style scoped>
.wrap {
  padding: initial;
}

ul.record {
  margin-left: 75px;
  height: 100%;
  border-left: 2px solid #f5f5f5;
}

ul.log {
  background: #fff;
  padding: 8px 6px;
  border-radius: 4px;
  padding-left: 27px;
  margin-left: 25px;
}

.log li {
  list-style-type: circle;
  list-style-position: outside;
  min-width: 350px;
}

.record li {
  position: relative;
  padding: 8px 0 8px 20px;
  min-width: 320px;
}

.record li:before {
  content: attr(data-time);
  position: absolute;
  left: -77px;
  top: 8px;
  width: 60px;
  text-align: right;
}

.record li:after {
  content: "\F017";
  left: -9px;
  top: 9px;
  font-family: fontAwesome;
  position: absolute;
  background: #fcfcfc;
  color: #009688;
  border-radius: 50%;
}

li:nth-child(even) {
  background: #f5f5f5;
}

.info {
  display: flex;
}

.preview {
  margin-left: 25px;
}

.changes {
  margin-top: 4px;
  color: #3c3c3c;
  font-size: 0.8em;
  display: flex;
}

.link,
.view {
  position: absolute;
  padding: 9px 5px;
  top: 0;
  display: flex;
  flex-direction: column;
  text-align: center;
  cursor: pointer;
}
.link {
  right: 0;
}

.view {
  right: 80px;
  padding: 9px 10px;
}

.link span,
.view span {
  font-size: 0.75em;
  margin-top: 5px;
}

.detail >>> span:nth-child(even) {
  color: #ff5722;
  padding: 0 5px;
  font-weight: bold;
}

.lose {
  color: #ff5722;
}
.lose i {
  color: #ff5722;
  line-height: 0.6;
  vertical-align: top;
}

.gain,
.gain i {
  color: #4caf50;
  vertical-align: bottom;
}

.diff {
  width: 135px;
}

ul.log:after {
  left: calc(50% - 25px);
  top: -25px;
  width: 50px;
  height: 50px;
  background: #fff;
  content: "";
  display: block;
  position: absolute;
  z-index: -1;
  border-radius: 50%;
}

ul.log:before {
  font-family: fontAwesome;
  content: "\f4ff";
  font-weight: 600;
  position: absolute;
  left: calc(50% - 8px);
  top: -18px;
  color: #3c3c3c;
}
</style>