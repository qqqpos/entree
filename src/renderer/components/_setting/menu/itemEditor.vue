<template>
    <div class="popupMask center dark">
        <div class="itemEditor window" v-if="!coding">
            <header class="title">
                <span>{{$t('setting.itemEditor')}}</span>
                <i class="fa fa-code" @click.ctrl="viewCode"></i>
            </header>
            <div class="inner">
                <section class="card">
                    <header>
                        <span>{{$t('text.itemInfo')}}</span>
                        <div class="advance" @click="advance = !advance">
                            <span v-if="!advance">
                                <i class="fa fa-eye"></i>{{$t('text.advance')}}</span>
                            <span v-else>
                                <i class="fa fa-eye-slash"></i>{{$t('text.normal')}}</span>
                        </div>
                    </header>
                    <article>
                        <smart-input v-model="item.menuID" reg="^[a-zA-Z0-9_. ]{0,3}$" label="text.menuID"></smart-input>
                        <smart-option v-model="item.category" label="text.category" :options="init.categories"></smart-option>
                        <smart-input v-model.trim="item.categoryCN" reg="^.{0,10}$" label="text.categoryCN"></smart-input>
                        <instant-input v-model="item.usEN" label="text.primary" @fill="fill"></instant-input>
                        <smart-input v-model="item.zhCN" reg="^.{0,15}$" label="text.secondary"></smart-input>
                        <smart-input v-model="item.price" reg="^[0-9.,]{3,}$" label="text.price" :more="true" @toggle="extraPrice = !extraPrice"></smart-input>
                        <div class="extraPrice" v-if="extraPrice">
                            <div>
                                <label>{{$t('type.WALK_IN')}}</label>
                                <input v-model="item.prices.WALK_IN">
                            </div>
                            <div>
                                <label>{{$t('type.PICK_UP')}}</label>
                                <input v-model="item.prices.PICK_UP">
                            </div>
                            <div>
                                <label>{{$t('type.DELIVERY')}}</label>
                                <input v-model="item.prices.DELIVERY">
                            </div>
                            <div>
                                <label>{{$t('type.DINE_IN')}}</label>
                                <input v-model="item.prices.DINE_IN">
                            </div>
                            <div>
                                <label>{{$t('type.BAR')}}</label>
                                <input v-model="item.prices.BAR">
                            </div>
                        </div>
                        <smart-switch v-model="item.spicy" label="text.spicy"></smart-switch>
                        <smart-option v-model="item.taxClass" :options="taxOption" label="text.taxClass"></smart-option>
                        <div v-if="advance">
                            <smart-switch v-model="item.disable" label="text.disable"></smart-switch>
                            <smart-switch v-model="item.temporary" label="text.openFood"></smart-switch>
                            <smart-input v-model.number="item.priority" label="text.priority"></smart-input>
                            <smart-input v-model="item.inventory" label="text.inventory"></smart-input>
                            <smart-input v-model="item.rewardPoint" label="text.rewardPoint"></smart-input>
                            <smart-input v-model="item.commission" label="text.commission"></smart-input>
                        </div>
                    </article>
                </section>
                <section class="card">
                    <header>{{$t('text.sideItem')}}
                        <checkbox v-model="item.disableAutoOption" label="text.disableAutoAdd"></checkbox>
                        <span class="tip">({{$t('text.maxItem',11)}})</span>
                    </header>
                    <article class="option">
                        <draggable v-model="item.option" :options="dragtions">
                            <transition-group tag="div">
                                <div v-for="(side,index) in item.option" class="side" :key="index">
                                    <div class="index">{{index+1}}</div>
                                    <div class="item">
                                        <div>
                                            <label>{{$t('text.primary')}}</label>
                                            <input type="text" v-model="side.usEN">
                                        </div>
                                        <div>
                                            <label>{{$t('text.secondary')}}</label>
                                            <input type="text" v-model="side.zhCN">
                                        </div>
                                        <div class="price right">
                                            <label>{{$t('text.price')}}</label>
                                            <input type="text" v-model.number="side.price">
                                            <label>{{$t('text.priceExtra')}}</label>
                                            <input type="text" v-model.number="side.extra">
                                        </div>
                                        <div class="template right">
                                            <label>{{$t('text.template')}}</label>
                                            <select v-model="side.template">
                                                <option v-for="(name,index) in templateOption" :key="index">{{name}}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="ctrl" v-if="advance">
                                        <div>
                                            <checkbox v-model="side.sub" label="text.subItem"></checkbox>
                                            <checkbox v-model="side.overWrite" label="text.replaceName"></checkbox>
                                            <checkbox v-model="side.skip" label="text.ignore"></checkbox>
                                        </div>
                                        <div class="btn" @click="configSubMenu(side,index)">
                                            <i class="fa fa-th-large"></i>
                                            <span>{{$t('button.setSubMenu')}}</span>
                                        </div>
                                    </div>
                                    <i class="fa fa-trash remove" @click="removeOption(index)"></i>
                                </div>
                            </transition-group>
                        </draggable>
                        <div v-show="addButton">
                            <div class="add" @click="addOption">
                                <i class="fa fa-plus"></i>{{$t('text.addSide')}}</div>
                        </div>
                    </article>
                </section>
                <section class="card">
                    <header>{{$t('setting.print')}}</header>
                    <div v-for="(printer,index) in printers" :id="printer" :key="index">
                        <div class="printer" @click="togglePrinter(printer,$event)">
                            <div class="name">
                                <i class="fa fa-print"></i>{{printer}}</div>
                            <div class="more" @click.stop="moreOption(printer)" v-show="item.printer[printer]">
                                <i class="fa fa-level-down"></i>
                            </div>
                        </div>
                        <div class="extra" v-if="item.printer[printer]">
                          <div>
                            <i class="fa fa-exclamation-circle"></i>
                            <span>{{$t('text.printItemName')}}</span>
                            <label>{{$t('text.primary')}}</label>
                            <input v-model="item.printer[printer]['usEN']">
                            <label>{{$t('text.secondary')}}</label>
                            <input v-model="item.printer[printer]['zhCN']">
                          </div>
                          <div>
                              <i class="fa fa-sticky-note"></i>
                              <span>{{$t('text.itemNote')}}</span>
                              <label>{{$t('text.note')}}</label>
                              <input v-model="item.printer[printer]['note']">
                          </div>
                        </div>
                    </div>
                </section>
            </div>
            <footer class="relative">
                <span class="del" @click="del" v-show="item._id">
                    <i class="fa fa-trash-o"></i>{{$t('button.delete')}}</span>
                <div class="tip" v-show="errorText">
                    <i class="fa fa-exclamation-circle"></i>
                    <span class="text">{{errorText}}</span>
                </div>
                <div class="buttons">
                    <div class="btn" @click="exit" id="cancelEdit">{{$t('button.cancel')}}</div>
                    <button class="btn" @click="confirm" id="confirmEdit" :disabled="!item.category">{{$t('button.confirm')}}</button>
                </div>
            </footer>
        </div>
        <div class="coding window" v-else>
            <header class="title">
                <span>{{$t('setting.codeEditor')}}</span>
                <i class="fa fa-list-alt" @click="hateCoding"></i>
            </header>
            <div class="inner">
                <aside class="edit">
                    <textarea v-model="code" id="code"></textarea>
                </aside>
            </div>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import draggable from "vuedraggable";
