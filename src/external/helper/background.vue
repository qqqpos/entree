<template>
    <ul v-if="pictures.length > 0">
        <transition-group mode="in-out" :name="animation">
          <li v-for="(picture,index) in pictures" :key="index" :style="{backgroundImage:`url(${picture.href})`}" v-show="playIndex === index"></li>
        </transition-group>
    </ul>
</template>

<script>
export default {
  props: ["gallery", "duration"],
  data() {
    return {
      now: Math.trunc(Date.now() / 1000),
      pictures: [],
      playIndex: 0,
      countdown: null,
      animations: ["fade", "rotate"] //"move", "scale"
    };
  },
  mounted() {
    this.countdown = setInterval(this.next, this.duration);
  },
  beforeDestroy() {
    clearInterval(this.countdown);
  },
  methods: {
    initial(directory) {
      const fs = require("fs");
      const path = require("path");
      const extensions = [".jpg", ".png", ".jpeg", ".webp", ".bmp"];

      this.pictures = fs
        .readdirSync(directory)
        .filter(
          file =>
            fs.statSync(path.join(directory, file)).isFile() &&
            extensions.includes(path.extname(file))
        )
        .map(file => new URL(path.join(directory, file)));
    },
    next() {
      this.animation = this.animations[this.random()];

      this.playIndex =
        this.playIndex < this.pictures.length - 1 ? this.playIndex + 1 : 0;
    },
    random() {
      return Math.floor(Math.random() * this.animations.length);
    }
  },
  watch: {
    gallery: "initial"
  }
};
</script>

<style scoped>
ul {
  z-index: 3;
  position: absolute;
  width: 100%;
  height: 100%;
}

li {
  display: block;
  width: 1024px;
  height: 768px;
  background-size: cover;
  position: absolute;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 1s ease-in-out;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.rotate-enter-active,
.rotate-leave-active {
  transition: all 1s linear;
}

.rotate-enter {
  opacity: 0;
}

.rotate-enter-to,
.rotate-leave {
  opacity: 1;
}

.rotate-leave-active {
  transform: rotate(-3deg) scale(1.2);
}

.rotate-leave-to {
  opacity: 0;
}
</style>


