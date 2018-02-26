<template>
    <div class="window">
        <header class="title">
            <span>{{$t('title.purchaseHistory')}}</span>
            <i class="fa fa-times" @click="init.reject"></i>
        </header>
        <div class="inner">
            <table>
                <thead>
                    <tr>
                        <th>{{$t('thead.date')}}</th>
                        <th>{{$t('thead.type')}}</th>
                        <th>{{$t('thead.cashier')}}</th>
                        <th>{{$t('thead.balance')}}</th>
                        <th>{{$t('thead.change')}}</th>
                        <th>{{$t('thead.ticket')}}</th>
                        <th>{{$t('thead.view')}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(record,index) in records" :key="index">
                        <td>{{record.date}}</td>
                        <td>{{$t('type.'+record.type)}}</td>
                        <td>{{record.cashier}}</td>
                        <td>{{record.balance | decimal}}</td>
                        <td v-if="record.change > 0" class="positive">{{record.change | decimal}}</td>
                        <td v-else class="negative">{{record.change | decimal}}</td>
                        <td v-if="record.order">
                            <span>#{{record.order.number}}</span>
                            <span>{{$t('type.'+record.order.type)}}</span>
                        </td>
                        <td v-else></td>
                        <td>
                            <i class="fa fa-file-text-o" @click="viewReceipt(record.order._id)" v-show="record.order && record.order._id"></i>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <transition name="fadeUp">
            <div class="popupMask center dark" @click.self="component = null" v-if="component">
                <div :is="component" :init="componentData"></div>
            </div>
        </transition>
    </div>
</template>

<script>
import ticket from '../common/ticket'
export default {
    props: ['init'],
    components: { ticket },
    data() {
        return {
            componentData: null,
            component: null,
            records: []
        }
    },
    created() {
        this.$socket.emit("[GIFTCARD] HISTORY", this.init.card.number, (records) => { this.records = records })
    },
    methods: {
        viewReceipt(id) {
            this.$socket.emit("[VIEW] INVOICE", id, ticket => { this.$p('ticket', { ticket }) })
        }
    }
}
</script>

<style scoped>
.window {
    width: 900px;
}

.inner {
    height: 600px;
    overflow:auto;
}

td.positive {
    color: green;
}

td.negative {
    color: #FF5722;
}

table {
    border-collapse: collapse;
    width: 100%;
}

tbody tr {
    background: #fff;
}

th {
    padding: 7px 5px;
    text-align: center;
}

tbody tr:nth-child(even) {
    background: #f5f5f5;
    border-bottom: 1px solid #f1f1f1;
}

td {
    padding: 10px 5px;
    text-align: center;
}
</style>