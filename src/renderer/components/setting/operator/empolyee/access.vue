<template>
    <div>
        <header class="nav">
            <router-link tag="div" :to="{name:'Setting.operator.config',params:{operator}}" class="back">
                <i class="fa fa-chevron-left"></i>
            </router-link>
            <div class="title">
                <h5>{{$t('setting.permission.access')}}</h5>
                <h3>{{operator.name}}</h3>
            </div>
            <nav></nav>
        </header>
        <checkbox title="setting.access.setting" v-model="operator.access" val="setting" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.access.report" v-model="operator.access" val="report" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.access.terminal" v-model="operator.access" val="terminal" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.access.history" v-model="operator.access" val="history" :multiple="true" class="list"></checkbox>
    </div>
</template>

<script>
import checkbox from "../../common/checkbox";
export default {
    props: ["operator"],
    components: { checkbox }
};
</script>