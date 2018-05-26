<template>
    <nav class="tabs relative">
        <div>
            <input type="radio" v-model="value" value="CHART" name="tab" id="CHART">
            <label for="CHART">{{$t('nav.chart')}}</label>
        </div>
        <div>
            <input type="radio" v-model="value" value="DEPARTMENT" name="tab" id="DEPARTMENT">
            <label for="DEPARTMENT">{{$t('nav.department')}}</label>
        </div>
        <div>
            <input type="radio" v-model="value" value="STAFF" name="tab" id="STAFF">
            <label for="STAFF">{{$t('nav.staff')}}</label>
        </div>
        <div>
            <input type="radio" v-model="value" value="TERMINAL" name="tab" id="TERMINAL">
            <label for="TERMINAL">{{$t('nav.terminal')}}</label>
        </div>
        <span class="border"></span>
    </nav>
</template>

<script>
export default {
  props: ["value"],
  watch: {
    value(tab) {
      this.$emit("switch", tab);
    }
  }
};
</script>

<style scoped>
.border {
  position: absolute;
  height: 4px;
  width: 96px;
  bottom: -2px;
  border-radius: 9px;
  background: #f4511e;
}
</style>


