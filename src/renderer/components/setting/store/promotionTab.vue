<template>
    <div>
        <ul class="tabs">
            <router-link tag="li" class="tab" :to="{name:'Setting.promotion'}">{{$t('text.setting')}}</router-link>
        </ul>
        <transition name="slide" mode="out-in">
            <router-view class="tab-content"></router-view>
        </transition>
        
    </div>
</template>