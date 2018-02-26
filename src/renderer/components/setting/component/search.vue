<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="editor">
      <header>
        <h3>{{$t('title.scanner')}}</h3>
      </header>
      <div class="wrap">
        <div class="search">
          <i class="fa fa-search"></i>
          <input type="text" v-model.number="port" @keydown.enter="scan">
          <i class="fa fa-times" @click="reset" v-show="port"></i>
        </div>
      </div>
      <ul class="results">
        <li v-for="(ip,index) in results" :key="index">
          <input type="radio" name="ip" v-model="target" :id="'ip'+index" :value="ip">
          <label :for="'ip'+index">
            <i class="fa fa-tablet"></i>
            <span>{{ip}}</span>
          </label>
        </li>
      </ul>
      <footer>
        <button class="btn" @click="scan" v-if="results.length === 0" :disabled="scanning">{{$t('button.scan')}}</button>
        <button class="btn" @click="confirm" v-else :disabled="initializing">{{$t('button.confirm')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      port: 10009,
      results: [],
      target: null,
      scanning: false,
      initializing: false
    };
  },
  methods: {
    scan() {
      this.scanning = true;
      this.$socket.emit("SCAN", this.port, ip => {
        this.results = ip;
        this.scanning = false;
      });
    },
    confirm() {
      this.initializing = true;

      const model = this.port === "10009" ? "S300" : "NX2200";
      const terminal = this.getParser().default();

      terminal.initial(this.target, this.port).then(response => {
        const device = terminal.check(response.data);
        device.code === "000000" &&
          this.init.resolve({
            ip: this.target,
            port: this.port,
            model: device.model,
            sn: device.sn
          });
      });
    },
    reset() {
      this.port = 10009;
      this.results = [];
      this.target = null;
      this.scanning = false;
      this.initializing = false;
    },
    getParser(model) {
      switch (model) {
        case "SP30":
        case "S80":
        case "S300":
          return require("../../payment/parser/pax.js");
        case "NX2200":
          return require("../../payment/parser/exadigm.js");
        default:
          return require("../../payment/parser/pax.js");
      }
    }
  }
};
</script>

<style scoped>
.search {
  padding: 0 10px;
  height: 35px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.25em;
  color: #3c3c3c;
}

input[type="text"] {
  flex: 1;
  width: auto;
  border: none;
  outline: none;
  padding: 5px 10px;
}

input[type="radio"] {
  display: none;
}

label {
  padding: 15px;
  background: #fff;
  margin: 3px 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

li {
  display: flex;
  flex-direction: column;
}

li input:checked + label {
  background: #009688;
  color: #fff;
}
</style>
