<template>
    <div class="details">
        <span class="date">{{sales.date}}</span>
        <span class="day">{{sales.time | moment('dddd')}}</span>
        <span class="f1"></span>
        <span class="decimal">$ {{sales.summary.sales.grandTotal | decimal}}</span>
        <i class="fas fa-angle-down"></i>
    </div>
</template>

<script>
export default {
  props: ["sales"],
  data() {
    return {};
  },
  methods: {}
};
</script>

<style scoped>

</style>

