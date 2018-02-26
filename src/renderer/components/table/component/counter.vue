<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="editor">
      <header>
        <h5>{{currentTable.name}}</h5>
        <h3>{{$t("text.setGuest")}}</h3>
      </header>
      <div class="banner"></div>
      <div class="display">
        <input type="text" v-model="guest">
      </div>
      <num-pad v-model="guest" type="number" @enter="init.resolve(guest)" :max="999"></num-pad>
    </div>
  </div>
</template>

<script>
import numPad from "../../common/numpad";
export default {
  props: ["init"],
  components: { numPad },
  data() {
    return {
      guest: 1,
      currentTable: this.$store.getters.currentTable
    };
  }
};
</script>

