<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.store'}" exact>
                    <i class="fas fa-store"></i>
                    <span class="text">{{$t('setting.nav.store')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.payment'}" exact>
                    <i class="fas fa-hand-holding-usd"></i>
                    <span class="text">{{$t('setting.nav.payment')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.terminal'}">
                    <i class="fas fa-credit-card"></i>
                    <span class="text">{{$t('setting.nav.terminal')}}</span>
                </router-link>
                <router-link tag="li" class="tab" :to="{name:'Setting.store.giftcard'}">
                    <i class="fas fa-id-card-alt"></i>
                    <span class="text">{{$t('setting.nav.giftcard')}}</span>
                </router-link>
                <router-link tag="li" class="tab" :to="{name:'Setting.store.department'}">
                    <i class="fas fa-boxes"></i>
                    <span class="text">{{$t('setting.nav.department')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.promotion'}">
                    <i class="fa fa-tags"></i>
                    <span class="text">{{$t('setting.nav.coupon')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.reward'}">
                    <i class="fas fa-award"></i>
                    <span class="text">{{$t('setting.nav.reward')}}</span>
                </router-link>                
                <router-link tag="li" class="tab" :to="{name:'Setting.store.others'}">
                    <i class="fas fa-sliders-h"></i>
                    <span class="text">{{$t('setting.nav.other')}}</span>
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