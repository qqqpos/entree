<template>
    <div class="table">
        <table class="data">
            <thead>
                <tr>
                    <th>{{$t('thead.name')}}</th>
                    <th>{{$t('text.role')}}</th>
                    <th>{{$t('thead.count')}}</th>
                    <th>{{$t('text.validRecord')}}</th>
                    <th>{{$t('thead.baseWage')}}</th>
                    <th class="time">{{$t('thead.totalWorkTime')}}</th>
                    <th class="time">{{$t('thead.validWorkTime')}}</th>
                    <th>{{$t('thead.salary')}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(payroll,index) in payrolls" :key="index">
                    <td>{{payroll.name}}</td>
                    <td>{{$t('type.'+payroll.role)}}</td>
                    <td>{{payroll.count}}</td>
                    <td>{{payroll.valid}}</td>
                    <td>$ {{payroll.wage | decimal}}</td>
                    <td class="time">{{format(payroll.totalTime)}}</td>
                    <td class="time">{{format(payroll.validTime)}}</td>
                    <td>$ {{payroll.salary | decimal}}</td>
                </tr>
            </tbody>
            <tfoot>
            </tfoot>
        </table>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
export default {
    props: ["payrolls"],
    data() {
        return {
            componentData: null,
            component: null
        }
    },
    methods: {
        format(time) {
            const duration = moment.duration(time);

            return this.$t("text.hhmmss", Math.floor(duration.asHours()), duration.minutes(), duration.seconds())
        }
    }
}
</script>

<style scoped>
.time {
  width: 200px;
}
</style>