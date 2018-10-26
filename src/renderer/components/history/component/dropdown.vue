<template>
  <div class="dropdown">
    <div class="wrap" @click.stop="display">
      <div class="f1">
        <span class="ghost" v-if="!selected">{{$t(label)}}</span>
        <span class="value" v-else>{{selected.text}}</span>
      </div>
      <i class="fa fa-times clickable" @click.stop="resetFilter" v-show="selected"></i>
    </div>
    <template v-if="reverse">
      <transition name="popup">
        <ul v-if="isShowDropdown" class="up" v-outer-click="hideDropdown">
          <li v-for="(option,index) in options" :key="index" @click="select(option)" :class="{active:option.value === (selected && selected.value)}">{{option.text}}</li>
        </ul>
      </transition>
    </template>
    <template v-else>
      <transition name="dropdown">
        <ul v-if="isShowDropdown" class="down" v-outer-click="hideDropdown">
          <li v-for="(option,index) in options" :key="index" @click="select(option)" :class="{active:option.value === (selected && selected.value)}">{{option.text}}</li>
        </ul>
      </transition>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    label: [String],
    options: Array,
    filter: [String, Number],
    reverse: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isShowDropdown: false,
      selected: null
    };
  },
  created() {
    this.$bus.on("applied", this.hideDropdown);
  },
  beforeDestroy() {
    this.$bus.off("applied", this.hideDropdown);
  },
  methods: {
    select(value) {
      this.selected = value;
      this.isShowDropdown = false;
      this.$bus.emit("filter", {
        type: this.filter,
        value: this.selected.value
      });
    },
    resetFilter() {
      this.selected = null;
      this.isShowDropdown = false;
      this.$bus.emit("filter", {
        type: this.filter,
        value: null
      });
    },
    hideDropdown() {
      this.isShowDropdown = false;
    },
    display() {
      this.isShowDropdown = !this.isShowDropdown;
    }
  }
};
</script>

<style scoped>
.dropdown {
  position: relative;
  margin-left: 15px;
}

.wrap {
  padding: 10px;
  width: 134px;
  border: 1px solid #eee;
  background: #f5f5f5;
  display: flex;
  border-radius: 4px;
}

.wrap .value {
  white-space: nowrap;
}

ul {
  position: absolute;
  background: #fff;
  width: 154px;
  z-index: 2;
  border: 1px solid #f5f5f5;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 3px -1px rgba(0, 0, 0, 0.5);
}

ul.down {
  top: 38px;
  border-top: none;
}

ul.up {
  bottom: 37px;
  border-bottom: none;
  box-shadow: 0 0px 6px -2px rgba(0, 0, 0, 0.4);
}

li {
  padding: 10px;
  border-left: 4px solid transparent;
}

li:nth-child(even) {
  background: #fafafa;
}

.dropdown li.active {
  color: #2196f3;
  background: #e1f5fe;
}
</style>