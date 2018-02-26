<template>
    <div>
        <section class="card">
            <header>{{$t('setting.onlineOrder')}}
                <span class="tip">{{$t('setting.onlineOrderTip')}}</span>
            </header>
            <article>
                <smart-switch v-model="online.enable" label="text.enable"></smart-switch>
                <smart-input v-model="online.ip" label="text.ipAddress" reg="^\d+\s[A-z]+\s[A-z]+"></smart-input>
                <smart-input v-model="online.port" label="text.port" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
                <smart-input v-model="online.user" label="text.account" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
                <smart-input v-model="online.password" label="text.password" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
                <smart-input v-model="online.database" label="text.database" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.security')}}</header>
            <article>
                <smart-input v-model="online.privateKey" label="text.privateKey" reg="^\d+\s[A-z]+\s[A-z]+"></smart-input>
                <smart-input v-model="online.rsaExp" label="text.expirationDate" reg="^[a-zA-Z0-9_. ]{5,30}$" :disable="true"></smart-input>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.acceptance')}}</header>
            <article>
                <smart-switch v-model="online.acceptCreditCard" label="text.acceptCreditCard"></smart-switch>
                <smart-switch v-model="online.acceptDelivery" label="text.acceptDelivery"></smart-switch>
                <smart-switch v-model="online.acceptReservation" label="text.acceptReservation"></smart-switch>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.other')}}</header>
            <article>
                <smart-input v-model="online.deliveryFee" label="text.deliveryFee" :disable="!online.acceptDelivery"></smart-input>
                <smart-input v-model="online.minCashRequire" label="text.minCashRequire" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
                <smart-input v-model="online.minCreditRequire" label="text.minCreditRequire" reg="^\d+\s[A-z]+\s[A-z]+"></smart-input>
                <smart-input v-model="online.maxDeliverMile" label="text.maxDeliverMile" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
                <smart-input v-model="online.pickupWaitTime" label="text.pickupWaitTime" reg="^\d+\s[A-z]+\s[A-z]+"></smart-input>
                <smart-input v-model="online.deliveryWaitTime" label="text.deliveryWaitTime" reg="^[a-zA-Z0-9_. ]{5,30}$"></smart-input>
            </article>
        </section>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import smartInput from '../common/smartInput'
import smartSwitch from '../common/smartSwitch'
export default {
    components: { smartInput, smartSwitch },
    created() {
        this.online = JSON.parse(JSON.stringify(this.config.online));
    },
    data() {
        return {
            online: null
        }
    },
    computed: {
        ...mapGetters(['config'])
    }
}
</script>

<style></style>