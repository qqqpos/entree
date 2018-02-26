<template>
    <div>
        <ul class="tabs">
            <router-link tag="li" class="tab" :to="{name:'Setting.template'}">{{$t('nav.list')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.template.config'}" :class="{disable:!template}">{{$t('nav.config')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.template.item'}" :class="{disable:!template}">{{$t('nav.template')}}</router-link>
        </ul>
        <transition name="slide" mode="out-in">
            <router-view class="tab-content" :template="template" @set="setTemplate" @reset="resetTemplate"></router-view>
        </transition>
    </div>
</template>

<script>
export default {
  data() {
    return {
      template: null
    };
  },
  methods: {
    setTemplate(template) {
      this.template = template;
      this.$router.push({ name: "Setting.template.config" });
    },
    resetTemplate() {
      this.template = null;
      this.$router.push({ name: "Setting.template" });
    }
  }
};
</script>