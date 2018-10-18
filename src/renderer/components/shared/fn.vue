<template>
    <button class="btn" :disabled="disabled" @click="$emit('click')">
        <i class="fa" :class="icon"></i>
        <span class="text">{{$t(text,language)}}</span>
    </button>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: {
    icon: String,
    text: String,
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed:{
    ...mapGetters(['language'])
  }
};
</script>

