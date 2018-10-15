<template>
    <button class="btn" :disabled="disabled" @click="$emit('click')">
        <i class="fa" :class="icon"></i>
        <span class="text">{{$t(text)}}</span>
    </button>
</template>

<script>
export default {
  props: {
    icon: String,
    text: String,
    disabled: {
      type: Boolean,
      default: false
    }
  }
};
</script>

