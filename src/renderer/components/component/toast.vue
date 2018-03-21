<template>
    <transition appear name="fadeUp">
        <div class="note" v-show="isDisplay" @click="$emit('open')">
            <div>
                <span class="text">{{txt}}</span>
            </div>
        </div>
    </transition>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      isDisplay: false,
      txt: ""
    };
  },
  mounted() {
    this.isDisplay = this.spooler.length > 0;
    this.txt = this.$t("text.delayTask", this.spooler.length);
  },
  computed: {
    ...mapGetters(["spooler"])
  },
  watch: {
    spooler(n) {
      this.isDisplay = n.length > 0;
    }
  }
};
</script>

<style scoped>
.note {
  position: fixed;
  right: 0;
  bottom: 0;
  height: 50px;
  min-width: 150px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: 4px;
  border-right: 4px solid #ff5722;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.6);
}

.note .text {
  font-weight: bold;
  color: #009688;
}
</style>