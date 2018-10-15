<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.station'}" exact>
                    <i class="fa fa-desktop"></i>
                    <span class="text">{{$t('nav.station')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.station.device'}">
                    <i class="fa fa-hdd"></i>
                    <span class="text">{{$t('title.device')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.station.interface'}">
                    <i class="fas fa-grip-horizontal"></i>
                    <span class="text">{{$t('setting.interface')}}</span>
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