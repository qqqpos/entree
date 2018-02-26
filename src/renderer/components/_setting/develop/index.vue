<template>
    <div>
        <section class="card">
            <header>
                <span>{{$t('setting.develop')}}</span>
                <span class="tip">{{$t('setting.developTip')}}</span>
            </header>
            <article>
                <smart-switch v-model="develop.enable" label="text.enable"></smart-switch>
                <smart-switch v-model="develop.chart" label="text.chart" tip="text.chartTip"></smart-switch>
                <smart-switch v-model="develop.reload" label="text.reload"></smart-switch>
            </article>
        </section>
        <section class="card">
            <header>
                <span>{{$t('setting.security')}}</span>
                <span class="tip">{{$t('setting.restrictModeTip')}}</span>
            </header>
            <article>
                <smart-switch v-model="develop.restrict" label="text.restrict" tip="text.restrictTip"></smart-switch>
            </article>
        </section>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import smartInput from '../common/smartInput'
import smartSwitch from '../common/smartSwitch'
import smartOption from '../common/smartOption'
export default {
    components: { smartInput, smartSwitch, smartOption },
    data() {
        return {
            develop: {
                enable: false,
                chart: false,
                reload: false,
                restrict: false
            }
        }
    }
}
</script>
