<template>
    <div>
        <button class="command" @click="open('Network Diagnostics')"><i class="fas fa-signal"></i>Network Diagnostics</button>
        <button class="command" @click="open('Add Printer')"><i class="fas fa-print"></i>Add Printer</button>
        <button class="command" @click="open('Task Scheduler')"><i class="fas fa-tasks"></i>Task Scheduler</button>        
        <button class="command" @click="open('Disk Cleanup')"><i class="fas fa-hdd"></i>Disk Cleanup</button>  
        <button class="command" @click="open('Disk Defragmenter')"><i class="fas fa-coins"></i>Disk Defragmenter</button>  
        <button class="command" @click="open('Network Connections')"><i class="fas fa-bezier-curve"></i>Network Connections</button>          
        <button class="command" @click="open('Battery')"><i class="fas fa-battery-three-quarters"></i>Battery</button>         
        <button class="command" @click="open('Screen Saver')"><i class="fas fa-desktop"></i>Screen Saver</button> 
    </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    open(command) {
      const path = require("path");
      const dir = path.dirname(process.env.COMSPEC);
      const { exec, spawn } = this.$electron.remote.require("child_process");

      switch (command) {
        case "Network Diagnostics":
          spawn(path.join(dir, "rundll32.exe"), [
            "ndfapi,NdfRunDllDiagnoseIncident"
          ]);
          break;
        case "Add Printer":
          spawn(path.join(dir, "rundll32.exe"), [
            "printui.dll,PrintUIEntry",
            "/il"
          ]);
          break;
        case "Task Scheduler":
          spawn(path.join(dir, "control.exe"), ["schedtasks"]);
          break;
        case "Disk Cleanup":
          spawn(path.join(dir, "cleanmgr.exe"));
          break;
        case "Disk Defragmenter":
          spawn(path.join(dir, "dfrgui.exe"));
          break;
        case "Network Connections":
          spawn(path.join(dir, "control.exe"), ["netconnections"]);
          break;
        case "Battery":
          spawn(path.join(dir, "control.exe"), ["powercfg.cpl,,3"]);
          break;
        case "Screen Saver":
          spawn(path.join(dir, "control.exe"), [
            "desk.cpl,screensaver,@screensaver"
          ]);
          break;
      }
    }
  }
};
</script>

<style scoped>
div {
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
}
.command {
  padding: 15px 20px;
  width: 200px;
  margin: 10px 5px;
  border-radius: 4px;
  background: linear-gradient(to bottom, #fff 0%, #e5e5e5 100%);
  border: none;
  box-shadow: 0 1px 3px #333;
}

i {
  display: block;
  margin-bottom: 10px;
}
</style>
