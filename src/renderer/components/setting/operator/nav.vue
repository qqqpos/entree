<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.operator'}" exact>
                    <i class="fa fa-users"></i>
                    <span class="text">{{$t('nav.overview')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.operator.payroll'}">
                    <i class="fa fa-calculator"></i>
                    <span class="text">{{$t('nav.payroll')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.operator.shift'}">
                    <i class="fa fa-braille"></i>
                    <span class="text">{{$t('nav.schedule')}}</span>
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