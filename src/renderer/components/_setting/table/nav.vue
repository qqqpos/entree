<template>
<section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.table'}">
                    <i class="fa fa-square"></i>
                    <span class="text">{{$t('nav.seat')}}</span>
                </router-link>
            </div>
            <router-link tag="li" :to="{name:'Setting.index'}">
                <i class="fa fa-arrow-circle-left"></i>
                <span class="text">{{$t('nav.back')}}</span>
            </router-link>
        </ul>
        <section class="content">
            <transition name="switch">
                <router-view class="page"></router-view>
            </transition>
        </section>
    </section>
</template>

<script>
export default {
    methods: {
        back() {
            this.$router.push({ name: 'Setting.index' })
        }
    }
}
</script>

<style></style>