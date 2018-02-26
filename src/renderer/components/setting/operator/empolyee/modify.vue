<template>
    <div>
        <header class="nav">
            <router-link tag="div" :to="{name:'Setting.operator.config',params:{operator}}" class="back">
                <i class="fa fa-chevron-left"></i>
            </router-link>
            <div class="title">
                <h5>{{$t('setting.permission.modify')}}</h5>
                <h3>{{operator.name}}</h3>
            </div>
            <nav></nav>
        </header>
        <checkbox title="setting.modify.discount" v-model="operator.modify" val="discount" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.modify.price" v-model="operator.modify" val="price" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.modify.item" v-model="operator.modify" val="item" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.modify.order" v-model="operator.modify" val="order" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.modify.void" v-model="operator.modify" val="void" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.modify.table" v-model="operator.modify" val="table" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.modify.driver" v-model="operator.modify" val="driver" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.modify.tip" v-model="operator.modify" val="tip" :multiple="true" class="list"></checkbox>
        <checkbox title="setting.modify.transaction" v-model="operator.modify" val="transaction" :multiple="true" class="list"></checkbox>
    </div>
</template>

<script>
import checkbox from "../../common/checkbox";
export default {
  props: ["operator"],
  components: { checkbox }
};
</script>