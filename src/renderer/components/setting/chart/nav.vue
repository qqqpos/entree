<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.chart'}" exact>
                    <i class="fa fa-bar-chart"></i>
                    <span class="text">{{$t('nav.overview')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.chart.source'}" exact>
                    <i class="fa fa-pie-chart"></i>
                    <span class="text">{{$t('nav.source')}}</span>
                </router-link>
            </div>
            <router-link tag="li" :to="{name:'Setting.index'}" exact>
                <i class="fa fa-arrow-circle-left"></i>
                <span class="text">{{$t('nav.back')}}</span>
            </router-link>
        </ul>
        <section class="content">
            <transition name="switch" mode="out-in">
                <router-view class="chart page"></router-view>
            </transition>
        </section>
    </section>
</template>