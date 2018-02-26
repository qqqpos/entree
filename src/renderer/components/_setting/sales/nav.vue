<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.sales'}">
                    <i class="fa fa-industry"></i>
                    <span class="text">{{$t('nav.sales')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.giftCard'}">
                    <i class="fa fa-credit-card-alt"></i>
                    <span class="text">{{$t('nav.giftCard')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.coupon'}">
                    <i class="fa fa-tags"></i>
                    <span class="text">{{$t('nav.coupon')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.batch'}">
                    <i class="fa fa-credit-card-alt"></i>
                    <span class="text">{{$t('nav.batch')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.department'}">
                    <i class="fa fa-object-group"></i>
                    <span class="text">{{$t('nav.department')}}</span>
                </router-link>
            </div>
            <router-link tag="li" :to="{name:'Setting.index'}">
                <i class="fa fa-arrow-circle-left"></i>
                <span class="text">{{$t('nav.back')}}</span>
            </router-link>
        </ul>
        <section class="content">
            <transition name="switch">
                <router-view class="page"></router-view>
            </transition>
        </section>
    </section>
</template>

<script>
export default {};
</script>
