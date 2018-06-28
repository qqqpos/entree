<template>
    <nav class="tabs relative">
        <div>
            <input type="radio" v-model="tab" value="CHART" name="tab" id="CHART">
            <label for="CHART">{{$t('nav.chart')}}</label>
        </div>
        <div>
            <input type="radio" v-model="tab" value="DEPARTMENT" name="tab" id="DEPARTMENT">
            <label for="DEPARTMENT">{{$t('nav.department')}}</label>
        </div>
        <div>
            <input type="radio" v-model="tab" value="CHECKING" name="tab" id="CHECKING">
            <label for="CHECKING">{{$t('nav.reconciliation')}}</label>
        </div>        
        <!-- <div>
            <input type="radio" v-model="tab" value="STAFF" name="tab" id="STAFF">
            <label for="STAFF">{{$t('nav.staff')}}</label>
        </div>
        <div>
            <input type="radio" v-model="tab" value="TERMINAL" name="tab" id="TERMINAL">
            <label for="TERMINAL">{{$t('nav.terminal')}}</label>
        </div> -->
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


