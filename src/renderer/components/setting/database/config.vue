<template>
    <div>
        <div class="tab-content">
        <header class="nav">
            <div class="title">
                <h3>{{$t('setting.title.database')}}</h3>
            </div>
        </header>  
            <toggle title="database.index" v-model="database.index" @input="toggleIndex"></toggle>
            <toggle title="database.autoBackup" v-model="database.backup" @input="updateBackup">
              <transition name="dropdown">
                <div v-if="database.backup" class="opt">
                  <external title="tip.databaseBackupPath" @open="showDialog">
                    <p slot="value" class="value">{{database.backupPath}}</p>
                  </external>
                </div>
              </transition>
            </toggle>
        </div>
    </div>
</template>

<script>
import toggle from "../common/toggle";
import external from "../common/external";

export default {
  components: { toggle, external },
  data() {
    return {
      database: {}
    };
  },
  created() {
    this.database = this.$store.getters.config.database || {
      index: false,
      backup: false,
      backupPath: ""
    };
  },
  methods: {
    update(data) {
      this.$socket.emit("[CONFIG] UPDATE", data);
    },
    toggleIndex(enable) {
      this.update({
        key: "database.index",
        value: enable
      });

      enable && this.$socket.emit("[DATABASE] INDEX", { ALL: true });
    },
    updateBackup(value) {
      this.update({
        key: "database.backup",
        value
      });
    },
    showDialog() {
      const { dialog } = this.$electron.remote;

      const directory = dialog.showOpenDialog({
        properties: ["openFile", "openDirectory"]
      });

      this.update({
        key: "database",
        value: Object.assign(this.database, { backupPath: directory[0] })
      });
    }
  }
};
</script>

<style scoped>
</style>


