<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.sales'}" exact>
                    <i class="fas fa-money-bill-wave"></i>
                    <span class="text">{{$t('setting.nav.sales')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.sales.batch'}" exact>
                    <i class="fas fa-mobile-alt"></i>
                    <span class="text">{{$t('nav.batch')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.sales.giftcard'}" exact>
                    <i class="fa fa-gift"></i>
                    <span class="text">{{$t('text.giftCard')}}</span>
                </router-link>                
                <router-link tag="li" :to="{name:'Setting.sales.cashflow'}" exact>
                    <i class="fas fa-hand-holding-usd"></i>
                    <span class="text">{{$t('nav.cashFlow')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.sales.payout'}">
                    <i class="fas fa-money-check-alt"></i>
                    <span class="text">{{$t('nav.payout')}}</span>
                </router-link>                
            </div>
            <router-link tag="li" :to="{name:'Setting.index'}" exact>
                <i class="fa fa-arrow-circle-left"></i>
                <span class="text">{{$t('nav.back')}}</span>
            </router-link>
        </ul>
        <section class="content">
            <router-view class="page"></router-view>
        </section>
    </section>
</template>