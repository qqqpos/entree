<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.database'}" exact>
                    <i class="fa fa-database"></i>
                    <span class="text">{{$t('nav.overview')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.database.customer'}">
                    <i class="fa fa-users"></i>
                    <span class="text">{{$t('nav.customer')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.database.address'}">
                    <i class="fas fa-map-marked-alt"></i>
                    <span class="text">{{$t('nav.address')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.database.payout'}">
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
            <transition name="switch" mode="out-in">
                <router-view class="page"></router-view>
            </transition>
        </section>
    </section>
</template>