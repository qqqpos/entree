<template>
    <div class="printer">
        <section class="setting">
            <smart-option label="text.printer" v-model="device" :options="devices"></smart-option>
            <div class="wrap">
                <div class="config" v-if="profile">
                    <fieldset class="section">
                        <legend>{{$t('setting.printReceipt')}}</legend>
                        <div class="selection">
                            <checkbox v-model="profile.print.WALK_IN" label="type.WALK_IN"></checkbox>
                            <checkbox v-model="profile.print.PICK_UP" label="type.PICK_UP"></checkbox>
                            <checkbox v-model="profile.print.DELIVERY" label="type.DELIVERY"></checkbox>
                            <checkbox v-model="profile.print.DINE_IN" label="type.DINE_IN"></checkbox>
                            <checkbox v-model="profile.print.TO_GO" label="type.TO_GO"></checkbox>
                            <checkbox v-model="profile.print.BUFFET" label="type.BUFFET"></checkbox>
                            <checkbox v-model="profile.print.BAR" label="type.BAR"></checkbox>
                            <checkbox v-model="profile.print.SALES" label="type.SALES"></checkbox>
                            <checkbox v-model="profile.print.PRE_PAYMENT" label="type.PRE_PAYMENT"></checkbox>
                            <checkbox v-model="profile.print.PAYMENT" label="type.PAYMENT"></checkbox>
                            <checkbox v-model="profile.print.CREDITCARD" label="type.CREDIT_CARD"></checkbox>
                            <checkbox v-model="profile.print.DELAY" label="type.DELAY"></checkbox>
                        </div>
                    </fieldset>
                    <fieldset class="section">
                        <legend>{{$t('setting.printStyle')}}</legend>
                        <div class="selection">
                            <checkbox v-model="profile.control.printPrimary" label="setting.printPrimary" @input="togglePrimary"></checkbox>
                            <checkbox v-model="profile.control.printPrimaryPrice" label="setting.printPrice" @input="togglePrimaryPrice"></checkbox>
                            <smart-option v-model="profile.control.primaryFont" label="setting.font" :options="fonts"></smart-option>
                            <smart-range v-model="profile.control.primaryFontSize" label="setting.fontSize" min="10" max="40" step="1"></smart-range>
                            <checkbox v-model="profile.control.printSecondary" label="setting.printSecondary" @input="toggleSecondary"></checkbox>
                            <checkbox v-model="profile.control.printSecondaryPrice" label="setting.printPrice" @input="toggleSecondaryPrice"></checkbox>
                            <smart-option v-model="profile.control.secondaryFont" label="setting.font" :options="fonts"></smart-option>
                            <smart-range v-model="profile.control.secondaryFontSize" label="setting.fontSize" min="10" max="40" step="1"></smart-range>
                            <checkbox v-model="profile.control.sortItem" label="setting.sortItem"></checkbox>
                            <checkbox v-model="profile.control.printStore" label="setting.printStoreInfo" @input="toggleStore"></checkbox>
                            <checkbox v-model="profile.control.printType" label="setting.printOrderType" @input="toggleType"></checkbox>
                            <checkbox v-model="profile.control.printCustomer" label="setting.printCustomerInfo" @input="toggleCustomer"></checkbox>
                            <checkbox v-model="profile.control.printActionTime" label="setting.printActionTime"></checkbox>
                            <checkbox v-model="profile.control.printPayment" label="setting.printPayment" @input="togglePayment"></checkbox>
                            <checkbox v-model="profile.control.printSuggestion" label="setting.printTipSuggestion"></checkbox>
                            <checkbox v-model="profile.control.buzzer" label="setting.buzzer"></checkbox>
                            <checkbox v-model="profile.control.printMenuID" label="setting.printMenuID"></checkbox>
                            <checkbox v-model="profile.control.sortPriority" label="setting.sortPriority"></checkbox>
                        </div>
                    </fieldset>
                    <div class="settings-box">
                      <div class="contain">
                        <h5>{{$t('setting.doubleReceipt')}}</h5>
                        <div class="values">
                          <span class="value" v-for="(type,index) in profile.reprint" :key="index">{{$t('type.'+type)}}</span>
                        </div>
                      </div>
                      <div class="changer" @click="changeDoubleReceipt(doubleOptions)">{{$t('button.change')}}</div>
                    </div>
                    <div class="settings-box">
                      <div class="contain">
                        <h5>{{$t('setting.printMode')}}</h5>
                        <div class="values">
                          <span class="value">{{$t('tip.printMode.' + profile.control.printMode)}}</span>
                        </div>
                      </div>
                      <div class="changer" @click="changePrintMode(printModeOptions)">{{$t('button.change')}}</div>
                    </div>
                </div>
            </div>
            <footer>
                <div class="btn" @click="back">{{$t('button.back')}}</div>
                <button class="btn f1" @click="save" :disabled="unchanged">{{$t('button.save')}}</button>
            </footer>
        </section>
        <section class="preview">
            <div class="receipt">
                <header>
                    <div class="store" :class="{hide:!receipt.store}">
                        <h3>{{store.name}}</h3>
                        <h5>{{store.address}}</h5>
                        <h5>{{store.city}} {{store.state}} {{store.zipCode}}</h5>
                        <h5>{{store.contact}}</h5>
                    </div>
                    <div class="type" :class="{hide:!receipt.type}">
                        <p class="usEN" :style="style.usEN">DELIVERY</p>
                    </div>
                    <div class="time">
                        <span>Date: {{date}}</span>
                        <span>Time: {{time}}</span>
                        <div class="number">{{ticket.number}}</div>
                    </div>
                    <div class="server">
                        <p>
                            <span class="wrap">
                                <span class="text">Cashier:</span>
                                <span class="value">{{op.name}}</span>
                            </span>
                        </p>
                    </div>
                    <div class="customer" :class="{hide:!receipt.customer}">
                        <p>
                            <span class="text">Tel:</span>
                            <span class="value" :style="style.info">888.299.0524</span>
                        </p>
                        <p>
                            <span class="text">Addr:</span>
                            <span class="value" :style="style.info">50 Allen St</span>
                        </p>
                        <p>
                            <span class="text">City:</span>
                            <span class="value">New York</span>
                        </p>
                        <p>
                            <span class="text">Name:</span>
                            <span class="value">United POS Inc.</span>
                        </p>
                    </div>
                </header>
                <section class="body">
                    <p class="list" :style="style.zhCN">
                        <span class="qty">2</span>
                        <span class="itemWrap">
                            <span class="item">芥兰鸡
                                <span class="mark"></span>
                            </span>
                            <span class="side">[ 小 ]
                                <span class="mark"></span>
                            </span>
                        </span>
                        <span class="price" :class="{hide:!receipt.primaryPrice}">12.59</span>
                    </p>
                    <p class="list" :style="style.usEN">
                        <span class="qty">2</span>
                        <span class="itemWrap">
                            <span class="item">Chicken Broccoli
                                <span class="mark"></span>
                            </span>
                            <span class="side">[ Pt. ]
                                <span class="mark"></span>
                            </span>
                        </span>
                        <span class="price" :class="{hide:!receipt.secondaryPrice}">12.59</span>
                    </p>
                    <p class="list mark" :style="style.zhCN">
                        <span class="qty"></span>
                        <span class="itemWrap">
                            <span class="item">炸鸡翅
                                <span class="mark">SPK</span>
                            </span>
                            <span class="side">[ 薯条 ]
                                <span class="mark">K</span>
                            </span>
                        </span>
                        <span class="price" :class="{hide:!receipt.primaryPrice}">5.99</span>
                    </p>
                    <p class="list mark" :style="style.usEN">
                        <span class="qty"></span>
                        <span class="itemWrap">
                            <span class="item">Fried Chicken Wing
                                <span class="mark">SPK</span>
                            </span>
                            <span class="side">[ F.F. ]
                                <span class="mark">K</span>
                            </span>
                        </span>
                        <span class="price" :class="{hide:!receipt.secondaryPrice}">5.99</span>
                    </p>
                </section>
                <div class="payment" :class="{hide:!receipt.payment}">
                    <p>
                        <span class="text">Subtotal:</span>
                        <span class="value">18.58</span>
                    </p>
                    <p>
                        <span class="text">Tax:</span>
                        <span class="value">1.63</span>
                    </p>
                    <p class="bold">
                        <span class="text">TOTAL:</span>
                        <span class="value">20.21</span>
                    </p>
                </div>
                <div class="footer">
                    Thank You Very Much
                </div>
            </div>
            <aside class="action">
                <i class="fa fa-plus" @click="addPrinter"></i>
                <i class="fa fa-trash" @click="removePrinterConfirm"></i>
                <i class="fa fa-print" @click="test"></i>
                <i class="fa fa-volume-up" @click="buzzer"></i>
            </aside>
        </section>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import smartOption from "../common/smartOption";
