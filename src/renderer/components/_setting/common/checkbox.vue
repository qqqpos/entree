<template>
  <div class="checkbox">
    <input :id="id" :value="val" :checked="has(val)" type="checkbox" @change="toggle($event)" v-if="multiple">
    <input :id="id" :checked="value" type="checkbox" :disabled="disabled" @change="$emit('input',$event.target.checked)" v-else>
    <label :for="id" class="box"></label>
    <label class="text" :for="id">{{$t(label)}}</label>
  </div>
</template>

<script>
export default {
  props: ["val", "label", "value", "multiple", "disabled"],
  data() {
    return {
      id: Math.random()
        .toString(36)
        .substring(3, 6)
    };
  },
  methods: {
    has(value) {
      return this.value.includes(value);
    },
    toggle(e) {
      let value = this.value || [];

      Array.isArray(value) && (value = value.filter(i => !!i));

      let index = value.indexOf(e.target.value);
      index === -1 ? value.push(e.target.value) : value.splice(index, 1);

      this.$emit("input", value);
    }
  }
};
</script>

<style scoped>
.checkbox {
  margin: 2px 10px;
  display: flex;
  align-items: center;
}

input {
  display: none;
}

input:checked + label {
  background: #009688;
  border-color: #009688;
}

input:checked + label:after {
  transform: scale(1.3);
}

.box {
  display: inline-block;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  background: #eee;
  border: 2px solid #7a7a7a;
  border-radius: 10%;
  position: relative;
  cursor: pointer;
  transition: 0.2s;
}

.box:before {
  content: "";
  position: absolute;
  display: block;
  height: 200%;
  width: 200%;
  top: -50%;
  left: -50%;
  z-index: 0;
  border-radius: 50%;
  transition: 0.3s;
}

.box:after {
  content: "";
  display: block;
  height: 100%;
  width: 100%;
  background: url(../../../assets/image/check.svg) center center no-repeat;
  background-size: contain;
  transform: scale(0);
  transition: 0.2s;
}

.box:active:before {
  background: rgba(76, 175, 80, 0.25);
}

.text {
  vertical-align: top;
  margin-left: 5px;
}

input:disabled ~ label {
  opacity: 0.7;
}
</style>
