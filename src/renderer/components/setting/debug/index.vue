<template>
    <div>
        <button class="command" @click="open('Network Diagnostics')">Network Diagnostics</button>
        <button class="command" @click="open('Add Printer')">Add Printer</button>
    </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    open(command) {
      return;
      const { exec } = this.$electron.remote.require("child_process");

      switch (command) {
        case "Network Diagnostics":
          exec(
            "%windir%system32Rundll32.exe ndfapi,NdfRunDllDiagnoseIncident",
            err => {
              console.log(err);
            }
          );
          break;
        case "Add Printer":
          exec(
            "%windir%system32\rundll32.exe printui.dll,PrintUIEntry /il",
            err => {
              console.log(err);
            }
          );
        case "Task Scheduler":
          exec("%windir%system32mmc.exe %windir%system32\taskschd.msc");
          break;
        case "Disk Cleanup":
          exec("%windir%system32cleanmgr.exe");
          break;
        case "Disk Defragmenter":
          exec("%windir%system32dfrgui.exe");
          break;
        case "System Properties":
          exec("%windir%system32SystemPropertiesAdvanced.exe");
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
  justify-content: center;
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
</style>
