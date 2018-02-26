<template>
    <div class="popupMask dark center">
        <div class="event">
            <header>{{$t('title.lastEdit')}}</header>
        </div>
    </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {};
  },
  methods: {
    confirm() {}
  }
};
</script>

<style scoped>
.event{
    background: #fcfcfc;
    border-radius: 4px;
    padding: 10px;
    max-height: 600px;
    width: 550px
}
</style>