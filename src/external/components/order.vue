<template>
    <div>
        <background-video :videoSrcMp4="src"></background-video>
    </div>
</template>

<script>
import backgroundVideo from "../helper/backgroundVideo";
export default {
  components: { backgroundVideo },
  props: ["config", "order"],
  data() {
    return {
      src: ["file://c:/database/3.mp4", "file://c:/database/4.mp4", "file://c:/database/2.mp4"]
    };
  }
};
</script>

<style scoped>
</style>



