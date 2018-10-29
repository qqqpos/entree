<template>
    <transition name="fadeIn">
        <dialog open @click.self="$emit('update:show',false)">
            <div class="pad" @mousedown.prevent="">
                <section class="numeric">
                    <div @mousedown.prevent="$emit('input','7')">7</div>
                    <div @mousedown.prevent="$emit('input','8')">8</div>
                    <div @mousedown.prevent="$emit('input','9')">9</div>
                </section>
                <section class="numeric">
                    <div @mousedown.prevent="$emit('input','4')">4</div>
                    <div @mousedown.prevent="$emit('input','5')">5</div>
                    <div @mousedown.prevent="$emit('input','6')">6</div>
                </section>
                <section class="numeric">
                    <div @mousedown.prevent="$emit('input','1')">1</div>
                    <div @mousedown.prevent="$emit('input','2')">2</div>
                    <div @mousedown.prevent="$emit('input','3')">3</div>
                </section>    
                <section class="numeric">
                    <div @mousedown.prevent="$emit('input','0')">0</div>
                    <i class="fas fa-backspace f1" v-press="reset" @click.prevent="$emit('remove')"></i>
                </section>                    
            </div>
        </dialog>
    </transition>
</template>

<script>
export default {
  props: ["show"],
  methods: {
    reset() {
      this.$emit("reset");
    }
  }
};
</script>

<style scoped>
dialog {
  background: transparent;
  z-index: 0;
}

.pad {
  background: linear-gradient(#9098a3, #555d69);
  color: #3a3d42;
  width: 236px;
  height: 277px;
  padding: 1px;
  position: absolute;
  right: 65px;
  top: 245px;
  box-shadow: var(--shadow);
  border-radius: 4px;
}
</style>

