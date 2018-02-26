<template>
    <div class="toggle" :class="{style:defaultStyle}">
      <div class="inner">
        <label class="label">
            <span class="title">{{$t(title)}}</span>
            <span class="tooltip" v-if="tooltip">{{$t(tooltip)}}</span>
            <span class="tooltip" v-else-if="conditionalTooltip">{{$t(dynamicTooltip)}}</span>
        </label>
        <label class="input-toggle">
            <input type="checkbox" :checked="value" @change="$emit('input',$event.target.checked),$emit('update',$event.target.checked)" :disabled="disabled">
            <span></span>
        </label>
      </div>
      <slot></slot>
    </div>
</template>

<script>
export default {
  props: {
    value: Boolean,
    title: String,
    defaultStyle: {
      type: Boolean,
      default: true
    },
    tooltip: String,
    trueTooltip: String,
    falseTooltip: String,
    disabled: {
      type: Boolean,
      default: false
    },
    conditionalTooltip: Boolean
  },
  data() {
    return {
      dynamicTooltip: ""
    };
  },
  created() {
    if (this.conditionalTooltip)
      this.dynamicTooltip = this.value ? this.trueTooltip : this.falseTooltip;
  },
  watch: {
    value(n) {
      if (this.conditionalTooltip)
        this.dynamicTooltip = n ? this.trueTooltip : this.falseTooltip;
    }
  }
};
</script>

<style scoped>
.toggle.style {
  border-bottom: 1px solid #eee;
}

.toggle.style .inner {
  min-height: 48px;
}

.toggle.style .label {
  padding: 5px 20px;
}

.toggle.style .input-toggle {
  width: 80px;
}

.inner {
  display: flex;
  justify-content: center;
  min-height: 40px;
}

.label {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}
</style>