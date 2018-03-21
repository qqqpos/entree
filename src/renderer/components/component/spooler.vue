<template>
    <div class="popupMask dark" @click.self="init.resolve">
        <transition>
            <div>

            </div>
        </transition>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import dialoger from "../common/dialoger";

export default {
  props: ["init"],
  components: { dialoger },
  data() {
    return {
      componentData: null,
      component: null,
      isVisible: false
    };
  }
};
</script>

<style scoped>

</style>