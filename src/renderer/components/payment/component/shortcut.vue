<template>
    <section>
        <div class="numKey" v-for="(number,index) in values" @click="$emit('input',number)" :key="index">{{number}}</div>
    </section>
</template>

<script>
export default {
  props: ["value"],
  data() {
    return {
      values: []
    };
  },
  methods: {
    initial(value) {
      const preset = [
        1,
        2,
        3,
        4,
        5,
        10,
        15,
        20,
        25,
        30,
        35,
        40,
        45,
        50,
        60,
        70,
        80,
        100,
        120,
        140,
        150,
        200,
        300,
        350,
        400,
        450,
        500,
        600,
        700,
        800,
        900,
        1000,
        1100,
        1500,
        2000,
        3000,
        4000,
        5000
      ];

      const round = Math.ceil(isNumber(value) ? toFixed(value, 2) : 0);
      let array = [];

      array.push(value.toFixed(2));
      value === round ? array.push(round + 1) : array.push(round);

      const index = preset.findIndex(i => i > round);

      array.push(preset.slice(index, index + 6));
      this.values = [].concat.apply([], array);
    }
  },
  watch: {
    value: {
      immediate: true,
      handler: "initial"
    }
  }
};
</script>

<style scoped>
section {
  margin-left: 3px;
  display: flex;
  flex-wrap: wrap;
  height: 353px;
  width: 210px;
}
</style>


