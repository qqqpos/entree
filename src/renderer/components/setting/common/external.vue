<template>
  <div class="external" :class="{style:defaultStyle,disabled}">
    <slot name="icon"></slot>
    <div class="column f1">
      <div class="flex-center">
        <span>{{translate ? $t(title) : title}}</span>
        <span class="tooltip">{{$t(tooltip)}}</span>
      </div>
      <slot name="value"></slot>
    </div>
    <slot>
      <div class="anchor" @click="$emit('open')">
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
  padding: 4px 0;
  border-bottom: 1px solid #eee;
}

.column {
  padding-left: 20px;
}

.tooltip {
  flex: 1;
  color: #9e9e9e;
  text-align: right;
  line-height: 1;
  font-size: 16px;
  font-family: "Hiragino Sans GB", "PingFang SC", "Yuanti-SC";
}

.value {
  margin-top: 1px;
  color: #2196f3;
}

.style .anchor {
  margin: 0 10px;
}

.anchor {
  padding: 7px 25px;
  color: #555;
  cursor: pointer;
}

.anchor:hover {
  background: #eee;
  border-radius: 4px;
}

.icon {
  color: hsl(0, 0%, 53.3%);
  padding-left: 20px;
  text-align: center;
  font-size: 26px;
  width: 35px;
}
</style>