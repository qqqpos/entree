<template>
    <div>
        <ul class="tabs">
            <router-link tag="li" class="tab" :to="{name:'Setting.marketing.feeds'}">{{$t('online.feeds')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.marketing.sharing'}">{{$t('online.socialSharing')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.marketing.adWords'}">{{$t('online.adWords')}}</router-link>
        </ul>
        <transition name="fade" mode="out-in">
            <router-view></router-view>
        </transition>
    </div>
</template>

<script>
export default {};
</script>

