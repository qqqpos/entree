<template>
    <div>
        <section class="card">
            <header>{{$t('setting.station')}}
                <span class="tip"></span>
            </header>
            <article>
                <smart-input v-model="workStation.alies" reg="^[a-zA-Z0-9_. ]{2,10}$" label="text.name"></smart-input>
                <smart-input v-model="workStation.mac" label="text.mac" :disable="true"></smart-input>
                <smart-switch v-model="workStation.wol" label="text.autoAwake"></smart-switch>
                <smart-switch v-model="workStation.receiveOnlineOrder" label="text.receiveOnlineOrder"></smart-switch>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.terminal')}}
                <span class="tip">{{$t('tip.terminal.integration')}}</span>
            </header>
            <article>
                <smart-switch v-model="workStation.terminal.enable" label="text.enable"></smart-switch>
                <smart-option v-model="workStation.terminal.model" :options="devices" label="text.model"></smart-option>
                <smart-input v-model="workStation.terminal.address" reg="^[0-9. ]{3,}$" label="text.ipAddress" @dblclick.native="searchTool"></smart-input>
                <smart-input v-model="workStation.terminal.port" reg="^[a-zA-Z0-9_. ]{2,10}$" label="text.port"></smart-input>
                <smart-input v-model="workStation.terminal.sn" label="text.authCode"></smart-input>
                <smart-switch v-model="workStation.terminal.report" label="text.report" tip="tip.reportBeforeBatch"></smart-switch>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.poleDisplay')}}
                <span class="tip">{{$t('setting.poleDisplayTip')}}</span>
            </header>
            <article>
                <smart-switch v-model="workStation.pole.enable" label="text.enable"></smart-switch>
                <smart-option v-model="workStation.pole.port" label="text.port" :options="ports"></smart-option>
                <smart-input v-model="workStation.pole.top" label="text.firstLine" :disable="!workStation.pole.enable"></smart-input>
                <smart-input v-model="workStation.pole.btm" label="text.secondLine" :disable="!workStation.pole.enable"></smart-input>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.scale')}}</header>
            <article>
                <smart-switch v-model="workStation.scale.enable" label="text.enable"></smart-switch>
                <smart-option v-model="workStation.scale.port" label="text.port" :options="ports"></smart-option>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.callerId')}}</header>
            <article>
                <smart-switch v-model="workStation.callid.enable" label="text.enable"></smart-switch>
                <smart-option v-model="workStation.callid.port" label="text.port" :options="ports"></smart-option>
                <smart-option v-model="workStation.callid.command" :options="commands" label="text.command"></smart-option>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.security')}}</header>
            <article>
                <smart-switch v-model="workStation.doneLock" label="text.doneLock" tip="tip.lockWhenCompleteOrder"></smart-switch>
                <smart-range v-model.number="workStation.timeout" label="text.inactiveLock" min="0" max="600" step="30"></smart-range>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.printer')}}</header>
            <article>
                <smart-option v-model="workStation.printer" label="text.receiptPrinter" :options="printers"></smart-option>
                <div class="options">
                  <label class="center">{{$t('text.stationPrinters')}}</label>
                  <div class="wrap">
                    <checkbox v-model="workStation.printerGroup" :val="device" :label="device" :multiple="true" v-for="(device,index) in printerGroup" :key="index"></checkbox>
                  </div>
                </div>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.cashDrawer')}}</header>
            <article>
                <smart-switch v-model="workStation.cashDrawer.enable" label="text.enable"></smart-switch>
                <smart-input v-model="workStation.cashDrawer.name" label="text.name" :disable="!workStation.cashDrawer.enable"></smart-input>
                <smart-option v-model="workStation.cashDrawer.bind" label="text.binding" :options="printers"></smart-option>
                <smart-switch v-model="workStation.cashDrawer.cashFlowCtrl" label="text.cashFlowCtrl"></smart-switch>
                <smart-input v-model="workStation.cashDrawer.initialAmount" label="text.initialAmount" :disable="!workStation.cashDrawer.cashFlowCtrl"></smart-input>
            </article>
        </section>
        <section class="card">
            <header>{{$t('text.ui')}}</header>
            <article>
                <smart-switch v-model="workStation.enlargeTitle" label="text.enlargeTitle"></smart-switch>
            </article>
                <draggable v-model="workStation.interface" :options="dragtions">
                    <transition-group tag="article" class="grid" :class="{enlarge:workStation.enlargeTitle}">
                        <div v-for="(grid,index) in workStation.interface" :key="index" class="block" @click="edit(grid,index)" :class="{disable:!grid.enable}">
                            <i class="fa icon" :class="[grid.icon]"></i>
                            <h1>{{grid.head}}</h1>
                            <h4>{{grid.subhead}}</h4>
                        </div>
                    </transition-group>
                </draggable>
        </section>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import search from "./search";
