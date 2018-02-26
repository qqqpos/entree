<template>
  <div class="input">
    <div class="wrap">
      <label>{{$t(title)}}</label>
      <template v-if="mask">
        <input :type="type" :value="value" :disabled="disabled" :placeholder="placeholder" @input="$emit('input',$event.target.value)" @blur="$emit('update',$event.target.value)" v-mask="mask">
      </template>
      <template v-else>
        <input :type="type" :value="value" :disabled="disabled" :placeholder="placeholder" @input="$emit('input',$event.target.value)" @blur="$emit('update',$event.target.value)">
      </template>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    label: String,
    title: String,
    value: [String, Number, Array],
    disabled: Boolean,
    placeholder: String,
    mask: String,
    type: {
      type: String,
      default: "text"
    }
  },
  watch: {
    value() { }
  }
};
</script>

<style scoped>
.input {
  display: flex;
  padding: 5px 0 2px;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.input .wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 0px 20px;
}

.change {
  border-left: 1px solid #eee;
}

.change span {
  display: block;
  padding: 10px;
  border-left: 1px solid #fff;
  cursor: pointer;
  margin: 0 10px;
}

input {
  border: none;
  font-family: "Yuanti-SC";
  font-size: 18px;
  outline: none;
  margin-top: 2px;
}

label {
  color: #656565;
}
</style>