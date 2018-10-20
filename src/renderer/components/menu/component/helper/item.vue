<template>
    <div @click="$emit('more')" :class="{block:item.placeholder}">
        <span>{{item[language]}}</span>
        <span class="qty agency" @click.stop="$emit('reset')" v-show="item.qty > 0">{{item.qty}}</span>
    </div>
</template>

<script>
export default {
  props: ["item", "language"]
};
</script>

<style>
.item .qty {
  position: absolute;
  top: -2px;
  right: 1px;
  font-size: 20px;
  width: 35px;
  height: 23px;
  text-align: right;
  display: block;
  color: #fff;
  padding: 0 0 10px 5px;
  text-shadow: 0 1px 1px #333;
}

.qty:before {
  content: "x";
  padding-right: 2px;
  font-size: 18px;
}

.block {
  opacity: 0.25;
  border: 1px dashed #607d8b;
}
</style>
