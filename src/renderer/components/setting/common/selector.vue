<template>
  <div class="selector" ref="target">
    <span class="title">{{$t(title)}}</span>
    <div class="inputWrap row flex-center">
      <slot name="items"></slot>
      <input :type="type" :value="value" @input="$emit('input',$event.target.value)" v-if="editable" v-outer-click="resetOpts">
      <template v-else>
        <span class="input" @click.stop="isDisplay = !isDisplay">{{label}}</span>
        <i class="fa fa-sort" v-show="!isDisplay"></i>
      </template>
      <transition name="menu">
        <ul v-if="isDisplay" v-outer-click="close" :style="collision">
          <li v-for="(option,index) in opts" :key="index" class="row">
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
    value: [String, Number, Object],
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
      label: "",
      collision: {},
      isDisplay: false,
      id: String().random()
    };
  },
  created() {
    this.getLabel(this.value);
  },
  mounted() {
    const dom = this.$refs.target;
    const height = this.opts.length * 38;
    const optHeight = Math.min(height, 273);
    const { bottom } = dom.getBoundingClientRect();
    const offset = window.innerHeight - optHeight - bottom;

    if (offset < 0)
      this.collision = {
        transform: `translateY(${offset - 5}px)`
      };
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

.inputWrap {
  border: 1px solid #eee;
  position: relative;
  border-radius: 2px;
  background: #fff;
  flex-wrap: wrap;
  flex: 1;
}

.fa-sort {
  color: #fff;
  background: #03a9f4;
  position: absolute;
  right: 0px;
  top: 0px;
  padding: 5px 5px 5px 6px;
  border-radius: 0 3px 3px 0;
}

input {
  flex: 1;
  padding: 5px;
  cursor: pointer;
  width: calc(100% - 12px);
}

span.input {
  display: flex;
  height: 15px;
  border-radius: 2px;
  padding: 4px 5px 6px;
  cursor: pointer;
  flex: 1;
}

.title {
  min-width: 85px;
}

label {
  padding: 10px 5px;
  cursor: pointer;
  flex: 1;
}

ul {
  position: absolute;
  background: #fff;
  border: 1px solid #eee;
  border-top: none;
  z-index: 3;
  width: 100%;
  box-shadow: 0 6px 7px -4px rgba(0, 0, 0, 0.5);
  max-height: 272px;
  overflow: auto;
  top: 25px;
}

li:nth-child(even) {
  background: #fafafa;
  border-top: 1px solid #f6f6f6;
  border-bottom: 1px solid #f6f6f6;
}
</style>