import smartRange from "../common/smartRange";
import dialoger from "../../common/dialoger";
import selector from "../common/selector";
import checkbox from "../common/checkbox";
import Preset from "../../../preset";
import editor from "./editor";
export default {
  components: { smartOption, smartRange, checkbox, dialoger, editor, selector },
  created() {
    this.initial();
  },
  data() {
    return {
      fonts: [
        {
          label: "Agency FB (English)",
          value: "Agency FB"
        },
        {
          label: "Tahoma (English)",
          value: "Tahoma"
        },
        {
          label: "Tensentype RuiHeiJ-W2 (English)",
          value: "Tensentype RuiHeiJ-W2"
        },
        {
          label: "Trebuchet MS (English)",
          value: "Trebuchet MS"
        },
        {
          label: "Noto Mono (English)",
          value: "Noto Mono"
        },
        {
          label: "Futura LT Condensed (English)",
          value: "Futura LT Condensed"
        },
        {
          label: "Roboto Condensed (English)",
          value: "Roboto Condensed"
        },
        {
          label: "Noto Sans SC Light (中文)",
          value: "Noto Sans SC Light"
        },
        {
          label: "QingYuan (中文)",
          value: "QingYuan"
        }
      ],
      time: moment()
        .locale("en")
        .format("hh:mm a"),
      date: moment().format("MM-DD-YYYY"),
      componentData: null,
      profile: undefined,
      component: null,
      printers: null,
      devices: [],
      device: null,
      unchanged: true,
      preset: "",
      receipt: {
        zhCN: true,
        usEN: true,
        store: true,
        type: true,
        customer: true,
        primaryPrice: false,
        secondaryPrice: true,
        payment: true,
        tip: true,
        coupon: true
      },
      style: {
        zhCN: null,
        usEN: null,
        info: null
      },
      doubleOptions: [
        { label: this.$t("type.WALK_IN"), value: "WALK_IN", tooltip: "" },
        { label: this.$t("type.PICK_UP"), value: "PICK_UP", tooltip: "" },
        { label: this.$t("type.DELIVERY"), value: "DELIVERY", tooltip: "" },
        { label: this.$t("type.DINE_IN"), value: "DINE_IN", tooltip: "" },
        { label: this.$t("type.BAR"), value: "BAR", tooltip: "" },
        { label: this.$t("type.BUFFET"), value: "BUFFET", tooltip: "" },
        { label: this.$t("type.SALES"), value: "SALES", tooltip: "" }
      ],
      printModeOptions: [
        {
          label: this.$t("print.normal"),
          value: "normal",
          tooltip: "tip.printMode.normal"
        },
        {
          label: this.$t("print.difference"),
          value: "difference",
          tooltip: "tip.printMode.difference"
        },
        {
          label: this.$t("print.new"),
          value: "new",
          tooltip: "tip.printMode.new"
        },
        {
          label: this.$t("print.todo"),
          value: "todo",
          tooltip: "tip.printMode.todo"
        }
      ]
    };
  },
  methods: {
    initial() {
      this.printers = JSON.parse(JSON.stringify(this.config.printer));
      this.devices = Object.keys(this.printers) || [""];
    },
    buzzer() {
      if (!this.device) return;
      Printer.buzzer(this.device);
    },
    test() {
      Printer.testPage(this.device);
    },
    back() {
      this.$router.push({ name: "Setting.index" });
    },
    togglePrimary(bool) {
      this.receipt.zhCN = bool;
    },
    toggleSecondary(bool) {
      this.receipt.usEN = bool;
    },
    toggleStore(bool) {
      this.receipt.store = bool;
    },
    toggleType(bool) {
      this.receipt.type = bool;
    },
    toggleCustomer(bool) {
      this.receipt.customer = bool;
    },
    togglePrimaryPrice(bool) {
      this.receipt.primaryPrice = bool;
    },
    toggleSecondaryPrice(bool) {
      this.receipt.secondaryPrice = bool;
    },
    togglePayment(bool) {
      this.receipt.payment = bool;
    },
    removePrinterConfirm() {
      this.device &&
        this.$dialog({
          type: "question",
          title: "dialog.printerRemoveConfirm",
          msg: ["dialog.printerRemoveConfirmTip", this.device]
        })
          .then(() => {
            this.remove(this.device);
          })
          .catch(() => {
            this.$q();
          });
    },
    remove(printer) {
      this.$socket.emit("[CMS] REMOVE_PRINTER", printer);
      this.removePrinter(printer);
      this.device = null;
      this.initial();
      this.$q();
    },
    save() {
      if (!this.device) return;
      this.unchanged = true;
      this.$socket.emit("[CMS] SAVE_PRINTERS", { [this.device]: this.profile });
      this.setPrinter({ [this.device]: this.profile });
      Printer.initial(CLODOP, this.config);
    },
    configPrinter() {
      //http://192.168.0.87/tcpip_cfg.htm?
      //dhcp_mode=0&IP_1=192&IP_2=168&IP_3=0&IP_4=85&
      //MASK_1=255&MASK_2=255&MASK_3=255&MASK_4=0&
      //GW_IP_1=192&GW_IP_2=168&GW_IP_3=0&GW_IP_4=1&
      //__use_dhcp=0&save=+Save+
    },
    addPrinter() {
      this.openEditor()
        .then(this.askAssign)
        .catch(() => {
          this.$q();
        });
    },
    openEditor() {
      return new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "editor";
      });
    },
    changeDoubleReceipt(options) {
      if (!this.profile.reprint) {
        //hot patch
        this.profile.reprint = [];

        Object.keys(this.profile.double).forEach(type => {
          if (this.profile.double[type] === true)
            this.profile.reprint.push(type);
        });
      }

      new Promise((resolve, reject) => {
        this.componentData = {
          resolve,
          reject,
          options,
          type: "checkbox",
          defaultValue: this.profile.reprint
        };
        this.component = "selector";
      })
        .then(value => {
          this.profile.reprint = value;
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    },
    changePrintMode(options) {
      new Promise((resolve, reject) => {
        this.componentData = {
          resolve,
          reject,
          options,
          type: "radio",
          defaultValue: this.profile.control.printMode
        };
        this.component = "selector";
      })
        .then(value => {
          console.log(value);
          this.profile.control.printMode = value;
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    },
    askAssign(printer) {
      let profile = Preset.printer();
      printer.label && (profile.label = true);
      let printers = Object.assign({}, this.config.printer, {
        [printer.name]: profile
      });
      this.setPrinter(printers);
      this.initial();
      this.$socket.emit("[CMS] SAVE_PRINTERS", printers);
      this.$dialog({
        type: "question",
        title: "dialog.assignPrinter",
        msg: ["dialog.assignPrinterToAllItems", printer.name],
        buttons: [
          { text: "button.cancel", fn: "reject" },
          { text: "button.apply", fn: "resolve" }
        ]
      })
        .then(() => {
          this.$socket.emit("[CMS] ASSIGN_PRINTER_TO_ITEMS", printer.name);
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    },
    ...mapActions(["setPrinter", "removePrinter"])
  },
  watch: {
    device(profile) {
      this.profile = this.printers[profile];
      let { control } = this.profile;
      Object.assign(this.receipt, {
        zhCN: control.printPrimary,
        usEN: control.printSecondary,
        store: control.printStore,
        type: control.printType,
        customer: control.printCustomer,
        primaryPrice: control.printPrimaryPrice,
        secondaryPrice: control.printSecondaryPrice,
        payment: control.printPayment,
        tip: control.printSuggestion,
        coupon: control.printCoupon
      });
    },
    profile: {
      handler(n) {
        if (n.hasOwnProperty("control")) {
          let {
            printPrimary,
            primaryFont,
            primaryFontSize,
            printSecondary,
            secondaryFont,
            secondaryFontSize,
            enlargeDetail
          } = n.control;
          this.style = {
            zhCN: {
              "font-family": primaryFont,
              "font-size": primaryFontSize + "px",
              display: printPrimary ? "flex" : "none"
            },
            usEN: {
              "font-family": secondaryFont,
              "font-size": secondaryFontSize + "px",
              display: printSecondary ? "flex" : "none"
            },
            info: {
              "font-family": enlargeDetail
                ? "Tensentype RuiHeiJ-W2"
                : "Agency FB",
              "font-size": enlargeDetail ? "1.25em" : "1em"
            }
          };
        }
        this.unchanged = false;
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters(["op", "config", "store", "ticket"])
  }
};
</script>

<style scoped>
.printer {
  display: flex;
  height: 100%;
}

.section .selection {
  display: flex;
  flex-wrap: wrap;
}

.input {
  align-items: center;
  margin: 6px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

fieldset {
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 2px;
  margin: 5px;
  padding: 5px 0;
}

legend {
  margin-left: 10px;
}

section.setting {
  background: rgba(238, 238, 238, 0.57);
  width: 360px;
  display: flex;
  flex-direction: column;
}

.wrap,
.config {
  flex: 1;
}

.selection .input {
  width: 325px;
}

.range {
  width: 339px;
  font-size: 13px;
  border-bottom: 1px dashed #ccc;
  padding-bottom: 5px;
  margin-bottom: 5px;
}

.range label {
  width: 100px;
}

.preview {
  flex: 1;
  background: #525659;
  box-shadow: inset 5px 0 35px -8px rgba(0, 0, 0, 0.62);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.receipt {
  background: #fff;
  width: 290px;
  padding: 45px 15px 20px;
  box-shadow: 0px 0 25px rgba(0, 0, 0, 0.62);
}

footer {
  display: flex;
  margin-bottom: 5px;
}

.btn {
  margin: 0 5px;
}

.receipt header {
  text-align: center;
  font-family: "Agency FB";
}

.receipt h3 {
  font-size: 22px;
  font-weight: bold;
}

.receipt h5 {
  font-size: 16px;
  font-weight: lighter;
}

.receipt .type {
  margin: 12px;
}

.receipt .type p {
  justify-content: center;
  align-content: center;
}

.receipt .time {
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #9e9e9e;
  position: relative;
}

.receipt .time span {
  margin: 0 10px;
}

.receipt .time .number {
  position: absolute;
  right: 10px;
  bottom: 12px;
  font-size: 2em;
  font-weight: bold;
}

.server p {
  text-align: left;
  padding: 0 10px;
  border-bottom: 1px solid gray;
}

.receipt .customer {
  text-align: left;
  padding: 2px 10px;
  border-bottom: 1px solid gray;
}

.receipt .customer .text {
  display: inline-block;
  width: 40px;
}

p.list {
  display: flex;
}

p.list .qty {
  width: 35px;
  text-align: center;
}

section.body {
  padding: 10px 10px 15px 0;
}

p.mark {
  margin-top: 10px;
}

.itemWrap .mark {
  position: absolute;
  left: 0;
  right: 0;
  top: -11px;
  text-align: center;
  font-size: 12px;
}

.itemWrap > span {
  position: relative;
}

.price {
  flex: 1;
  text-align: right;
}

.payment {
  font-family: "Agency FB";
  text-align: right;
  padding: 0 10px;
}

.payment .value {
  display: inline-block;
  width: 40px;
}

.payment .bold {
  font-weight: bolder;
  font-size: 1.25em;
}

.footer {
  text-align: center;
  border-top: 1px solid gray;
  margin-top: 10px;
  padding-top: 5px;
}

.hide {
  display: none;
}

aside.action {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  padding: 30px;
  opacity: 0;
  transition: opacity 0.22s ease;
}

.action i {
  width: 45px;
  height: 45px;
  line-height: 45px;
  text-align: center;
  display: block;
  box-shadow: 0 2px 5px 0 rgba(22, 45, 61, 0.58);
  border-radius: 50%;
  background: linear-gradient(to bottom, white 0%, #eeeeee 100%);
  color: #5f5d5d;
  margin-bottom: 15px;
  cursor: pointer;
}

section.preview:hover .action {
  opacity: 1;
}

.selection > div {
  min-width: 90px;
}

/*new style*/
.settings-box {
  border: 1px solid #ccc;
  margin: 5px;
  border-radius: 2px;
  background: #fff;
  padding: 8px 0 8px 8px;
  display: flex;
}

.settings-box .contain {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #bdbdbd;
}

.settings-box h5 {
  font-size: 16px;
  font-weight: normal;
}

.settings-box .values {
  flex: 1;
  align-items: center;
  display: flex;
  padding: 3px 0;
  color: #03a9f4;
  min-height: 18px;
  flex-wrap: wrap;
}

.settings-box .changer {
  display: flex;
  align-items: center;
  margin: 0 5px;
  cursor: pointer;
  width: 55px;
  justify-content: center;
  transition: background 0.2ms ease;
}
.changer:hover {
  background: #f3f3f3;
  border-radius: 4px;
}
.changer:active {
  background: #eee;
}
.values .value {
  margin-right: 5px;
}
</style>