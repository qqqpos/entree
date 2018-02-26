<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.printer'}">
                    <i class="fa fa-print"></i>
                    <span class="text">{{$t('nav.overview')}}</span>
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