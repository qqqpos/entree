<template>
  <ul>
    <li v-for="(opt,index) in opts" :key="index">
      <input type="radio" name="range" v-model="select" :value="opt" :id="'opt'+index" @change="update">
      <label :for="'opt'+index">{{$t('thead.'+opt)}}</label>
    </li>
  </ul>
</template>

<script>
export default {
  props: ["initial"],
  data() {
    return {
      opts: [
        "currentWeek",
        "lastWeek",
        "currentMonth",
        "lastMonth",
        "monthly",
        "quarterly"
      ],
      select: "currentMonth"
    };
  },
  created() {
    this.select = this.initial || "currentMonth";
  },
  methods: {
    update() {
      let from, to;
      switch (this.select) {
        case "currentWeek":
          from = +moment()
            .startOf("w")
            .hours(4);
          to = +moment()
            .endOf("w")
            .add(4, "h");
          break;
        case "lastWeek":
          from = +moment()
            .subtract(1, "w")
            .startOf("w")
            .hours(4);
          to = +moment()
            .subtract(1, "w")
            .endOf("w")
            .add(4, "h");

          break;
        case "lastMonth":
          from = +moment()
            .subtract(1, "M")
            .startOf("M")
            .hours(4);
          to = +moment()
            .subtract(1, "M")
            .endOf("M")
            .add(4, "h");
          break;
        case "monthly":
        from = +moment()
            .subtract(12, "M")
            .startOf("M")
            .hours(4);
          to = +moment()
            .subtract(1, "M")
            .endOf("M")
            .add(4, "h");
          break;
        default:
          from = +moment()
            .startOf("M")
            .hours(4);
          to = +moment()
            .endOf("M")
            .add(4, "h");
      }

      this.$emit("update", { from, to, select: this.select });
    }
  }
};
</script>

<style scoped>
ul {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #bdbdbd;
}

li {
  flex: 1;
  text-align: center;
}

label {
  padding: 10px;
  display: block;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.45);
  border-bottom: 2px solid transparent;
}

input:checked + label {
  color: #333;
  font-weight: bold;
  border-bottom: 2px solid #ff5722;
}
</style>
