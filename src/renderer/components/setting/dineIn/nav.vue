<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.dineIn'}" exact>
                    <i class="fas fa-grip-horizontal"></i>
                    <span class="text">{{$t('nav.seat')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.dineIn.config'}">
                    <i class="fas fa-sliders-h"></i>
                    <span class="text">{{$t('nav.setting')}}</span>
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