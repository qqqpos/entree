<template>
    <div>
        <ul class="tabs">
            <router-link tag="li" class="tab" :to="{name:'Setting.station'}">{{$t('setting.station')}}</router-link>
            <router-link tag="li" class="tab" :to="{name:'Setting.station.interface'}">{{$t('setting.interface')}}</router-link>
        </ul>
        <transition name="slide" mode="out-in">
            <router-view class="tab-content" :class="{wide:$route.name === 'Setting.station.interface'}"></router-view>
        </transition>
    </div>
</template>