import editor from "./uiEditor";
import draggable from "vuedraggable";
import checkbox from "../common/checkbox";
import smartInput from "../common/smartInput";
import smartRange from "../common/smartRange";
import smartSwitch from "../common/smartSwitch";
import smartOption from "../common/smartOption";

export default {
  components: {
    checkbox,
    smartInput,
    smartRange,
    smartSwitch,
    smartOption,
    editor,
    search,
    draggable
  },
  created() {
    this.workStation = JSON.parse(JSON.stringify(this.station));
    this.printers = Object.keys(this.config.printer);
    this.printerGroup = this.printers.filter(name => !/cashier/i.test(name));
    //patch
    !this.workStation.hasOwnProperty("printerGroup") &&
      Object.assign(this.workStation, { printerGroup: this.printerGroup });
  },
  data() {
    return {
      change: false,
      component: null,
      componentData: null,
      workStation: null,
      devices: ["SP30", "S80", "S300", "NX2200"],
      ports: [
        "COM1",
        "COM2",
        "COM3",
        "COM4",
        "COM5",
        "COM6",
        "COM7",
        "COM8",
        "COM9"
      ],
      commands: ["AT#CID=1", "AT+VCID=1", "AT%CCID=1"],
      printers: [],
      printerGroup: [],
      dragtions: {
        animation: 300,
        ghostClass: "ghost"
      }
    };
  },
  methods: {
    edit(ui, index) {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, ui };
        this.component = "editor";
      })
        .then(result => {
          this.workStation.interface.splice(index, 1, result);
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    },
    searchTool() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "search";
      })
        .then(data => {
          let { address, port, model, sn } = data;
          this.workStation.terminal = Object.assign(
            {},
            this.workStation.terminal,
            {
              enable: true,
              address,
              model,
              port,
              sn
            }
          );
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    },
    update(data) {
      this.workStation.print = data;
    }
  },
  watch: {
    workStation: {
      handler(n) {
        let keys = Object.keys(n);
        let isChanged = keys.some(key => {
          return typeof n[key] === "string"
            ? n[key] !== this.station[key]
            : JSON.stringify(n[key]) !== JSON.stringify(this.station[key]);
        });
        if (isChanged) {
          let stations = Object.keys(this.store.station);
          let index = stations.findIndex(
            key => this.store.station[key].mac === n.mac
          );
          let name = stations[index];
          let store = JSON.parse(JSON.stringify(this.store));
          store.station[name] = n;
          this.$emit("change", store);
        } else {
          this.$emit("unchanged");
        }
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters(["config", "store", "station"])
  }
};
</script>

<style scoped>
.grid {
  display: flex;
  flex-wrap: wrap;
  background: #eceff1;
}

.block {
  width: 175px;
  margin: 1px;
  padding: 35px 20px 15px;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #333;
  position: relative;
  cursor: pointer;
}

.block:nth-child(4n) {
  border-right: none;
}

.icon {
  position: absolute;
  right: 0;
  top: 0px;
  padding: 10px 15px;
}

.enlarge h1 {
  font-size: 2em;
  font-weight: normal;
}

.block h4 {
  font-weight: normal;
  color: gray;
}

.disable {
  color: #f5f5f5;
}

.disable h4 {
  color: #f5f5f5;
}

.options {
  align-items: center;
  padding: 5px 0;
  display: flex;
}
.options .wrap {
  display: flex;
}
.options label {
  width: 130px;
  padding-right: 20px;
  text-align: right;
  color: #666;
}
</style>