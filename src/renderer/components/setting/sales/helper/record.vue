<template>
    <div class="details">
      <span class="date">{{batch.date}}</span>
      <span class="">{{batch.terminal}}</span>
      <span class="f1"></span>
      <span class="decimal">$ {{batch.amount.credit}}</span>
      <i class="fas fa-angle-down"></i>
    </div>
</template>

<script>
export default {
  props: ["batch"],
  data() {
    return {};
  },
  methods: {}
};
</script>

<style scoped>
</style>

