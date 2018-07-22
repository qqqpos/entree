<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                 <router-link tag="li" :to="{name:'Setting.menu'}" exact>
                    <i class="fa fa-braille"></i>
                    <span class="text">{{$t('nav.menu')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.request'}">
                    <i class="far fa-comment-dots"></i>
                    <span class="text">{{$t('nav.request')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.template'}">
                    <i class="far fa-list-alt"></i>
                    <span class="text">{{$t('nav.template')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.menu.config'}">
                    <i class="fas fa-cogs"></i>
                    <span class="text">{{$t('nav.config')}}</span>
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