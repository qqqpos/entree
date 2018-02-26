<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h2>{{$t(init.title)}}</h2>
            </header>
            <div class="form">
                <div class="input">
                    <label>{{$t('text.primary')}}</label>
                    <input v-model="item.usEN">
                </div>
                <div class="input">
                    <label>{{$t('text.secondary')}}</label>
                    <input v-model="item.zhCN" @keydown.enter="done">
                </div>

                <div class="input">
                    <label>{{$t('text.price')}}</label>
                    <input v-model.number="item.price" @keydown.enter="done">
                </div>
                <fieldset>
                    <legend>{{$t('text.printer')}}</legend>
                    <div class="wrap">
                        <checkbox v-model="item.print" :val="printer" :multiple="true" :label="printer" class="printer" v-for="(printer,index) in printers" :key="printer"></checkbox>
                    </div>
                </fieldset>
            </div>
            <footer>
                <div class="f1">
                    <span class="del" @click="del">{{$t('button.delete')}}</span>
                </div>
                <div class="btn" @click="init.reject(false)">{{$t('button.cancel')}}</div>
                <div class="btn" @click="done">{{$t('button.confirm')}}</div>
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
            item: {},
            printers: []
        }
    },
    created() {
        this.init.item && Object.assign(this.item, this.init.item);
        this.printers = Object.keys(this.config.printer);
        !this.item.hasOwnProperty("print") && (this.item.print = [...this.printers]);
    },
    methods: {
        del() {
            this.init.reject(true)
        },
        done() {
            !isNumber(this.item.price) && (this.item.price = 0);
            !this.item.hasOwnProperty("key") && (this.item.key = Math.random().toString(36).substring(3, 7));
            this.init.resolve(this.item)
        }
    },
    computed: {
        ...mapGetters(['config'])
    }
}
</script>

<style scoped>
.form {
    padding: 15px 20px;
}

input {
    width: 100px;
}

.printers {
    display: flex;
    padding: 7px 0 3px;
}
.wrap .checkbox {
    width: 120px;
}

.wrap {
    width: 285px;
    display: flex;
    flex-wrap: wrap;
}
</style>