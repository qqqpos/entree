<template>
    <div class="popupMask setting dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5>{{$t('title.create')}}</h5>
                <h3>{{$t('text.printer')}}</h3>
            </header>
            <div class="wrap">
                <inputer v-model.trim="name" title="text.alias" :autoFocus="true" @keydown.enter.native="confirm"></inputer>
                <selector title="text.type" v-model="type" :opts="printerOpts"></selector>
            </div>
            <footer>
                <div class="opt">
                    <checkbox title="text.assignToItems" v-model="assign"></checkbox>
                </div>
                <button class="btn" @click="confirm" :disabled="!name">{{$t('button.create')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
import checkbox from "../../common/checkbox";
import selector from "../../common/selector";

export default {
    props: ["init"],
    components: { inputer, selector, checkbox },
    data() {
        return {
            name: "",
            type: "regular",
            assign: true,
            printerOpts: ["regular", "label", "hibachi"].map(type => ({
                label: this.$t('print.type.' + type),
                tooltip: "",
                value: type
            }))
        };
    },
    methods: {
        confirm() {
            if (!this.name) return;
            if (this.init.printers.includes(this.name)) return;
            this.assign && this.$socket.emit("[PRINTER] ASSIGN", this.name);

            this.init.resolve({
                name: this.name,
                type: this.type,
                assign: this.assign
            });
        }
    }
};
</script>