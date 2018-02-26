<template>
    <div>
        <ul class="tabs">
            <router-link tag="li" class="tab" :to="{name:'Setting.database'}">{{$t('nav.status')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.database.performance'}">{{$t('nav.performance')}}</router-link>
        </ul>
        <transition name="slide" mode="out-in">
            <router-view class="tab-content" :database="database" :server="server" :space="space"></router-view>
        </transition>
    </div>
</template>

<script>
import disk from "diskusage";
export default {
    data() {
        return {
            space: null,
            database: {},
            server: {
                mem: {}
            }
        }
    },
    beforeRouteEnter: (to, from, next) => {
        appSocket.emit("[DATABASE] STATUS", result => {
            const info = disk.checkSync('c:');
            next(vm => {
                const { database, server } = result;

                vm.server = server;
                vm.database = database;
                vm.space = info.free;
            })
        })
    }
}
</script>