import debounce from "lodash.debounce";
import smartInput from "../common/smartInput";
import smartSwitch from "../common/smartSwitch";
import smartOption from "../common/smartOption";
import instantInput from "../common/instantInput";
import config from "./subMenuConfig";
import checkbox from "../common/checkbox";
export default {
  props: ["init"],
  components: {
    smartInput,
    smartSwitch,
    smartOption,
    draggable,
    checkbox,
    instantInput,
    config
  },
  data() {
    return {
      item: {},
      code: null,
      coding: false,
      advance: false,
      checking: false,
      errorLine: null,
      extraPrice: false,
      templateOption: [],
      componentData: null,
      component: null,
      taxOption: [],
      printers: [],
      dragtions: {
        animation: 300,
        ghostClass: "ghost"
      },
      errorText: ""
    };
  },
  created() {
    this.taxOption = Object.keys(this.tax.class).map(key => ({
      value: key,
      label: this.tax.class[key].alies + " - " + this.tax.class[key].rate + " %"
    }));
    this.templateOption = this.templates.map(template => template.template);
    this.templateOption.unshift("");
  },
  mounted() {
    let item = Object.assign({}, this.init.item);
    delete item.clickable;
    let price = [];
    item.price.forEach(v => {
      price.push(isNumber(v) ? v.toFixed(2) : v ? "0.00" : "");
    });
    item.price = price.join(",");
    item.option.forEach(option => {
      option.overWrite = option.overWrite || false;
    });
    this.item = item;
    this.printers = Object.keys(this.config.printer);
    document.querySelectorAll(".itemEditor input")[2].focus();
    if (Array.isArray(this.item.printer)) {
      this.item.printer = {};
    } else {
      this.$nextTick(() => {
        Object.keys(item.printer).forEach(name => {
          let dom = document.querySelector("#" + name + " .printer");
          dom && dom.classList.add("selected");
        });
      });
    }
  },
  methods: {
    set(key, value) {
      this.item[key] = value;
    },
    fill(data) {
      this.item = Object.assign({}, this.item, data);
    },
    viewCode() {
      this.code = JSON.stringify(this.item, null, 4);
      this.coding = true;
    },
    highlight() {
      let dom = document.getElementById("code");
      let value = dom.value.split("\n");
      let p = this.errorLine - 1;
      let start = 0;
      let end = 0;
      for (let i = 0; i < p; i++) {
        start += value[i].length + 1;
      }
      end = start + value[p].length;
      dom.setSelectionRange(start, end);
    },
    addOption() {
      this.item.option.push({
        zhCN: "",
        usEN: "",
        price: "",
        overWrite: false
      });
    },
    removeOption(i) {
      this.item.option.splice(i, 1);
    },
    togglePrinter(name, e) {
      if (this.item.printer.hasOwnProperty(name)) {
        e.currentTarget.classList.remove("selected");
        let dom = document.getElementById(name).classList;
        dom.contains("show") && dom.remove("show");
        delete this.item.printer[name];
      } else {
        e.currentTarget.classList.add("selected");
        this.item.printer[name] = {};
      }
    },
    moreOption(name) {
      if (!this.item.printer.hasOwnProperty(name)) return;
      let dom = document.getElementById(name).classList;
      dom.contains("show") ? dom.remove("show") : dom.add("show");
    },
    morePrice() {
      this.extraPrice = !this.extraPrice;
    },
    configSubMenu(side, index) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, side };
        this.component = "config";
      })
        .then(side => {
          this.$q();
          this.item.option.splice(index, 1, side);
        })
        .catch(() => {
          this.$q();
        });
    },
    hateCoding() {
      this.item = JSON.parse(this.code);
      this.$nextTick(() => {
        Object.keys(this.item.printer).forEach(name => {
          let dom = document.getElementById("#" + name + " .printer");
          dom && dom.classList.add("selected");
        });
      });
      this.coding = false;
    },
    confirm(revive) {
      let pass = document.querySelectorAll("i.invalid");
      if (pass.length === 0) {
        this.item.price = String(this.item.price)
          .split(",")
          .map(parseFloat);
        Object.keys(this.item.prices).forEach(type => {
          if (Array.isArray(this.item.prices[type])) {
            if (
              this.item.prices[type][0] == null ||
              this.item.prices[type].length === 0
            ) {
              delete this.item.prices[type];
            }
          } else {
            this.item.prices[type] = this.item.prices[type]
              .split(",")
              .map(parseFloat);
          }
        });
        this.item.option = this.item.option
          .map((item, index) => {
            if (!isNumber(item.price)) delete item.price;
            if (!isNumber(item.extra)) delete item.extra;
            if (!item.template) delete item.template;
            if (!item.price && !item.extra && !isNumber(this.item.price[index]))
              item.extra = 0;
            return item;
          })
          .filter((item, index) => item.zhCN && item.usEN);
        this.init.resolve({
          item: this.item,
          revive
        });
      } else {
        let dom = document.querySelector(".invalid");
        let text = dom.parentElement.children[0].innerText;
        this.errorText = this.$t("text.invalidValue", text);
        dom.scrollIntoView({ behavior: "smooth" });
        dom.parentElement.children[1].focus();
      }
    },
    del() {
      this.init.reject(this.item);
    },
    exit() {
      this.init.reject(false);
    }
  },
  computed: {
    addButton() {
      if (this.item.hasOwnProperty("option")) {
        return this.item.option.length < 11;
      }
      return true;
    },
    ...mapGetters(["tax", "config", "templates"])
  }
};
</script>

