<template>
  <div class="container">
    <video playsinline autoplay muted :poster="poster" :src="src" class="background-vid" @ended="onVideoEnded" ref="video"></video>
    <div class="text-overlay" v-if="textOverlay">
      <h1 v-text="title"></h1>
      <h2 v-text="subtitle"></h2>
      <p v-text="content"></p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    videoSrcMp4: {
      default: "",
      type: [String, Array]
    },
    poster: {
      default: "",
      default: String
    },
    textOverlay: {
      default: false,
      type: Boolean
    },
    title: {
      default: "",
      type: String
    },
    subtitle: {
      default: "",
      type: String
    },
    content: {
      default: "",
      type: String
    }
  },
  data() {
    return {
      playIndex: 0,
      src: ""
    };
  },
  created() {
    if (Array.isArray(this.videoSrcMp4)) {
      this.src = this.videoSrcMp4[this.playIndex];
    } else {
      this.src = this.videoSrcMp4;
    }
  },
  methods: {
    onVideoEnded() {
      if (Array.isArray(this.videoSrcMp4)) {
        this.playIndex =
          this.playIndex < this.videoSrcMp4.length - 1 ? this.playIndex + 1 : 0;

        this.src = this.videoSrcMp4[this.playIndex];
      }else{
        this.$refs.video.play();
      }
    }
  }
};
</script>

<style scoped>
.container {
  position: fixed;
  z-index: -1;
  top: 0px;
  left: 0px;
  bottom: 0px;
  right: 0px;
  overflow: hidden;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-image: none;
}
.background-vid {
  position: fixed;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  z-index: -100;
  transform: translate(-50%, -50%);
}
.text-overlay {
  font-weight: 100;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  padding: 2rem;
  width: 33%;
  margin: 2rem;
  float: right;
  font-size: 1.2rem;
  min-height: 410px;
}
.text-overlay h1 {
  color: #fff;
  font-size: 38px;
}
.text-overlay h2 {
  font-size: 28px;
  color: #fff;
}
.text-overlay p {
  font-size: 14px;
}
</style>