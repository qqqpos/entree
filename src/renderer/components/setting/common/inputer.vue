<template>
  <div class="input">
    <label>{{$t(title)}}</label>
    <textarea v-if="type === 'textarea'" :class="{center}" :value="value" :maxlength="length" :disabled="disabled" :placeholder="placeholder" @input="$emit('input',$event.target.value)" @blur="$emit('update',$event.target.value)" :data-model="model" @click="$emit('focus',$event.currentTarget.selectionStart)"></textarea>
    <template v-else-if="mask">
      <input :type="type" :value="value" :maxlength="length" :disabled="disabled" :placeholder="placeholder" @input="$emit('input',$event.target.value)" @blur="$emit('update',$event.target.value)" ref="input" v-mask="mask" :data-model="model" @click="$emit('focus',$event.currentTarget.selectionStart)">
    </template>
    <template v-else>
      <input :type="type" :value="value" :maxlength="length" :disabled="disabled" :placeholder="placeholder" @input="$emit('input',$event.target.value)" @blur="$emit('update',$event.target.value)" ref="input" :data-model="model" @click="$emit('focus',$event.currentTarget.selectionStart)">
    </template>
    <slot></slot>
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
    value: [String, Number, Array, Object],
    length: [String, Number],
    disabled: {
      type: Boolean,
      default: false
    },
    autoFocus: {
      type: Boolean,
      default: false
    },
    center: {
      type: Boolean,
      default: false
    },
    mask: String,
    model: {
      type: String,
      default: Math.random().toString(36).substring(3,7)
    },
    placeholder: [String, Number]
  },
  mounted() {
    this.autoFocus && this.$refs.input.focus();
  }
};
</script>

<style scoped>
.input {
  display: flex;
  padding: 5px 0;
  align-items: center;
  position: relative;
}

input {
  flex: 1;
  border: 1px solid #eee;
  border-radius: 2px;
  padding: 5px;
}

label {
  min-width: 80px;
}

textarea {
  border: 1px solid #eee;
  border-radius: 2px;
  flex: 1;
  resize: none;
  padding: 5px;
  height: 52px;
}

textarea.center {
  text-align: center;
}
</style>