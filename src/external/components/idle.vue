<template>
    <div>
        <background-video :videoSrcMp4="src"></background-video>
    </div>
</template>

<script>
import backgroundVideo from "../helper/backgroundVideo";

export default {
  components: {
    backgroundVideo
  },
  props: ["config"],
  data() {
    return {
        src:"file://c:/database/load.mp4"
    };
  }
};
</script>

<style>
</style>
