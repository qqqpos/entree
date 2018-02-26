<template>
  <div class="selector">
    <span class="title">{{$t(title)}}</span>
    <div class="inner">
      <input :type="type" :value="value" @input="$emit('input',$event.target.value)" v-if="editable" v-outer-click="resetOpts">
      <template v-else>
        <span class="input" @click.stop="isDisplay = !isDisplay">{{label}}</span>
        <i class="fa fa-sort"></i>
      </template>
      <transition name="menu">
        <ul v-if="isDisplay" v-outer-click="close">
          <li v-for="(option,index) in opts" :key="index">
            <input type="radio" :value="option.value" :id="id+index">
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
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: "text"
    },
    title: String,
    value: [String, Number],
    editable: {
      type: Boolean,
      default: false
    },
    opts: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isDisplay: false,
      label: "",
      id: Math.random()
        .toString(36)
        .substring(3, 6)
    };
  },
  created() {
    this.getLabel(this.value);
  },
  methods: {
    getLabel(value = this.value) {
      let label = this.opts.find(opt => opt.value === value);
      this.label = label ? label.label : value;
    },
    pick(value) {
      this.isDisplay = false;
      this.$emit("input", value);
      this.getLabel(value);
      this.value !== value && this.$emit("update", value);
    },
    resetOpts() {
      this.isDisplay = false;
      Object.assign(this.opts, []);
    },
    close() {
      this.isDisplay = false;
    }
  },
  watch: {
    opts(n) {
      if (this.editable) this.isDisplay = true;
    }
  }
};
</script>

<style scoped>
.selector {
  display: flex;
  padding: 5px 0;
  align-items: center;
}

.inner {
  position: relative;
  flex: 1;
}

i {
  color: #656565;
  position: absolute;
  right: 5px;
  top: 5px;
}

input {
  flex: 1;
  border: 1px solid #eee;
  border-radius: 2px;
  padding: 5px;
  cursor: pointer;
  outline: none;
  width: calc(100% - 12px);
}

.input {
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  height: 15px;
  border-radius: 2px;
  background: #fff;
  padding: 5px;
  cursor: pointer;
}

.title {
  min-width: 80px;
}

label {
  padding: 7px;
  cursor: pointer;
  flex: 1;
}

ul {
  position: absolute;
  background: #fff;
  border: 1px solid #eee;
  border-top: none;
  z-index: 2;
  width: calc(100% - 2px);
  box-shadow: 0 3px 6px -2px rgba(0, 0, 0, 0.5);
}

li {
  display: flex;
}

li:nth-child(even) {
  background: #fafafa;
}
</style>