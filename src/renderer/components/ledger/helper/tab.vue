<template>
    <nav class="tabs relative">
        <div>
            <input type="radio" v-model="tab" value="CHART" name="tab" id="CHART">
            <label for="CHART">{{$t('nav.hourly')}}</label>
        </div>
        <div>
            <input type="radio" v-model="tab" value="RADAR" name="tab" id="RADAR">
            <label for="RADAR">{{$t('nav.categorize')}}</label>
        </div>
        <div>
            <input type="radio" v-model="tab" value="DEPARTMENT" name="tab" id="DEPARTMENT">
            <label for="DEPARTMENT">{{$t('nav.department')}}</label>
        </div>
        <div>
            <input type="radio" v-model="tab" value="CHECKING" name="tab" id="CHECKING">
            <label for="CHECKING">{{$t('nav.reconciliation')}}</label>
        </div>
    </nav>
</template>

<script>
export default {
  data() {
    return {
      tab: "CHART"
    };
  },
  watch: {
    tab(page) {
      this.$emit("switch", page);
    }
  }
};
</script>

<style scoped>
</style>


