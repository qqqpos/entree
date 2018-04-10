<template>
  <div class="shortcut">
      <div class="toggle" @click="expand = !expand">{{$t('text.recommendItem')}}</div>
      <ul v-show="visible">
          <list-item v-for="(item,index) in shortcuts" :key="index" :item="item" class="shortcut" @click.native="$emit('add',item)" :ignore="true"></list-item>
      </ul>
  </div>
</template>

<script>
import listItem from "./listItem";

export default {
  props: ["items"],
  components: { listItem },
  data() {
    return {
      expand: false
    };
  },
  computed: {
    shortcuts() {
      return this.expand ? this.items.slice(0, 5) : [];
    },
    visible() {
      return this.shortcuts.length > 0;
    }
  },
  watch: {
    "$store.getters.language": "$forceUpdate"
  }
};
</script>

<style scoped>
div.shortcut {
  position: absolute;
  width: 100%;
  bottom: 0;
  background: #fff;
  box-shadow: 0 -1px 30px -1px rgba(0, 0, 0, 0.1);
}

li.shortcut {
  opacity: 0.5;
  color: #e65100;
  border-bottom: 1px dashed #ffe0b2;
}

.toggle {
  position: absolute;
  top: -26px;
  right: 35px;
  background: #fff;
  color: #009688;
  padding: 4px 10px;
  border-radius: 4px 4px 0 0;
  box-shadow: 0 -1px 7px -3px rgba(0, 0, 0, 0.5),
    2px 0 2px -3px rgba(0, 0, 0, 0.5), -2px 0 2px -3px rgba(0, 0, 0, 0.5);
}
</style>


