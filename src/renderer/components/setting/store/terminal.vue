<template>
  <div>
    <div class="tab-content">
      <header class="nav">
        <div class="title">
          <h3>{{$t("title.terminalDevice")}}</h3>
        </div>
        <nav>
          <span class="add" @click="create">{{$t('button.new')}}</span>
        </nav>
      </header>
      <table class="setting">
        <thead>
          <tr>
            <th>{{$t('thead.name')}}</th>
            <th>{{$t('thead.location')}}</th>
            <th>{{$t('thead.IP')}}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(device,index) in devices" :key="index">
            <td>{{device.alias}}
              <span class="model">({{device.model}})</span>
            </td>
            <td>{{device.location}}</td>
            <td>{{device.ip}}</td>
            <td class="opt" @click="edit(device,index)">
              <i class="fa fa-ellipsis-v"></i>
            </td>
          </tr>
        </tbody>
      </table>
      <div :is="component" :init="componentData"></div>
    </div>
  </div>
</template>

<script>
import editor from "./editor/device";
import toggle from "../common/toggle";

export default {
  components: { toggle, editor },
  data() {
    return {
      componentData: null,
      component: null,
      devices: []
    };
  },
  beforeRouteEnter: (to, from, next) => {
    appSocket.emit("[TERMINAL] DEVICE", data => {
      next(vm => {
        vm.devices = data;
      });
    });
  },
  methods: {
    create() {
      const device = {
        alias: "",
        model: "",
        ip: "",
        port: "",
        sn: "",
        location: "",
        print: true
      };

      this.edit(device);
    },
    edit(device, index) {
      new Promise((resolve, reject) => {
        this.componentData = {
          resolve,
          reject,
          device,
          devices: this.devices,
          edit: !!device._id
        };
        this.component = "editor";
      })
        .then(update =>
          this.$socket.emit("[TERMINAL] UPDATE", update, () =>
            this.refreshData()
          )
        )
        .catch(deleteDevice => {
          this.exitComponent();

          if (deleteDevice) {
            this.$socket.emit("[TERMINAL] REMOVE", device._id);
            this.devices.splice(index, 1);
          }
        });
    },
    refreshData() {
      this.$socket.emit("[TERMINAL] DEVICE", devices => {
        this.devices = devices;
        this.exitComponent();
      });
    }
  }
};
</script>

<style scoped>
.model {
  margin-left: 5px;
  color: #656565;
}
</style>