<template>
 <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.database.index'}">
                    <i class="fa fa-database"></i>
                    <span class="text">{{$t('nav.status')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.database.street'}">
                    <i class="fa fa-location-arrow"></i>
                    <span class="text">{{$t('nav.address')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.database.customer'}">
                    <i class="fa fa-users"></i>
                    <span class="text">{{$t('nav.customer')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.database.call'}">
                    <i class="fa fa-phone-square"></i>
                    <span class="text">{{$t('nav.callLog')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.database.cashFlow'}">
                    <i class="fa fa-exchange"></i>
                    <span class="text">{{$t('nav.cashFlow')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.database.events'}">
                    <i class="fa fa-sort-alpha-asc"></i>
                    <span class="text">{{$t('nav.events')}}</span>
                </router-link>
            </div>
            <router-link tag="li" :to="{name:'Setting.index'}">
                <i class="fa fa-arrow-circle-left"></i>
                <span class="text">{{$t('nav.back')}}</span>
            </router-link>
        </ul>
        <section class="content">
            <transition name="switch">
                <router-view class="page" @change="onChange" @unchange="change = false"></router-view>
            </transition>
            <transition appear name="fadeUp">
                <footer class="update" v-if="change">
                    <i class="fa fa-info-circle"></i>
                    <p class="f1">{{txt}}</p>
                    <div v-show="!send">
                        <span @click="cancel" class="cancel">{{$t('button.cancel')}}</span>
                        <span @click="update" class="save">{{$t('button.save')}}</span>
                    </div>
                </footer>
            </transition>
        </section>
    </section>
</template>

<script>
export default {
  data() {
    return {
      change: false,
      send: false
    };
  },
  methods: {
    back() {
      this.$router.push({ name: "Setting.index" });
    },
    onChange(store) {
      this.txt = this.$t("text.saveSetting");
      this.change = true;
      this.store = store;
      this.send = false;
    },
    update() {
      this.txt = this.$t("text.settingUpdated");
      this.send = true;
    },
    cancel() {
      this.store = null;
      this.change = false;
      this.send = false;
    }
  }
};
</script>

<style></style>