<style scoped>
.itemEditor,
.coding {
  width: 700px;
}

textarea {
  outline: none;
  flex: 1;
  border: none;
  background: #2c2f43;
  color: #f9f9f9;
  resize: none;
  font-size: 1em;
  font-family: "Microsoft YaHei" !important;
}

.intro footer {
  background: #ddd;
  position: absolute;
  bottom: 0;
  width: 200px;
}

.intro footer .btn {
  margin: 10px;
  width: 90%;
}

.coding .inner {
  display: flex;
  height: 585px;
}

aside.edit {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}

aside.intro {
  flex: 2;
  position: relative;
}

.status i {
  color: #4caf50;
}

.status {
  overflow: hidden;
  flex: 1;
  line-height: 26px;
  padding: 5px 10px;
  background: #1d213a;
  color: #ff5722;
  width: 480px;
  transition: flex 0.3s ease-out;
}

.expaned {
  flex: 4;
}

.log:first-of-type {
  display: inline-block;
  width: 90%;
}

.log:nth-child(3) {
  color: #ffee58;
  text-align: center;
}

.log.passed {
  color: #cfd8dc;
}

.itemEditor .inner {
  height: 512px;
  overflow-y: scroll;
  overflow-x: hidden;
  background: url(../../../assets/image/grid.png) #fcfcfc;
}

