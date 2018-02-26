<template>
  <div class="popupMask setting dark center">
    <div class="editor">
      <header>
        <div>
          <h5 v-if="init.edit">{{$t('title.edit')}}</h5>
          <h5 v-else>{{$t('title.create')}}</h5>
          <h3>{{item[language]}}</h3>
        </div>
        <nav class="tabs">
          <div>
            <input type="radio" v-model="mode" value="basic" name="tab" id="basic">
            <label for="basic">{{$t('text.itemInfo')}}</label>
          </div>
          <div>
            <input type="radio" v-model="mode" value="print" name="tab" id="print">
            <label for="print">{{$t('setting.print')}}</label>
          </div>
          <div>
            <input type="radio" v-model="mode" value="advance" name="tab" id="advance">
            <label for="advance">{{$t('text.advance')}}</label>
          </div>
        </nav>
      </header>
      <template v-if="mode === 'basic'">
        <div class="wrap info">
          <div class="item">
            <inputer title="text.menuID" v-model="item.menuID"></inputer>
            <selector title="text.category" v-model="item.category" :opts="init.categories" :editable="false"></selector>
            <inputer title="text.primary" v-model.trim="item.usEN" :autoFocus="true" @keydown.enter.native="save"></inputer>
            <inputer title="text.secondary" v-model.trim="item.zhCN"></inputer>
            <inputer title="text.price" v-model="item.price" @keydown.enter.native="save">
              <i class="fa fa-ellipsis-v price" @click="openPriceEditor"></i>
            </inputer>
            <selector title="text.taxClass" v-model="item.taxClass" :opts="taxes" :editable="false"></selector>
            <div class="options">
              <label class="title">{{$t('setting.print')}}</label>
              <div class="inner">
                <checkbox v-for="(name,index) in printers" :key="index" v-model="printer" :title="name" :val="name" :multiple="true" @input="updatePrint" :translate="false"></checkbox>
              </div>
            </div>
            <switches title="text.manualSideOption" v-model="item.manual"></switches>
          </div>
          <draggable class="side" tag="div" :options="{animation: 300,ghostClass: 'ghost' ,handle:'.drag',draggable:'.draggable'}" v-model="item.option">
            <transition-group tag="ul" class="options" name="dropdown">
              <li v-for="(option,index) in item.option" :key="index" class="draggable">
                <div class="inner">
                  <span class="index">{{index + 1}}</span>
                  <input type="text" v-model.trim="option.usEN" :placeholder="$t('text.primary')">
                  <input type="text" v-model.trim="option.zhCN" :placeholder="$t('text.secondary')">
                  <input type="number" v-model="option.price" :placeholder="getPlaceholder(option,index)" @keydown.tab.native="addOption">
                  <i class="fa fa-sort drag"></i>
                  <i class="fa fa-ellipsis-v" @click="editOption(option,index)"></i>
                </div>
                <i class="fa fa-trash remove" @click="removeOption(index)"></i>
              </li>
              <li @click="addOption" :key="-1" v-if="item.option.length < 11" class="add">
                <i class="fa fa-plus"></i>
                <span>{{$t('button.new')}}</span>
              </li>
            </transition-group>
          </draggable>
        </div>
      </template>
      <template v-else-if="mode=== 'print'">
        <div class="wrap column">
          <toggle :title="name" true-tooltip="tip.replaceItemName" false-tooltip="tip.noReplaceItemName" :conditionalTooltip="true" v-for="(printer,name,index) in item.printer" :key="index" v-model="printer.replace" v-show="isShowPrinter(name)" @update="render">
            <transition name="dropdown">
              <div class="opt" v-if="printer.replace">
                <inputer title="text.primary" v-model="printer.usEN"></inputer>
                <inputer title="text.secondary" v-model="printer.zhCN"></inputer>
              </div>
            </transition>
          </toggle>
        </div>
      </template>
      <template v-else-if="mode ==='advance'">
        <div class="wrap info">
          <div class="item">
            <inputer title="text.priority" v-model.number="item.priority"></inputer>
            <inputer title="text.inventory" v-model.number="item.inventory"></inputer>
            <inputer title="text.rewardPoint" v-model.number="item.rewardPoint"></inputer>
            <external title="text.presetItem" @open="setPreset" :defaultStyle="false"></external>
          </div>
          <div class="side">
            <switches title="text.openFood" v-model="item.temporary"></switches>
            <switches title="text.marketPrice" v-model="item.marketPrice"></switches>
            <toggle title="text.weightScale" v-model="item.weightItem.enable" :defaultStyle="false">
              <transition name="dropdown">
                <div class="opt" v-if="item.weightItem.enable">
                  <inputer title="text.amount" v-model="item.weightItem.value"></inputer>
                  <inputer title="text.unit" v-model="item.weightItem.unit"></inputer>
                </div>
              </transition>
            </toggle>
            <toggle title="text.commission" v-model="item.commission.enable" :defaultStyle="false">
              <transition name="dropdown">
                <div class="opt" v-if="item.commission.enable">
                  <inputer title="text.amount" v-model="item.commission.value"></inputer>
                  <switches title="text.percentage" v-model="item.commission.percentage"></switches>
                </div>
              </transition>
            </toggle>
            <switches title="text.spicy" v-model="item.spicy"></switches>
            <switches title="text.disable" v-model="item.disable"></switches>
          </div>
        </div>
      </template>
      <footer>
        <div class="opt">
          <span class="del" v-show="init.edit" @click="init.reject(true)">{{$t('button.delete')}}</span>
        </div>
        <button class="btn" @click="init.reject(false)">{{$t('button.back')}}</button>
        <button class="btn" @click="save" :disabled="!item.category">{{$t('button.save')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import prices from "./priceEditor";
import editor from "./optionEditor";
import draggable from "vuedraggable";
import presetor from "./presetEditor";
import toggle from "../../common/toggle";
import inputer from "../../common/inputer";
import selector from "../../common/selector";
import checkbox from "../../common/checkbox";
import switches from "../../common/switches";
import external from "../../common/external";


export default {
  props: ["init"],
  components: {
    prices,
    editor,
    toggle,
    external,
    switches,
    inputer,
    selector,
    checkbox,
    presetor,
    draggable
  },
  data() {
    return {
      componentData: null,
      component: null,
      mode: "basic",
      deprecated: false,
      language: this.$store.getters.language,
      printers: Object.keys(this.$store.getters.config.printers),
      printer: [],
      item: JSON.parse(JSON.stringify(this.init.item)),
      taxes: Object.keys(this.$store.getters.tax.class).map(name => ({
        label: this.$store.getters.tax.class[name].alias,
        tooltip: this.$store.getters.tax.class[name].rate + " %",
        plainText: true,
        value: name
      }))
    };
  },
  created() {
    this.patchItem();
    this.initialData();
  },
  methods: {
    initialData() {
      this.printer = Object.keys(this.item.printer);
    },
    getPlaceholder(option, index) {
      const prices = Array.isArray(this.item.price)
        ? this.item.price
        : this.item.price.split(",");
      const itemPrice = prices[index] || prices[0];

      const price = option.price || (option.extra || 0) + itemPrice;
      return price.toFixed(2);
    },
    updatePrint(devices) {
      let { printer } = this.item;
      this.item.printer = {};
      devices.forEach(name => {
        if (printer.hasOwnProperty(name)) {
          Object.assign(this.item.printer, { [name]: printer[name] });
        } else {
          Object.assign(this.item.printer, {
            [name]: {
              replace: false,
              usEN: "",
              zhCN: "",
              note: ""
            }
          });
        }
      });
    },
    openPriceEditor() {
      const { prices, price } = this.item;
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, prices, price };
        this.component = "prices";
      })
        .then(_prices => {
          Object.assign(this.item, { prices: _prices });
          this.$q();
        })
        .catch(() => this.$q());
    },
    addOption() {
      if (this.item.option.length > 11) return;

      this.item.option.push({ usEN: "", zhCN: "", replace: false });
    },
    removeOption(index) {
      this.item.option.splice(index, 1);
    },
    editOption(option, index) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, option };
        this.component = "editor";
      })
        .then(_option => {
          this.item.option.splice(index, 1, _option);
          console.log(this.item);
          this.$q();
        })
        .catch(() => this.$q());
    },
    render() {
      this.$forceUpdate();
    },
    setPreset() {
      new Promise((resolve, reject) => {
        const { preset = [] } = this.item;
        this.componentData = { resolve, reject, preset };
        this.component = "presetor"
      }).then(_preset => {
        Object.assign(this.item, { preset: _preset })
        this.$q();
      }).catch(() => this.$q())
    },
    save() {
      this.item.zhCN = this.item.zhCN || this.item.usEN;
      this.item.price = Array.isArray(this.item.price)
        ? this.item.price
        : this.item.price.toString().split(",");

      this.init.resolve(this.item);
    },
    isShowPrinter(device) {
      return !/cashier/i.test(device);
    },
    patchItem() {
      //update commission
      if (!this.item.commission) {
        Object.assign(this.item, {
          commission: {
            enable: false,
            percentage: false,
            value: 0
          }
        });
      }

      //update weight
      if (!this.item.weightItem) {
        Object.assign(this.item, {
          weightItem: {
            enable: false,
            unit: "lbs",
            value: 0
          }
        });
      }
    }
  }
};
</script>

