<template>
  <div>
    <figure @click="$emit('change','PICK_UP')" :class="{active:type === 'PICK_UP'}">
      <i class="fa fa-user"></i>
      <span class="text">{{$t('type.PICK_UP')}}</span>
    </figure>
    <figure @click="$emit('change','DELIVERY')" :class="{active:type === 'DELIVERY'}">
      <i class="fa fa-car"></i>
      <span class="text">{{$t('type.DELIVERY')}}</span>
    </figure>
  </div>
</template>

<script>
export default {
  props: ["type"]
};
</script>

<style scoped>
div {
  position: absolute;
  top: -38px;
  left: 95px;
  display: flex;
}

div figure {
  opacity: 0.5;
  background: #fff;
  margin: 0 5px;
  padding: 10px;
  cursor: pointer;
  min-width: 90px;
  text-align: center;
  border-radius: 4px 4px 0 0;
}

figure.active {
  opacity: 1;
}
</style>