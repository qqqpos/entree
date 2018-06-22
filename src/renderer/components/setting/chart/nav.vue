<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.chart'}" exact>
                    <i class="fas fa-chart-area"></i>
                    <span class="text">{{$t('nav.daily')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.chart.hourly'}" exact>
                    <i class="fas fa-chart-line"></i>
                    <span class="text">{{$t('nav.hourly')}}</span>
                </router-link>                
                <router-link tag="li" :to="{name:'Setting.chart.source'}" exact>
                    <i class="fa fa-adjust"></i>
                    <span class="text">{{$t('nav.source')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.chart.items'}" exact>
                    <i class="fas fa-chart-pie"></i>
                    <span class="text">{{$t('nav.item')}}</span>
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