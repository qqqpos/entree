<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5>{{$t('title.edit')}}</h5>
                <h3>{{$t('title.footer')}}</h3>
            </header>
            <div class="wrap">
                <inputer type="textarea" v-model.trim="footer.content" title="text.content" :center="true"></inputer>
                <switches title="print.geographic" v-model="footer.geo"></switches>
                <switches title="print.ticketNumber" v-model="footer.ticketNumber"></switches>
                <switches title="print.tableName" v-model="footer.tableName"></switches>
                <switches title="print.tradeMark" v-model="footer.tradeMark"></switches>
                <switches title="print.jobTime" v-model="footer.jobTime"></switches>
            </div>
            <footer>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
import switches from "../../common/switches";

export default {
    props: ["init"],
    components: { inputer, switches },
    data() {
        return {
            footer: JSON.parse(JSON.stringify(this.init.footer))
        };
    },
    created() {
        this.footer.content = this.footer.content.join(String.fromCharCode(10))
    },
    methods: {
        confirm() {
            this.footer.content = this.footer.content.split(String.fromCharCode(10));
            this.init.resolve(this.footer);
        }
    }
};
</script>