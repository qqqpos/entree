<template>
    <div>
        <header class="nav">
            <router-link tag="div" :to="{name:'Setting.operator.config',params:{operator}}" class="back">
                <i class="fa fa-chevron-left"></i>
            </router-link>
            <div class="title">
                <h5>{{$t('setting.permission.permission')}}</h5>
                <h3>{{operator.name}}</h3>
            </div>
            <nav></nav>
        </header>
        <checkbox title="setting.privilege.batch" v-model="operator.permission" val="batch" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.privilege.reprint" v-model="operator.permission" val="reprint" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.privilege.employee" v-model="operator.permission" val="employee" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.privilege.database" v-model="operator.permission" val="database" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.privilege.timecard" v-model="operator.permission" val="timecard" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.privilege.giftcard" v-model="operator.permission" val="giftcard" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.privilege.coupon" v-model="operator.permission" val="coupon" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.privilege.houseAccount" v-model="operator.permission" val="houseAccount" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.privilege.anydate" v-model="operator.permission" val="anydate" :multiple="true" class="list"></checkbox>
    </div>
</template>

<script>
import checkbox from "../../common/checkbox";
export default {
  props: ["operator"],
  components: { checkbox }
};
</script>