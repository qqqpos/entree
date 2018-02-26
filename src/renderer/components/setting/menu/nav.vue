<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                 <router-link tag="li" :to="{name:'Setting.menu'}" exact>
                    <i class="fa fa-braille"></i>
                    <span class="text">{{$t('nav.menu')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.request'}">
                    <i class="fa fa-commenting-o"></i>
                    <span class="text">{{$t('nav.request')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.submenu'}">
                    <i class="fa fa-list"></i>
                    <span class="text">{{$t('nav.submenu')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.template'}">
                    <i class="fa fa-clone"></i>
                    <span class="text">{{$t('nav.template')}}</span>
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