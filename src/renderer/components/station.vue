<template>
  <div class="popupMask center">
    <div class="welcome">
      <div class="banner"></div>
      <div class="wrap">
        <h3>Welcome to your new Station</h3>
        <p class="intro">Thank you for choosing United POS.</p>
        <p class="intro">If you experiencing any difficult moment, please do not hesitate to contact us.</p>
        <input type="text" v-model="station.alias" placeholder="Please Enter Station Name">
        <p class="copyleft">2017-2018 United POS Inc.</p>
      </div>
      <footer>
        <button class="btn" @click="confirm" :disabled="!station.alias">{{$t('button.done')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
import preset from "../preset";
import Electron from "electron";
export default {
  props: ["reg"],
  data() {
    return {
      station: null
    };
  },
  created() {
    const { mac, username } = this.reg;
    this.station = preset.station(mac, username);
  },
  methods: {
    confirm() {
      this.$socket.emit("[STATION] ATTACHED", this.station, () =>
        Electron.ipcRenderer.send("Relaunch")
      );
    }
  }
};
</script>

<style scoped>
.welcome {
  background: #f5f5f5;
  text-align: center;
  box-shadow: 0 24px 38px 3px rgba(0, 0, 0, 0.14),
    0 9px 46px 8px rgba(0, 0, 0, 0.12), 0 11px 15px -7px rgba(0, 0, 0, 0.2);
}
.banner {
  background: url("../assets/image/welcome.png");
  background-size: cover;
  height: 150px;
  width: 550px;
}

h3 {
  padding: 35px 0 20px;
}

.intro {
  width: 400px;
  margin: auto;
  padding-bottom: 10px;
}

input {
  border: 2px solid #ddd;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
  font-size: 20px;
  padding: 5px;
  outline: none;
  margin: 5px 0 25px;
}

footer {
  background: #fff;
  border-top: 1px solid #eee;
  text-align: right;
}

.copyleft {
  color: rgba(0, 0, 0, 0.75);
}
</style>