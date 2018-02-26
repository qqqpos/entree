<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h2>{{$t('title.subMenuItem')}}</h2>
                <h4></h4>
            </header>
            <div class="inner">
                <div class="input">
                    <label>{{$t('text.primary')}}</label>
                    <input type="text" v-model="item.usEN" @keydown.enter="confirm" ref="entry">
                </div>
                <div class="input">
                    <label>{{$t('text.secondary')}}</label>
                    <input type="text" v-model="item.zhCN">
                </div>
                <div class="input">
                    <label>{{$t('text.price')}}</label>
                    <input type="text" v-model.number="item.price" placeholder="0.00">
                </div>
                <fieldset>
                    <legend>{{$t('text.printer')}}</legend>
                    <div class="wrap">
                        <checkbox v-model="item.print" :val="printer" :multiple="true" :label="printer" class="printer" v-for="(printer,index) in printers" :key="printer"></checkbox>
                    </div>
                </fieldset>
                <div class="default">
                    <checkbox v-model="item.subItem" label="text.subItem"></checkbox>
                </div>
            </div>
            <footer>
                <div class="f1">
                    <span class="del" @click="init.reject(true)">{{$t('button.delete')}}</span>
                </div>
                <div class="btn" @click="init.reject(false)">{{$t('button.cancel')}}</div>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import checkbox from '../common/checkbox'
export default {
    props: ['init'],
    components: { checkbox },
    data() {
        return {
            item: null,
            printers: null
        }
    },
    created() {
        let item = this.init.item;

        this.printers = Object.keys(this.config.printer);
        this.item = {
            _id: item._id || ObjectId(),
            zhCN: item.zhCN || '',
            usEN: item.usEN || '',
            price: item.price || 0,
            subItem: item.subItem || true,
            num: item.num || 0,
            group: item.group || '',
            print: item.print || Object.keys(this.config.printer)
        }
    },
    mounted(){
        this.$refs.entry.focus()
    },
    methods: {
        confirm() {
            if (!this.item.zhCN && !this.item.usEN) return;

            this.item.usEN = this.item.usEN.toCapitalCase();
            this.item.zhCN = this.item.zhCN ? this.item.zhCN.toCapitalCase() : this.item.usEN;
            this.item.price = isNumber(this.item.price) ? this.item.price : 0;
            this.init.resolve(this.item)
        }
    },
    computed: {
        ...mapGetters(['config'])
    }
}
</script>

<style scoped>
.fieldset {
    width: 285px;
    border-radius: 4px;
    border: 2px solid #ccc;
    padding: 5px;
}

.wrap {
    width: 285px;
    flex-wrap: wrap;
}
</style>