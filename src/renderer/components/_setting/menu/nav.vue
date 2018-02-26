<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.menu'}">
                    <i class="fa fa-braille"></i>
                    <span class="text">{{$t('nav.menu')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.subMenu'}">
                    <i class="fa fa-list"></i>
                    <span class="text">{{$t('nav.subMenu')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.request'}">
                    <i class="fa fa-commenting-o"></i>
                    <span class="text">{{$t('nav.request')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.template'}">
                    <i class="fa fa-clone"></i>
                    <span class="text">{{$t('nav.template')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.display'}">
                    <i class="fa fa-eye-slash"></i>
                    <span class="text">{{$t('nav.display')}}</span>
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
import { mapActions } from 'vuex'
export default {
    data() {
        return {
            change: false,
            send: false
        }
    },
    methods: {
        back() {
            this.$router.push({ name: 'Setting.index' })
        },
        onChange(ctrl) {
            this.txt = this.$t("text.saveSetting");
            this.change = true;
            this.ctrl = ctrl;
            this.send = false;
        },
        update() {
            this.txt = this.$t('text.settingUpdated');
            this.send = true;
            this.$socket.emit("[CMS] CONFIG_DISPLAY", this.ctrl);
            this.setConfig({ display: this.ctrl });
            setTimeout(() => { this.cancel() }, 1500);
        },
        cancel() {
            this.ctrl = null;
            this.change = false;
            this.send = false;
        },
        ...mapActions(['setConfig'])
    }
}
</script>

<style></style>