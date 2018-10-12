<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.debug'}" exact>
                    <i class="fab fa-app-store"></i>
                    <span class="text">{{$t('setting.nav.tool')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.tutorial'}" exact>
                    <i class="far fa-question-circle"></i>
                    <span class="text">{{$t('setting.nav.tutorial')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.plugin'}" exact>
                    <i class="fas fa-toolbox"></i>
                    <span class="text">{{$t('setting.nav.plugin')}}</span>
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