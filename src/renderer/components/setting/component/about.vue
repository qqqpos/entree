<template>
    <div class="about">
        <div>{{$t('support.menuInput')}}<span class="text">{{support.menuInput}}</span></div>
        <div>{{$t('support.agent')}}:<span class="text">{{support.salesAgent}}</span>{{$t('support.hotline')}}<span class="text">{{support.contact}}</span>{{$t('support.techSupport')}}:<span class="text">{{getTime(support.contract)}}</span></div>
        <div>Copyright © 2017 - 2018 United POS Computer Inc. All Rights Reserved</div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      support: this.$store.getters.config.support || {}
    };
  },
  methods: {
    getTime(time) {
      const day = Math.round((time - Date.now()) / 8.64e7);

      if (day === Infinity) {
        return this.$t("support.EOL");
      } else if (day > 30) {
        return this.$t("support.remain", day);
      } else if (day > 0) {
        return this.$t("support.aboutExpire", day);
      } else {
        return this.$t("support.expired");
      }
    }
  }
};
</script>

<style scoped>
.about {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 14px;
  color: #343434;
}

.text {
  margin: 0 5px;
  color: #283593;
  font-weight: bold;
}
</style>
