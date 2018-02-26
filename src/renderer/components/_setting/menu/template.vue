<template>
    <div>
        <section class="card list">
            <header>{{$t('setting.template')}}
                <span class="tip">{{$t('setting.templateTip')}}</span>
            </header>
            <div class="header">
                <span class="name">{{$t('text.name')}}</span>
                <span class="f1">{{$t('text.contain')}}</span>
                <span class="action">{{$t('text.action')}}</span>
            </div>
            <article>
                <div v-for="(name,index) in builder" class="datalist" :key="index">
                    <span class="name">{{name.template}}</span>
                    <span class="f1">
                        <div v-for="(item,i) in name.contain" :key="i">
                            <span>{{item.name}}</span>
                            <span>({{item.contain.length}})</span>
                        </div>
                    </span>
                    <span class="action" @click="edit(name,index)">
                        <span>
                            <i class="fa fa-pencil"></i>
                            <span>{{$t("text.edit")}}</span>
                        </span>
                    </span>
                </div>
                <div class="datalist add" @click="add()">
                    <i class="fa fa-3x fa-plus"></i>
                </div>
            </article>
        </section>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import smartSwitch from '../common/smartSwitch'
import smartInput from '../common/smartInput'
import checkbox from '../common/checkbox'
import editor from './templateEditor'
export default {
    components: { smartInput, smartSwitch, checkbox, editor },
    created() {
        this.builder = JSON.parse(JSON.stringify(this.templates))
    },
    data() {
        return {
            builder: null,
            change: false,
            component: null,
            componentData: null
        }
    },
    methods: {
        edit(template, index) {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject, template };
                this.component = "editor";
            }).then((result) => {
                this.builder.splice(index, 1, result);
                this.setTemplates(this.builder);
                this.$socket.emit("[CMS] UPDATE_TEMPLATE", result);
                this.$exitComponent();
            }).catch((del) => {
                del && this.builder.splice(index, 1) && this.$socket.emit("[CMS] DELETE_TEMPLATE", { _id: template._id });
                this.setTemplates(this.builder);
                this.$exitComponent();
            })
        },
        add() {
            let name = "template" + (this.builder.length + 1);
            this.builder.push({
                _id: ObjectId(),
                template: name,
                contain: [{
                    name: "New",
                    addition: 0,
                    startAt: 0,
                    contain: []
                }]
            })
        },
        ...mapActions(['setTemplates'])
    },
    computed: {
        ...mapGetters(['templates'])
    }
}
</script>

<style scoped>
.list .header {
    padding: 10px 0;
    background: #4D6D83;
    color: #fff;
    display: flex;
    border-bottom: 1px solid #455A64;
}

.name,
.rate {
    width: 140px;
    padding: 0 15px;
}

.action {
    width: 70px;
    cursor: pointer;
}

.datalist.add {
    color: gainsboro;
    justify-content: center;
    border: 2px dashed;
    cursor: pointer;
}

.datalist.add:active {
    background: #F5F5F5;
}
</style>