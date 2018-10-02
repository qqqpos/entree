<template>
    <div>
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
      this.$router.push({ name: "Setting.template" });
      this.template = null;
    }
  }
};
</script>