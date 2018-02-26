<template>
    <div>
        <section class="card">
            <header>{{$t('setting.dineIn')}}
            </header>
            <article>
                <smart-switch v-model="table.layout" label="text.enable"></smart-switch>
                <smart-switch v-model="table.guestCount" label="text.guestCount"></smart-switch>
                <smart-switch v-model="table.seatOrder" label="text.orderBySeat"></smart-switch>
                <smart-switch v-model="table.autoClean" label="text.autoClear" tip="tip.table.autoClearTable"></smart-switch>
                <smart-switch v-model="table.passwordRequire" label="text.passwordRequire" tip="tip.table.passwordRequire"></smart-switch>
            </article>
        </section>
        <section class="card">
            <header>
                <span>{{$t('title.doneAction')}}</span>
                <span class="tip">{{$t('tip.table.actionsOnDone')}}</span>
            </header>
            <article>
                <smart-switch v-model="table.printOnDone" label="text.printReceipt" tip="tip.table.printReceiptOnDone"></smart-switch>
                <smart-switch v-model="table.lockOnDone" label="text.doneLock" tip="tip.table.lockOnDone"></smart-switch>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.autoCharge')}}
                <span class="tip">{{$t('setting.autoChargeTip')}}</span>
            </header>
            <article>
                <smart-switch v-model="table.surcharge.enable" label="text.enable"></smart-switch>
                <smart-range v-model.number="table.surcharge.when" label="text.autoChargeAbove" min="0" max="30" step="1"></smart-range>
                <smart-input v-model="table.surcharge.penalty" label="text.penalty" :disable="!table.surcharge.enable"></smart-input>
            </article>
        </section>
        <section class="card">
            <header>{{$t('setting.tipsSuggestion')}}</header>
            <article>
                <smart-switch v-model="table.tipSuggestion" label="text.enable" tip="tip.suggestion.enable"></smart-switch>
                <smart-input v-model="table.tipPercentages" label="text.tipPercentage" :disable="!table.tipSuggestion"></smart-input>
            </article>
        </section>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import smartInput from '../common/smartInput'
import smartSwitch from '../common/smartSwitch'
import smartRange from '../common/smartRange'
export default {
    components: { smartSwitch, smartInput, smartRange },
    created() {
        this.table = JSON.parse(JSON.stringify(this.store.table))


        //auto surcharge hot patch remove when v1.0.0
        if (!this.table.hasOwnProperty('surcharge')) {
            this.table = Object.assign({}, this.table, {
                surcharge: {
                    enable: false,
                    penalty: 0,
                    when: 0
                }
            })
        }
    },
    data() {
        return {
            table: {}
        }
    },
    watch: {
        table: {
            handler(n) {
                let keys = Object.keys(n);
                let isChanged = keys.some(key => {
                    return typeof n[key] === 'string' ?
                        n[key] !== this.store.table[key] :
                        JSON.stringify(n[key]) !== JSON.stringify(this.store.table[key]);
                })
                isChanged ? this.$emit("change", Object.assign({}, this.store, { table: n })) : this.$emit("unchanged");
            }, deep: true
        }
    },
    computed: {
        ...mapGetters(['store'])
    }
}
</script>

<style scoped>
.range {
    border-bottom: 1px solid #ccc;
}
</style>