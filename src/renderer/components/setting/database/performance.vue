<template>
    <div>
        <header class="nav">
            <div class="title">
                <h3>{{database.db}}</h3>
            </div>
        </header>
        <div class="statistic">
            <h3>{{$t('database.asserts')}}</h3>
            <h5>
                <span>{{$t('database.warningAssert')}}</span>
                <span class="value">{{server.asserts.warning}}</span>
            </h5>
            <h5>
                <span>{{$t('database.msgAssert')}}</span>
                <span class="value">{{server.asserts.msg}}</span>
            </h5>
            <h5>
                <span>{{$t('database.userAssert')}}</span>
                <span class="value">{{server.asserts.msg}}</span>
            </h5>
        </div>
        <div class="statistic">
            <h3>{{$t('database.connection')}}</h3>
            <h5>
                <span>{{server.connections.available}} {{$t('database.available')}} / </span>
                <span>{{server.connections.current}} {{$t('database.current')}}</span>
            </h5>
            <h5>
                <span>{{$t('database.totalCreated')}}</span>
                <span class="value">{{server.connections.totalCreated}}</span>
            </h5>
        </div>
        <div class="statistic">
            <h3>{{$t('database.network')}}</h3>
            <h5>
                <span>{{$t('database.bytesIn')}}</span>
                <span class="value">{{server.network.bytesIn | mb}}</span>
            </h5>
            <h5>
                <span>{{$t('database.bytesOut')}}</span>
                <span class="value">{{server.network.bytesOut | mb}}</span>
            </h5>
            <h5>
                <span>{{$t('database.request')}}</span>
                <span class="value">{{server.network.numRequests}}</span>
            </h5>
        </div>
        <div class="statistic">
            <h3>{{$t('database.operation')}}</h3>
            <h5>
                <span>{{$t('database.insert')}}</span>
                <span class="value">{{server.opcounters.insert}}</span>
            </h5>
            <h5>
                <span>{{$t('database.query')}}</span>
                <span class="value">{{server.opcounters.query}}</span>
            </h5>
            <h5>
                <span>{{$t('database.update')}}</span>
                <span class="value">{{server.opcounters.update}}</span>
            </h5>
            <h5>
                <span>{{$t('database.delete')}}</span>
                <span class="value">{{server.opcounters.delete}}</span>
            </h5>
            <h5>
                <span>{{$t('database.command')}}</span>
                <span class="value">{{server.opcounters.command}}</span>
            </h5>
        </div>
        <div class="statistic">
            <h3>{{$t('database.memoryUsage')}}</h3>
            <h5>
                <span>{{$t('database.resident')}}</span>
                <span class="value">{{server.mem.resident}} MB</span>
            </h5>
            <h5>
                <span>{{$t('database.virtual')}}</span>
                <span class="value">{{server.mem.virtual}} MB</span>
            </h5>
        </div>
        <div class="statistic">
            <h3>{{$t('database.extraInfo')}}</h3>
            <h5>
                <span>{{$t('database.pageFaults')}}</span>
                <span class="value">{{server.extra_info.page_faults}}</span>
            </h5>
        </div>
    </div>
</template>

<script>
export default {
    props: ["server", "database"],
    filters: {
        mb(value) {
            return value ? (value / 1048576).toFixed(2) + " MB" : value;
        },
        kb(value) {
            return value ? (value / 1024).toFixed(2) + " KB" : value;
        }
    },
}
</script>
