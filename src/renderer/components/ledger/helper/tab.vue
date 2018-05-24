<template>
    <nav class="tabs">
        <div>
            <input type="radio" v-model="value" value="overview" name="tab" id="overview">
            <label for="overview">{{$t('nav.overview')}}</label>
        </div>
        <div>
            <input type="radio" v-model="value" value="department" name="tab" id="department">
            <label for="department">{{$t('nav.department')}}</label>
        </div>
        <div>
            <input type="radio" v-model="value" value="transaction" name="tab" id="transaction">
            <label for="transaction">{{$t('text.income')}}</label>
        </div>
        <div>
            <input type="radio" v-model="value" value="invoice" name="tab" id="invoice">
            <label for="invoice">{{$t('text.invoice')}}</label>
        </div>
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
</style>


