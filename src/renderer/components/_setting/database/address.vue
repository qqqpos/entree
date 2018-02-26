<template>
    <div>
        <section class="card list">
            <header>{{$t('setting.address')}}
                <span class="tip">{{$t('setting.addressTip')}}</span>
            </header>
            <div class="listHeader">
                <span class="f2">{{$t('text.street')}}</span>
                <span class="f1">{{$t('text.city')}}</span>
                <span class="action">{{$t('text.action')}}</span>
            </div>
            <article>
                <div v-for="(address,index) in addresses" class="datalist" :key="index">
                    <span class="f2 ex">{{address.street}}</span>
                    <span class="f1 ex">{{address.city}}</span>
                    <span class="action" @click="edit(address,index)">
                        <span>
                            <i class="fa fa-pencil"></i>
                            <span>{{$t("button.edit")}}</span>
                        </span>
                    </span>
                </div>
                <div class="datalist more" @click="more()">
                    <i class="fa fa-2x fa-chevron-down"></i>
                </div>
            </article>
        </section>
        <div :is="component" :init="componentData" @del="del"></div>
        <i class="fa fa-3x fa-plus-circle add" @click="add"></i>
    </div>
</template>

<script>
import editor from './component/addressEditor'
export default {
    components: { editor },
    data() {
        return {
            page: 0,
            addresses: [],
            component: null,
            componentData: null
        }
    },
    created() {
        this.$socket.emit("[ADDRESS] LIST", this.page)
    },
    mounted() {
        window.addEventListener("keydown", this.input, false);
    },

    methods: {
        edit(address, index) {
            this.$p("editor", { address, index })
        },
        add() {
            this.$p("editor", {
                address: {
                    street: "",
                    city: "",
                    zipCode: ""
                }
            })
        },
        del(index) {
            this.addresses.splice(index, 1);
        },
        more() {
            this.$socket.emit("[ADDRESS] LIST", ++this.page)
        },
        input(e) {
            e.key === 'F1' && this.component === null && this.add();
            e.key === 'Escape' && (this.component = null);
        }
    },
    beforeDestroy() {
        window.removeEventListener("keydown", this.input, false);
    },
    sockets: {
        ADDRESS_LIST(list) {
            this.addresses.push(...list);
        },
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

.f2 {
    text-indent: 1em;
}

.ex {
    text-indent: 1.5em;
}

.action {
    width: 70px;
    cursor: pointer;
}

.datalist.more {
    color: gainsboro;
    justify-content: center;
    border: 2px dashed;
    cursor: pointer;
}

.datalist.more:active {
    background: #F5F5F5;
}

.add {
    position: fixed;
    bottom: 0.5em;
    right: 1em;
    color: var(--deepBlue);
    text-shadow: 0 1px 1px #555;
    cursor: pointer;
}
</style>