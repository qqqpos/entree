<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.online.config'}">
                    <i class="fa fa-cogs"></i>
                    <span class="text">{{$t('nav.config')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.online.menu'}">
                    <i class="fa fa-th"></i>
                    <span class="text">{{$t('nav.menu')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.online.tool'}">
                    <i class="fa fa-clone"></i>
                    <span class="text">{{$t('nav.tool')}}</span>
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
import { mapGetters, mapActions } from 'vuex'
export default {
    data() {
        return {
            change: false,
            send: false,
            store: null
        }
    },
    methods: {
        back() {
            this.$router.push({ name: 'Setting.index' })
        },
        onChange(store) {
            this.txt = this.$t("text.saveSetting");
            this.change = true;
            this.store = store;
            this.send = false;
        },
        update() {
            this.txt = this.$t('text.settingUpdated');
            this.send = true;
            this.$socket.emit("[CMS] CONFIG_STORE", this.store);
            this.setConfig({ store: this.store })
            this.updateStation(this.store);
            setTimeout(() => { this.cancel() }, 1000);
        },
        updateStation(store) {
            let { station } = store;
            let { mac } = this.station;
            for (var name in station) {
                station[name].mac === mac && this.setStation(station[name])
            }
        },
        cancel() {
            this.store = null;
            this.change = false;
            this.send = false;
        },
        ...mapActions(['setConfig', 'setStation'])
    },
    computed: {
        ...mapGetters(['station'])
    }
}
</script>