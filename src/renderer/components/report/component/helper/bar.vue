<template>
    <span class="bar" :style="{height,'transition-delay':delay}" ></span>
</template>

<script>
export default {
  props: ["delay", "height"]
};
</script>

<style scoped>
.bar {
  position: absolute;
  width: 100%;
  bottom: 0;
  left: 0;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  background: linear-gradient(125deg, #90f7ec, #32ccbc 75%);
  transition: height 600ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.15), 0 -1px 1px rgba(0, 150, 136, 0.25);
}
</style>

