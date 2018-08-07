<template>
    <div class="details">
        <span class="date">{{sales.date}}</span>
        <span class="day">{{sales.time | moment('dddd')}}</span>
        <span class="f1"></span>
        <span class="amount">$ 0.00</span>
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
.date{
    font-weight: bold;
    margin-right: 5px;
}

.amount{
    margin-right:15px; 
    font-family: "Agency FB";
    font-weight: bold;
}
</style>

