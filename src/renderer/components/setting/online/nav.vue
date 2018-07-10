<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.online'}" exact>
                    <i class="fas fa-chart-line"></i>
                    <span class="text">{{$t('online.performance')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.online.config'}">
                    <i class="fas fa-cogs"></i>
                    <span class="text">{{$t('online.config')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.online.adWords'}">
                    <i class="fab fa-adversal"></i>
                    <span class="text">{{$t('online.adWords')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.online.history'}">
                    <i class="fas fa-history"></i>
                    <span class="text">{{$t('online.history')}}</span>
                </router-link>                   
                <router-link tag="li" :to="{name:'Setting.online.bill'}">
                    <i class="fas fa-file-invoice-dollar"></i>
                    <span class="text">{{$t('online.bill')}}</span>
                </router-link>                
            </div>
            <router-link tag="li" :to="{name:'Setting.index'}" exact>
                <i class="fa fa-arrow-circle-left"></i>
                <span class="text">{{$t('nav.back')}}</span>
            </router-link>
        </ul>
        <section class="content">
            <transition name="switch" mode="out-in">
                <router-view class="page"></router-view>
            </transition>
        </section>
    </section>
</template>