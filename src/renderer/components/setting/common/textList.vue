<template>
  <div class="list">
    <div class="wrap" @click.stop="isDisplay = !isDisplay">
      <div class="inner">
        <label>{{$t(title)}}</label>
        <p>{{$t(label)}}</p>
      </div>
      <i class="fa fa-sort"></i>
    </div>
    <transition name="menu">
      <ul v-show="isDisplay" v-outer-click="close" :style="edge" ref="list">
        <li v-for="(option,index) in opts" :key="index">
          <input type="radio" :checked="option.value === value" @change="pick(option.value)" :id="id+index">
          <label :for="id+index" @click="pick(option.value)" v-if="option.plainText">
            <span class="label">{{option.label}}</span>
            <span class="tooltip">{{option.tooltip}}</span>
          </label>
          <label :for="id+index" @click="pick(option.value)" v-else>
            <span class="label">{{$t(option.label)}}</span>
            <span class="tooltip">{{$t(option.tooltip)}}</span>
          </label>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    value: null,
    opts: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      id: Math.random()
        .toString(36)
        .substring(3, 6),
      isDisplay: false,
      label: null,
      edge: {}
    };
  },
  created() {
    this.getLabel();
  },
  methods: {
    close() {
      this.isDisplay = false;
    },
    getLabel(value = this.value) {
      let label = this.opts.find(opt => opt.value === value);
      this.label = label ? label.label : value;
    },
    pick(value) {
      this.$emit("input", value);
      this.getLabel(value);
      this.isDisplay = false;

      this.value !== value && this.$emit("update", value);
    }
  },
  watch: {
    isDisplay(boolean) {
      if (boolean) {
        this.$nextTick(() => {
          let { top, bottom } = this.$refs.list.getBoundingClientRect();
          if (top < 0) {
            this.edge = {
              transform: `translateY(${Math.abs(top - 74)}px)`
            };
          }
        });
      }
    },
    value(n) {
      this.getLabel();
    }
  }
};
</script>

<style scoped>
.list {
  position: relative;
  display: flex;
  padding: 3px 0;
  align-items: center;
  min-height: 41px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.list .wrap {
  display: flex;
  flex: 1;
  align-items: center;
  padding: 0px 0 0 20px;
}

.wrap label {
  cursor: pointer;
}

.inner {
  flex: 1;
}

p {
  margin-top: 3px;
  color: #2196f3;
}

i {
  margin: 0 10px;
  padding: 10px 25px;
  color: #555;
  cursor: pointer;
}

ul {
  position: absolute;
  z-index: 2;
  left: 1px;
  background: #fff;
  width: calc(100% - 4px);
  border: 1px solid #eee;
  box-shadow: 0 4px 16px -3px rgba(0, 0, 0, 0.7);
}

li {
  display: flex;
}

li:nth-child(even) {
  background: #eee;
}

li label {
  padding: 5px 20px;
  flex: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  min-height: 40px;
  border-left: 4px solid transparent;
}

li .label {
  flex: 2;
}

li .tooltip {
  flex: 5;
}

input:checked + label {
  border-left: 4px solid #009688;
}
</style>