<template>
  <div>

  </div>
</template>

<script>
export default {
  beforeRouteEnter: (to, from, next) => {
    appSocket.emit(
      "[TIMECARD] OVERVIEW",
      {
        group: "day"
      },
      data => {
        next(vm => {
          this.overview = data;
        });
      }
    );
  },
  data() {
    return {
      group: "day", //"week", "month"
      overview: []
    };
  },
  mounted() {
    console.log(this.overview);
  }
};
</script>

<style scoped>

</style>


