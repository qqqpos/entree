<template>
    <div>
        <range-tab @update="fetchData" initial="currentWeek"></range-tab>
        <section>

        </section>
    </div>
</template>

<script>
import rangeTab from "../common/rangeTab";
export default {
  components: { rangeTab },
  data() {
    return {
      range: {}
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData(range) {
      if (!range) {
        const from = +moment()
          .startOf("w")
          .hours(4);
        const to = +moment()
          .endOf("w")
          .add(4, "h");

        this.$socket.emit("[PAYOUT] LIST", { from, to }, result =>
          console.log(result)
        );
        range = { from, to };
      } else {
        const { from, to } = range;
        this.$socket.emit("[PAYOUT] LIST", { from, to }, result =>
          console.log(result)
        );
      }

      this.range = range;
    }
  }
};
</script>