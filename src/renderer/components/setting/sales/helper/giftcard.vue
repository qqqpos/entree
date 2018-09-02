<template>
    <div class="details">
        <span class="date">{{card.number | card}}</span>
        <span class="day">{{card.time | fromNow}}</span>
        <span class="f1"></span>
        <span class="decimal">$ {{card.balance | decimal}}</span>
        <i class="fas fa-angle-down"></i>
    </div>
</template>

<script>
export default {
  props: ["card"],
  data() {
    return {};
  },
  methods: {}
};
</script>

<style scoped>
.date{
  width: 170px;
}
</style>

