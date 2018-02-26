<template>
    <div>
        <header class="nav">
            <div class="back" @click="save">
            <i class="fa fa-chevron-left"></i>
            </div>
            <div class="title"><h3>{{$t('setting.printerGroup')}}</h3></div>
            <nav>
              <span @click="setAll" v-if="devices.length === 0">{{$t('button.setAll')}}</span>
              <span @click="unsetAll" v-else>{{$t('button.unset')}}</span>
            </nav>
        </header>
        <ul class="multiple">
            <li v-for="(printer,index) in printers" :key="index">
                <checkbox :val="printer" :multiple="true" :title="printer" v-model="devices"></checkbox>
            </li>
        </ul>
    </div>
</template>

<script>
import checkbox from "../../common/checkbox";
export default {
  components: { checkbox },
  data() {
    return {
      printers: Object.keys(this.$store.getters.config.printers).filter(
        name => !/cashier/i.test(name)
      ),
      devices: this.$store.getters.station.printers
    };
  },
  methods: {
    setAll() {
      this.devices = this.printers.slice();
    },
    unsetAll() {
      this.devices = [];
    },
    save() {
      this.$socket.emit("[STATION] UPDATE", {
        _id: this.$store.getters.station._id,
        key: "printers",
        value: this.devices
      });
      this.$router.push({ name: "Setting.station" });
    }
  }
};
</script>

<style scoped>
li {
  display: flex;
  border-bottom: 1px solid #eee;
}
</style>