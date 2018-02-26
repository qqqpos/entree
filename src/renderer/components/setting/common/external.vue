<template>
  <div class="external" :class="{style:defaultStyle,disabled}">
    <div class="inner" v-if="translate">
      <span>{{$t(title)}}</span>
      <span class="tooltip">{{$t(tooltip)}}</span>
    </div>
    <div class="inner" v-else>
      <span>{{title}}</span>
      <span class="tooltip">{{tooltip}}</span>
    </div>
    <slot>
      <div class="icon" @click="$emit('open')">
        <i class="fa fa-caret-right"></i>
      </div>
    </slot>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    tooltip: String,
    translate: {
      type: Boolean,
      default: true
    },
    defaultStyle: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.external {
  display: flex;
  align-items: center;
}

.external.disabled {
  opacity: 0.5;
  pointer-events: none;
  background: #f5f5f5;
}

.external.style {
  min-height: 39px;
  padding: 4px 0 4px 20px;
  border-bottom: 1px solid #eee;
}

.inner {
  flex: 1;
  display: flex;
}

.tooltip {
  color: #9e9e9e;
  flex: 1;
  text-align: right;
}

.style .icon {
  margin: 0 10px;
}

.icon {
  padding: 7px 25px;
  color: #555;
  cursor: pointer;
}

.icon:hover {
  background: #eee;
  border-radius: 4px;
}
</style>