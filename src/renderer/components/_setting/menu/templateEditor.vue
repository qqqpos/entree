<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h2>{{$t('setting.template')}}</h2>
                <h4><input v-model="template.template"></h4>
                <checkbox v-model="template.insert" label="text.insert"></checkbox>
            </header>
            <div class="includes">
                <draggable v-model="template.contain" :options="{animation:300,group:'item',ghostClass:'itemGhost',draggable:'.draggable'}">
                    <transition-group tag="aside">
                        <div class="group draggable" v-for="(group,index) in template.contain" :key="index" @click="setGroup(index)">
                            <h3>{{group.name}}</h3>
                            <span>{{group.contain.length}} {{text('ITEMS')}}</span>
                            <i class="fa fa-times" @click="delGroup(index)"></i>
                        </div>
                        <div class="addGroup" @click="addGroup" :key="999">
                            <i class="fa fa-plus"></i>
                        </div>
                    </transition-group>
                </draggable>
                <div class="container">
                    <div v-if="container">
                        <div class="config">
                            <div>
                                <label>{{$t('text.name')}}</label>
                                <input v-model="container.name">
                                <label>{{$t('text.max')}}</label>
                                <input v-model.number="container.max">
                            </div>
                            <div>
                                <label>{{$t('text.startAt')}}</label>
                                <input v-model.number="container.startAt">
                                <label>{{$t('text.additionCost')}}</label>
                                <input v-model.number="container.addition">
                            </div>
                        </div>
                        <draggable v-model="container.contain" :options="{animation:300,group:'item',ghostClass:'itemGhost',draggable:'.draggable'}">
                            <transition-group tag="ul" class="item">
                                <li v-for="(item,index) in container.contain" @contextmenu="editItem(item,index)" :key="index" class="draggable">{{item[language]}}</li>
                                <li class="addItem" @click="addItem" :key="999" v-show="container.contain.length < 32">
                                    <i class="fa fa-plus"></i>
                                </li>
                            </transition-group>
                        </draggable>
                    </div>
                    <div v-else>

                    </div>
                </div>
            </div>
            <footer>
                <div class="f1">
                    <span class="del" @click="deleteConfirm">{{$t('button.delete')}}</span>
                </div>
                <div class="btn" @click="init.reject(false)">{{$t('button.cancel')}}</div>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import checkbox from '../common/checkbox'
import dialoger from '../../common/dialoger'
import draggable from 'vuedraggable'
import editor from './templateItem'
export default {
    components: { editor, checkbox, draggable, dialoger },
    props: ['init'],
    created() {
        this.template = JSON.parse(JSON.stringify(this.init.template));
    },
    mounted() {
        this.setGroup(0);
    },
    data() {
        return {
            template: null,
            container: null,
            component: null,
            componentData: null,
            index: 0
        }
    },
    methods: {
        setGroup(index) {
            this.index = index;
            let dom = document.querySelector(".group.active");
            dom && dom.classList.remove("active");
            dom = document.querySelectorAll(".group");
            dom[index] && dom[index].classList.add("active");
            this.container = this.template.contain[index]
        },
        addGroup() {
            this.template.contain.push({
                name: "New",
                addition: 0,
                startAt: 0,
                contain: []
            })
        },
        delGroup(index) {
            this.template.contain.splice(index, 1);
        },
        addItem() {
            new Promise((resolve, reject) => {
                let title = "setting.newItem";
                this.componentData = { resolve, reject, title };
                this.component = "editor";
            }).then((item) => {
                this.template.contain[this.index].contain.push(item);
                this.$q()
            }).catch(() => { this.$q() })
        },
        editItem(item, index) {
            new Promise((resolve, reject) => {
                let title = "setting.editItem";
                this.componentData = { resolve, reject, title, item };
                this.component = "editor";
            }).then((item) => {
                this.template.contain[this.index].contain.splice(index, 1, item);
                this.$q();
            }).catch((del) => {
                del && this.template.contain[this.index].contain.splice(index, 1);
                this.$q();
            })
        },
        deleteConfirm() {
            this.$dialog({
                type: 'question', title: 'dialog.templateRemove', msg: 'dialog.templateRemoveTip',
                buttons: [{ text: 'button.cancel', fn: 'reject' }, { text: 'button.delete', fn: 'resolve' }]
            }).then(() => {
                this.init.reject(true);
            }).catch(() => {
                this.$q()
            })
        },
        confirm() {
            this.init.resolve(this.template)
        }
    },
    computed: {
        ...mapGetters(['language'])
    }
}
</script>

<style scoped>
header input {
    border: none;
    background: transparent;
    color: #CFD8DC;
    font-style: italic;
}

header .checkbox {
    position: absolute;
    top: 50px;
    right: 0;
}

aside {
    width: 140px;
    height: 100%;
    border-right: 1px solid #eee;
    background: #fff;
}

.container {
    flex-direction: column;
    position: relative;
}

.container>div {
    width: 100%;
}

.includes {
    display: flex;
    background: #F5F5F5;
    min-height: 500px;
    width: 675px;
}

.group {
    padding: 5px 10px;
    min-height: 40px;
    cursor: pointer;
    color: #9E9E9E;
    position: relative;
    border: 1px solid transparent;
    border-left: 2px solid transparent;
}

.group.active {
    border-left: 2px solid #2196F3;
    background: #F5F5F5;
    color: #3c3c3c;
}

.addGroup {
    padding: 15px;
    width: 107px;
    text-align: center;
    border: 2px dashed #ddd;
    color: #ccc;
    background: #FAFAFA;
    cursor: pointer;
}

.addItem {
    color: #666;
    border: 1px dashed #ddd;
    cursor: pointer;
}

.config label {
    width: 100px;
    display: inline-block;
    text-align: left;
}

.config input {
    border: 1px solid #ddd;
    width: 100px;
    margin-right: 10px;
}

.config {
    padding: 10px 0;
    border-bottom: 1px dashed #ddd;
    width: 100%;
    text-align: center;
    background: #fff;
}

ul.item {
    display: flex;
    flex-wrap: wrap;
    padding: 10px 15px;
}

li {
    width: 110px;
    height: 60px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 0 5px;
    border: 1px solid #ddd;
    background: #fff;
    margin: 2px;
}

.group i {
    color: var(--red);
    position: absolute;
    right: 0px;
    top: 0px;
    padding: 16px;
    display: none;
}

.group.active i {
    display: block;
}

.itemGhost {
    opacity: 0.5;
    border: 1px dashed gray;
}
</style>