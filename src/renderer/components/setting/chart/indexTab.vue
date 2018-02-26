<template>
    <div>
        <ul class="tabs">
            <router-link tag="li" class="tab" :to="{name:'Setting.chart'}">{{$t('nav.sales')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.chart.source'}">{{$t('nav.source')}}</router-link>
        </ul>
        <transition name="slide" mode="out-in">
            <router-view class="tab-content chart"></router-view>
        </transition>
    </div>
</template>