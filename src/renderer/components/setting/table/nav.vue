<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.table'}" exact>
                    <i class="fa fa-braille"></i>
                    <span class="text">{{$t('nav.seat')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.hibachi'}">
                    <i class="fa fa-square"></i>
                    <span class="text">{{$t('nav.hibachi')}}</span>
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