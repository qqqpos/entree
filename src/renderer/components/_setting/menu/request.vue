<template>
    <div class="layout">
        <draggable v-model="request" @sort="isCategorySort = true" :options="{animation:300,group:'category',ghostClass:'cateGhost'}">
            <transition-group tag="div" class="category">
                <div v-for="(category,index) in request" @click="getItems(category,index)" @contextmenu="editCategory(category,index)" :key="index">{{category[language]}}</div>
            </transition-group>
        </draggable>
        <draggable v-model="actions" @sort="isActionSort = true" :options="{animation:300,group:'action',ghostClass:'actionGhost'}">
            <transition-group tag="div" class="prefix">
                <div v-for="(action,index) in actions" @contextmenu="editAction(action,index)" :key="index">{{action[language]}}</div>
            </transition-group>
        </draggable>
        <div class="itemWrap">
            <div v-for="(group,gIndex) in items" :key="gIndex" class="item">
                <draggable :list="group" @sort="isItemSort = true" :options="{animation:300,group:group.category,ghostClass:'itemGhost',draggable:'.draggable'}">
                    <transition-group tag="section">
                        <div v-for="(item,index) in group" @contextmenu="editItem(item,gIndex,index)" :class="{draggable:item.clickable,disable:!item.clickable}" :key="index">{{item[language]}}</div>
                    </transition-group>
                </draggable>
            </div>
        </div>
        <aside>
            <div>
                <div class="btn" @click="applyItemSort" v-if="isItemSort">{{text('APPLY')}}</div>
                <div class="btn" @click="applyActionSort" v-if="isActionSort">{{text('APPLY')}}</div>
                <div class="btn" @click="applyCategorySort" v-if="isCategorySort">{{text('APPLY')}}</div>
            </div>
        </aside>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import dialoger from '../../common/dialoger'
import requestEditor from './requestEditor'
import draggable from 'vuedraggable'
import Preset from '../../../preset'
export default {
    components: { requestEditor, dialoger, draggable },
    created() {
        this.items = JSON.parse(JSON.stringify(this.request[0].item))
    },
    data() {
        return {
            items: [],
            component: null,
            componentData: null,
            categoryIndex: 0,
            isCategorySort: false,
            isActionSort: false,
            isItemSort: false
        }
    },
    methods: {
        getItems(category, index) {
            this.categoryIndex = index;
            this.items = this.request[index].item.slice();
        },
        editCategory(category, index) {
            this.$p("requestEditor", {
                title: 'setting.request',
                data: category,
                type: 'category',
                index
            })
        },
        editAction(action, index) {
            this.$p("requestEditor", { title: 'setting.action', data: action, type: 'action', index })
        },
        editItem(item, sub, index) {
            this.$p("requestEditor", {
                data: item,
                category: this.request[this.categoryIndex].contain,
                title: 'setting.item',
                type: 'item',
                grp: this.categoryIndex,
                sub, index
            })
        },
        removeCategory(index) {
            let category = {
                zhCN: "",
                usEN: "",
                num: 99,
                contain: [""],
                item: []
            }
            this.updateRequestCategory({ category, index });
            this.$socket.emit("[CMS] UPDATE_REQUEST_CATEGORY", { category, index });
        },
        applyCategorySort() {

        },
        applyActionSort() {

        },
        applyItemSort() {
            for (let i = 0; i < this.items.length; i++) {
                let items = this.items[i];
                for (let x = 0; x < items.length; x++) {
                    if (items[x].zhCN || items[x].usEN) {
                        this.items[i][x].num = x
                    } else {
                        break;
                    }
                }
            }

            let index = this.categoryIndex;
            let items = this.items;
            this.replaceRequestItem({ index, items })
            items = [].concat.apply([], this.items);
            let update = items.map(item => {
                if (item._id) {
                    return {
                        _id: item._id,
                        num: item.num
                    }
                }
            }).filter(item => item);
            this.$socket.emit("[CMS] RESORT_REQUEST_ITEM", update);
            this.isItemSort = false;
        },
        ...mapActions(['replaceRequestItem'])
    },
    computed: {
        ...mapGetters(['request', 'language', 'actions'])
    },
    sockets: {
        REQUEST_UPDATED() {
            this.$nextTick(() => {
                this.items = JSON.parse(JSON.stringify(this.request[this.categoryIndex].item))
            })
        }
    }
}
</script>

<style scoped>
.layout {
    display: flex;
    flex-direction: row;
}

.category,
.prefix {
    width: 142px;
}

.prefix div {
    height: 62.5px;
    width: 137.92px;
    justify-content: center;
    align-items: center;
    display: inline-flex;
    border: 1px solid #607D8B;
    background: #B0BEC5;
    margin: 1px;
    vertical-align: top;
    font-size: 1.15em;
    text-align: center;
}

.itemWrap {
    width: 410px;
    display: flex;
    flex-direction: column;
}

.item>div {
    width: 410px;
}

.item section>div {
    display: inline-flex;
    text-align: center;
    flex-wrap: wrap;
    width: calc(33% - 3px);
    justify-content: center;
    align-items: center;
    height: 62.5px;
    border: 1px solid #78909C;
    margin: 1px;
    background: #92aaaf;
    vertical-align: top;
    font-size: 1.05em;
}

.item div.disable {
    background: rgba(207, 216, 220, 0.58);
}

.cateGhost {
    background: rgba(33, 150, 243, 0.5);
    border: 1px dashed #607D8B;
}

.prefix .actionGhost {
    background: rgba(176, 190, 197, 0.5);
    border: 1px dashed #607D8B;
}

.item .itemGhost {
    background: rgba(146, 170, 175, 0.51);
    border: 1px dashed #607D8B;
}

aside {
    width: 180px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

aside .btn {
    width: 168px;
    margin: 5px;
}
</style>