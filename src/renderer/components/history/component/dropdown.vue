<template>
  <div class="dropdown">
    <div class="wrap" @click.stop="display">
      <div class="text">
        <span class="placeholder" v-if="!selected">{{$t(label)}}</span>
        <span class="value" v-else>{{selected.text}}</span>
      </div>
      <i class="fa fa-times" @click.stop="resetFilter" v-show="selected"></i>
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

.wrap .text {
  flex: 1;
}

.wrap .value {
  white-space: nowrap;
}

.placeholder {
  color: #b9b9b9;
}

ul {
  position: absolute;
  background: #fff;
  width: 154px;
  border: 1px solid #fff;
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

.dropdown li {
  padding: 10px;
  border-left: 4px solid transparent;
}

.dropdown li:nth-child(even) {
  background: #fafafa;
}

li.active {
  color: #009688;
  border-left-color: #009688;
}
</style>