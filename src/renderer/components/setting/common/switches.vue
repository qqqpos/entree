<template>
  <div class="switches">
    <template v-if="reverse">
      <label class="input-toggle">
        <input type="checkbox" :checked="value" @change="$emit('input',$event.target.checked),$emit('update',$event.target.checked)" :disabled="disabled">
        <span></span>
      </label>
      <label class="label indent">{{$t(title)}}</label>
    </template>
    <template v-else>
      <label class="label">{{$t(title)}}</label>
      <label class="input-toggle">
        <input type="checkbox" :checked="value" @change="$emit('input',$event.target.checked),$emit('update',$event.target.checked)" :disabled="disabled">
        <span></span>
      </label>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    value: Boolean,
    title: String,
    reverse: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.switches {
  display: flex;
  align-items: center;
  height: 40px;
}

.label {
  flex: 1;
}

.indent {
  margin-left: 5px;
}
</style>