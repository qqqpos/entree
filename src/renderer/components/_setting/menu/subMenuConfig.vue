<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="editor">
            <header>
                <h2>{{$t('title.subMenuConfig')}}</h2>
                <!-- <h4>{{$t('tip.configSubMenu')}}</h4> -->
            </header>
            <div class="inner">
                <div class="input">
                    <label>{{$t('text.maxItem')}}</label>
                    <input type="text" v-model.number="side.maxSubItem">
                </div>
                <div class="input">
                    <label>{{$t('text.overCharge')}}</label>
                    <input type="text" v-model.number="side.overCharge" placeholder="0.00">
                </div>
                <div class="options">
                    <label>{{$t('text.subItemGroup')}}</label>
                    <select v-model="side.subMenu" multiple>
                        <option v-for="(group,index) in groups" :key="index">{{group}}</option>
                    </select>
                </div>
            </div>
            <footer>
                <div class="btn" @click="init.reject">{{$t('button.cancel')}}</div>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: ["init"],
  data() {
    return {
      side: null,
      groups: []
    };
  },
  created() {
    this.side = Object.assign(
      {},
      {
        maxSubItem: 0,
        overCharge: 0,
        subMenu: []
      },
      this.init.side
    );
    this.groups = Object.keys(this.submenu) || [];
  },
  methods: {
    confirm() {
      this.init.resolve(this.side);
    }
  },
  computed: {
    ...mapGetters(["submenu"])
  }
};
</script>

<style scoped>
select {
  display: flex;
  flex-wrap: wrap;
}

option {
  padding: 2px 10px;
  margin: 2px;
  border-radius: 4px;
  min-width: 50px;
  justify-content: center;
}
</style>