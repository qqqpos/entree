<template>
    <div>
        <ul class="tabs">
            <router-link tag="li" class="tab" :to="{name:'Setting.store'}">{{$t('setting.storeInfo')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.store.payment'}">{{$t('setting.payment')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.store.dinein'}">{{$t('setting.dinein')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.store.others'}">{{$t('setting.others')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.store.giftcard'}">{{$t('card.giftCard')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.store.department'}">{{$t('setting.department')}}</router-link>
        </ul>
        <transition name="slide" mode="out-in">
            <router-view class="tab-content"></router-view>
        </transition>
    </div>
</template>