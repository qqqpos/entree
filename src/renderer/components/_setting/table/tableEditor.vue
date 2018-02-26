<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h2>{{$t('setting.tableEditor')}}</h2>
            </header>
            <div class="inner">
                <div class="input">
                    <label for="name">{{$t('text.name')}}</label>
                    <input v-model="table.name" id="name" ref="name">
                </div>
                <div class="input">
                    <label for="zone">{{$t('text.section')}}</label>
                    <input v-model="table.zone" id="zone">
                </div>
                <div class="input">
                    <label for="name">{{$t('text.icon')}}</label>
                    <select v-model="table.shape">
                        <option v-for="(shape,index) in options" :key="index" :value="shape">{{shape}}</option>
                    </select>
                </div>
            </div>
            <footer>
                <div class="f1">
                    <span class="del" @click="init.reject(true)">{{$t('button.delete')}}</span>
                </div>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      table: {},
      options: ["", "icon-table-set", "icon-round-couple", "icon-square-couple"]
    };
  },
  created() {
    this.table = Object.assign(
      {},
      {
        _id: ObjectId(),
        feature: [],
        guest: 0,
        server: "",
        time: null,
        grid: this.init.index,
        status: 1,
        name: "",
        shape: "icon-table-set"
      },
      JSON.parse(JSON.stringify(this.init.table))
    );
  },
  mounted() {
    this.$refs.name.focus();
  },
  methods: {
    confirm() {
      this.init.resolve(this.table);
    }
  }
};
</script>