.itemEditor footer .btn {
  margin: 5px;
  width: 150px;
}

article.option {
  box-shadow: none;
  background: none;
}

.side {
  background: #fff;
  margin: 5px 0;
  display: flex;
  position: relative;
  box-shadow: var(--shadow);
}

.ctrl {
  display: flex;
  flex-direction: column;
}

.ctrl .btn {
  flex-direction: row;
  width: 280px;
  height: 40px;
  margin: 5px 0 0 5px;
  cursor: pointer;
}

.ctrl .btn i {
  margin-right: 5px;
}

i.remove {
  position: absolute;
  right: -30px;
  top: calc(50% - 19px);
  color: #f44336;
  opacity: 0.2;
  z-index: 0;
  padding: 10px 8px 10px 6px;
  background: #fff;
  font-size: 1.25em;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  cursor: pointer;
  border-bottom: 1px solid #ccc;
  transition: opacity 0.3s ease;
  box-shadow: 3px 0px 5px -3px rgba(0, 0, 0, 0.4);
}

.index {
  background: #03a9f4;
  width: 20px;
  text-align: center;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.item {
  padding: 10px 15px;
  border-left: 1px solid #e0e0e0;
}

.item input[type="text"] {
  width: 170px;
  border: 1px solid #9e9e9e;
}

.side:hover i.remove {
  opacity: 1;
}

footer .tip {
  position: absolute;
  top: 17px;
  left: 120px;
  color: #555;
  border-left: 4px solid #ffc107;
  padding: 10px 15px 10px 10px;
  background: #fff;
  box-shadow: var(--shadow);
}

footer .tip i {
  color: #ffc107;
}

.printer {
  margin: 0 0 5px;
  border-left: 10px solid #bbdefb;
  background: #f5f5f5;
  color: #b0bec5;
  box-shadow: var(--shadow);
  text-indent: 15px;
  display: flex;
  cursor: pointer;
}

.printer i {
  margin-right: 10px;
}

.printer .name {
  padding: 15px 0px;
  flex: 4;
}

.printer .more {
  padding: 15px 10px;
  flex: 1;
  text-align: right;
  color: #f5f5f5;
}

.printer.selected {
  border-left: 10px solid #03a9f4;
  background: #fff;
  color: #333;
}

.printer.selected .more {
  color: #333;
}

.extra {
  display: none;
  width: 618px;
  padding: 10px 0;
  text-indent: 10px;
  background: #fff;
  margin: 0px 0 5px 10px;
  box-shadow: var(--shadow);
}

.extra i {
  color: #ff9800;
}

.extra span {
  margin-right: 1em;
  color: #ff9800;
}

.extra input {
  width: 120px;
}

.show .extra {
  display: block;
}

label {
  min-width: 40px;
  display: inline-block;
}

.buttons {
  flex: 6;
  text-align: right;
}

span.del {
  color: #ff786e;
  border-bottom: 1px dashed #ffbeba;
  position: absolute;
  left: 45px;
  top: 25px;
  cursor: pointer;
}

.del i {
  margin-right: 5px;
}

div.add {
  background: #fff;
  padding: 15px;
  box-shadow: var(--shadow);
  border-left: 10px solid #e0e0e0;
  border-right: 10px solid #e0e0e0;
  text-align: center;
  cursor: pointer;
  color: #444;
}

.add i {
  margin: 0 10px;
}

.checkbox {
  font-size: 18px;
  vertical-align: sub;
  float: right;
  padding-top: 8px;
}

.extraPrice div {
  display: flex;
  border-bottom: 1px solid #ccc;
  align-items: center;
}

.extraPrice label {
  width: 115px;
  text-align: right;
  background: #f5f5f5;
  padding: 10px;
  font-style: italic;
  color: #607d8b;
}

.extraPrice input {
  font-size: 1em;
  border: none;
  padding: 10px;
  flex: 1;
  background: #f5f5f5;
}

.template {
  margin-top: 1px;
}

.template select {
  width: 172px;
}

.advance {
  font-size: initial;
  font-weight: initial;
  color: #607d8b;
  float: right;
  border-bottom: 1px dotted #9e9e9e;
  cursor: pointer;
}

.advance i {
  margin-right: 5px;
}

.item .price input {
  width: 60px;
}

.right {
  text-align: right;
}
</style>