<style scoped>
header {
  flex-direction: row;
  justify-content: flex-start;
}

.wrap {
  display: flex;
  height: 462px;
}

.wrap.info {
  min-width: 624px;
}

.wrap.column {
  flex-direction: column;
}

.item {
  border-right: 1px solid #ddd;
  padding-right: 25px;
}

.side {
  flex: 1;
  border-left: 1px solid #fff;
  padding-left: 25px;
}

div.options {
  display: flex;
  align-items: center;
  margin: 5px 0;
}

label.title {
  width: 80px;
}

div.options .inner {
  width: 189px;
  height: 178px;
  border: 1px solid #eee;
  background: #fff;
  border-radius: 2px;
  padding: 5px 0px;
}

ul.options li {
  border: 1px solid #eee;
  padding: 5px;
  margin-bottom: 5px;
  border-radius: 4px;
  background: #eeeeee;
  position: relative;
}

li i.remove {
  display: none;
  position: absolute;
  right: -23px;
  top: 0;
  color: #ff5722;
  cursor: pointer;
  padding: 10px 5px;
}

li:hover i.remove {
  display: initial;
}

ul.options input {
  border: none;
  padding: 5px;
  margin: 0 5px 0 0;
  width: 120px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

ul.options input[type="number"] {
  width: 55px;
}

ul.options .inner {
  display: flex;
  align-items: center;
}

ul.options .inner i {
  padding: 3px 10px;
  margin: 0 2px;
  cursor: pointer;
}

ul.options .inner i:hover {
  background: #ddd;
  border-radius: 2px;
}

.index {
  font-weight: bold;
  font-family: "Agency FB";
  width: 17px;
  text-align: center;
}

legend {
  text-indent: 10px;
}

li.add {
  text-align: center;
  cursor: pointer;
}

p {
  margin-left: 2em;
}

p i {
  color: #ff9800;
  margin-right: 5px;
}

i.price {
  position: absolute;
  right: 0;
  color: #656565;
  cursor: pointer;
  padding: 5px 9px;
}
</style>