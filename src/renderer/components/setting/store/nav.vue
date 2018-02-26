<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.store'}" exact>
                    <i class="fa fa-home"></i>
                    <span class="text">{{$t('nav.store')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.station'}">
                    <i class="fa fa-desktop"></i>
                    <span class="text">{{$t('nav.station')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.terminal'}">
                    <i class="fa fa-tablet"></i>
                    <span class="text">{{$t('nav.terminal')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.promotion'}">
                    <i class="fa fa-tags"></i>
                    <span class="text">{{$t('nav.promotion')}}</span>
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