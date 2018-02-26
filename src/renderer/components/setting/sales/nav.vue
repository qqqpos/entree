<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.sales'}" exact>
                    <i class="fa fa-bar-chart"></i>
                    <span class="text">{{$t('nav.revenue')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.sales.giftcard'}" exact>
                    <i class="fa fa-gift"></i>
                    <span class="text">{{$t('text.giftCard')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.sales.batch'}" exact>
                    <i class="fa fa-file-text-o"></i>
                    <span class="text">{{$t('nav.batch')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.sales.cashflow'}" exact>
                    <i class="fa fa-money"></i>
                    <span class="text">{{$t('nav.cashFlow')}}</span>
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