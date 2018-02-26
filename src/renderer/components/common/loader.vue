<template>
  <transition name="fadeIn">
    <div class="circularLoader" v-if="display">
      <div class="spinner">
        <svg viewBox="25 25 50 50" class="circular">
          <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
        </svg>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    display: {
      type: Boolean,
      default: false
    },
    tooltip: String
  }
};
</script>

<style scoped>
.circularLoader {
  position: absolute;
  z-index: 1000;
  background-color: hsla(0, 0%, 100%, 0.9);
  margin: 0;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transition: opacity 0.3s;
  border-radius: 4px;
}

.spinner {
  top: 50%;
  margin-top: -21px;
  width: 100%;
  text-align: center;
  position: absolute;
}

.spinner .circular {
  height: 42px;
  width: 42px;
  animation: circular-rotate 2s linear infinite;
}

.spinner .path {
  animation: loading-dash 1.5s ease-in-out infinite;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-width: 2;
  stroke: #409eff;
  stroke-linecap: round;
}

@keyframes circular-rotate {
  to {
    transform: rotate(1turn);
  }
}

@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -40px;
  }
  to {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -120px;
  }
}
</style>