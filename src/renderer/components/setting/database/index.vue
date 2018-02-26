<template>
    <div>
        <header class="nav">
            <nav>
                <span @click="backup" v-show="isHost">{{$t('button.backup')}}</span>
            </nav>
            <div class="title">
                <h3>{{$t('title.databaseHealth')}}</h3>
            </div>
            <nav>
                <span>{{$t('button.restore')}}</span>
            </nav>
        </header>
        <div class="data-status">
            <h3>{{$t('database.dataSize')}}</h3>
            <h5>{{space | mb}} / {{database.dataSize | mb}}</h5>
        </div>
        <div class="data-status">
            <h3>{{$t('database.storageSize')}}</h3>
            <h5>{{database.storageSize | mb}}</h5>
        </div>
        <div class="data-status">
            <h3>{{$t('database.collection')}}</h3>
            <h5>{{database.collections}}</h5>
        </div>
        <div class="data-status">
            <h3>{{$t('database.objects')}}</h3>
            <h5>{{database.objects}}</h5>
        </div>
        <div class="data-status">
            <h3>{{$t('database.averageSize')}}</h3>
            <h5>{{database.avgObjSize | kb}}</h5>
        </div>
        <div class="data-status">
            <h3>{{$t('database.index')}}</h3>
            <h5>{{database.indexes}}</h5>
        </div>
        <div class="data-status">
            <h3>{{$t('database.indexSize')}}</h3>
            <h5>{{database.indexSize | kb}}</h5>
        </div>
        <div class="data-status">
            <h3>{{$t('database.version')}}</h3>
            <h5>{{server.version}}
                <span> ({{$t("text.bit",server.mem.bits)}})</span>
            </h5>
        </div>
        <div class="data-status">
            <h3>{{$t('database.uptime')}}</h3>
            <h5>{{uptime(server.uptime)}}</h5>
        </div>
        <div class="data-status">
            <h3>{{$t('database.memoryUsage')}}</h3>
            <h5>{{server.mem.resident}} MB</h5>
        </div>
    </div>
</template>

<script>
import disk from "diskusage";

export default {
    props: ["space", "database", "server"],
    filters: {
        mb(value) {
            return value ? (value / 1048576).toFixed(2) + " MB" : value;
        },
        kb(value) {
            return value ? (value / 1024).toFixed(2) + " KB" : value;
        }
    },
    data() {
        return {
            isHost: true//window.isServer === true
        }
    },
    methods: {
        uptime(duration) {
            const hh = ("00" + Math.floor(duration / 3600)).slice(-2);
            const mm = ("00" + Math.floor(duration / 60 % 60)).slice(-2);
            const ss = ("00" + Math.floor(duration % 60)).slice(-2);

            return this.$t("text.hhmmss", hh, mm, ss);
        },
        backup() {
            const { dialog } = require('electron').remote;

            dialog.showOpenDialog({ title: "Save backup to...", properties: ["openDirectory"] },
                directory => {
                    // directory && dump({
                    //     uri: "mongodb://localhost:27017/UnitedPOS",
                    //     root: directory,
                    //     metadata:true,
                    //     result(e) {
                    //         console.log("done")
                    //     }
                    // })
                });
        }
    }
}
</script>