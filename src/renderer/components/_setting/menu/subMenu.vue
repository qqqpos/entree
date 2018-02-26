<template>
    <div class="layout">
        <div class="groups">
            <div class="wrap">
                <div class="group" v-for="(group,index) in groups" :key="index" @click="getItems(group)" @contextmenu="removeGroup(group)">
                    <span>{{group}}</span>
                    <i class="fa fa-angle-right"></i>
                </div>
                <div class="add" @click="create">
                    <i class="fa fa-plus"></i>
                    <span>{{$t('button.new')}}</span>
                </div>
            </div>
        </div>
        <draggable v-model="items" @sort="sortItems" :options="{animation:300,ghostClass:'itemGhost'}" class="f1">
            <transition-group tag="div" class="items">
                <div v-for="(item,index) in items" :key="index" :class="{disable:!item.clickable}" @contextmenu="edit(item,index)">
                    {{item[language]}}
                </div>
            </transition-group>
        </draggable>
        <div class="btn" v-show="sorted" @click="applySortItem">{{$t('button.apply')}}</div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import draggable from 'vuedraggable'
import creator from './createSubMenu'
import editor from './subMenuEditor'
import dialoger from '../../common/dialoger'
export default {
    computed: {
        ...mapGetters(['submenu', 'language'])
    },
    components: { creator, editor, draggable, dialoger },
    data() {
        return {
            component: null,
            componentData: null,
            groups: [],
            items: [],
            sorted: false
        }
    },
    created() {
        this.groups = Object.keys(this.submenu)
    },
    methods: {
        getItems(group) {
            let items = JSON.parse(JSON.stringify(this.submenu[group]));
            let length = items.length;

            length < 33 && Array(33 - length).fill().forEach((_, i) => { items.push({ zhCN: "", usEN: "", num: i, clickable: false, group }) });

            this.items = items;
        },
        create() {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject };
                this.component = 'creator'
            }).then((group) => {
                this.$q();
                Object.assign(this.submenu, { [group]: [] });
                this.groups = Object.keys(this.submenu);
                this.getItems(group)
            }).catch(() => {
                this.$q()
            })
        },
        edit(item, index) {
            new Promise((resolve, reject) => {
                this.componentData = { resolve, reject, item };
                this.component = 'editor'
            }).then((item) => {
                this.$q();
                this.$socket.emit("[SUBMENU] ITEM", item, items => {
                    let group = items[0].group;
                    Object.assign(this.submenu, { [group]: items });
                    this.getItems(group);
                })
            }).catch((del) => {
                this.$q();
                del && this.$socket.emit("[SUBMENU] REMOVE", item, items => {
                    let group = items[0].group;
                    Object.assign(this.submenu, { [group]: items });
                    this.getItems(group);
                })
            })
        },
        sortItems() {
            this.sorted = true;
        },
        applySortItem() {
            let items = this.items.filter(item => item._id).map((item, index) => {
                return {
                    _id: item._id,
                    num: index
                }
            })
            this.$socket.emit("[SUBMENU] SORT", items);

            let group = this.items[0].group;
            Object.assign(this.submenu, { [group]: this.items });
            this.getItems(group);
            this.sorted = false;
        },
        removeGroup(group) {
            this.$dialog({
                title: 'dialog.subMenuRemoveConfirm',
                msg: ['dialog.subMenuRemoveConfirmTip', group]
            }).then(() => {
                this.items = [];
                delete this.submenu[group];
                this.groups = Object.keys(this.submenu)
                this.$socket.emit("[SUBMENU] REMOVE_GROUP", group);
                this.$q()
            }).catch(() => {
                this.$q()
            })
        }
    }
}
</script>

<style scoped>
.layout {
    display: flex;
}

.groups {
    display: inline-flex;
    flex-direction: column;
    width: 200px;
    height: 100%;
    border-right: 1px solid #eee;
    background: #F5F5F5;
}

.groups header {
    text-align: center;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
}

.group {
    padding: 15px 10px;
    border-bottom: 1px solid #ECEFF1;
    cursor: pointer;
    display: flex;
    background: #fff;
}

.group span {
    flex: 1;
}

.add {
    padding: 15px;
    text-align: center;
    background: #607D8B;
    color: #fff;
    cursor: pointer;
    text-shadow: 0 1px 1px #333;
}

.items {
    flex: 1;
    max-width: 414px;
}

.itemGhost {
    background: #607D8B;
    border: 1px dashed #212121;
}
</style>