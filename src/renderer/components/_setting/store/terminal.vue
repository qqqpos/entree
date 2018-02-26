<template>
    <div>
        <header>
            <h1>{{$t('title.terminalDeviceManagement')}}</h1>
            <div class="summary">
                <div>Existing device: {{terminals.length}}</div>
                <div>Running device: 0</div>
            </div>
        </header>
        <ul>
            <li v-for="(terminal,index) in terminals" :key="index" @click="edit(terminal)">
                <div class="wrap">
                    <i class="fa fa-tablet"></i>
                    <span class="model">{{terminal.model}}</span>
                    <span class="ip">{{terminal.ip}}</span>
                    <span class="status"></span>
                </div>
                <div class="name">{{terminal.name}}</div>
            </li>
            <li @click="add">
                <div class="wrap">
                    <i class="fa fa-plus"></i>
                </div>
                <div class="name">{{$t('button.new')}}</div>
            </li>
        </ul>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import editor from "./component/terminalEditor";
export default {
  props: ["init"],
  components: { editor },
  computed: {
    ...mapGetters(["terminals"])
  },
  data() {
    return {
      componentData: null,
      component: null
    };
  },
  methods: {
    edit(device) {
      this.$p("editor", {
        device,
        edit: true
      });
    },
    add() {
      let device = {
        name: "Terminal" + (this.terminals.length + 1),
        model: "",
        ip: "",
        port: "",
        sn: ""
      };
      this.$p("editor", { device, edit: false });
    }
  }
};
</script>

<style scoped>
header {
  padding: 25px 45px 0;
  background: #eee;
}

h1 {
  font-size: 34px;
  color: #37474f;
  font: bold 36px/50px "Microsoft Yahei";
}

.summary {
  color: #666;
  padding: 15px;
}

ul {
  display: flex;
  padding: 20px;
  height: 557px;
}

li {
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 140px;
  height: 150px;
  margin: 5px 10px;
  box-shadow: var(--shadow);
  background: #fff;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

i {
  font-size: 5em;
  margin-top: 10px;
  color: #424242;
}

.ip {
  color: #3c3c3c;
}

.name {
  width: 100%;
  background: #f5f5f5;
  border-radius: 0 0 4px 4px;
  text-align: center;
}

.f1 {
  display: flex;
  align-items: center;
  padding: 0 25px;
}
</style>