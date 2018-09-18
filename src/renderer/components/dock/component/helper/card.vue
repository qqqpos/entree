<template>
    <div class="card" @click="$emit('menu')">
        <h5>{{$t('card.giftCard')}}<i class="fas fa-ellipsis-h light more"></i></h5>
        <div class="wrap">
            <div class="column f1">
                <span class="value">{{card.number | card}}</span>
                <span class="text">{{$t('card.number')}}</span>
            </div>
            <div class="column">
                <span class="value">$ {{card.balance | decimal}}</span>
                <span class="text">{{$t('card.balance')}}</span>
            </div>              
        </div>
        <div class="mask" v-show="focus">
            <span @click.stop="$emit('use')"><i class="far fa-credit-card space"></i>{{$t('button.pay')}}</span>
            <span @click.stop="$emit('reload')"><i class="fas fa-hand-holding-usd space"></i>{{$t('card.reload')}}</span>
            <span @click.stop="$emit('view')"><i class="fas fa-list-ol space"></i>{{$t('button.view')}}</span>
        </div>
    </div>
</template>

<script>
export default {
  props: ["card", "focus"]
};
</script>

