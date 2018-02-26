<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="editor">
            <header>
                <h2>{{$t(init.title)}}</h2>
                <h4>{{$t(init.type)}}</h4>
            </header>
            <div class="inner">
                <section class="data" v-if="init.type === 'category'">
                    <div class="input">
                        <label>{{$t('text.primary')}}</label>
                        <input type="text" v-model="request.usEN" :placeholder="$t('text.primary')">
                    </div>
                    <div class="input">
                        <label>{{$t('text.secondary')}}</label>
                        <input type="text" v-model="request.zhCN" :placeholder="$t('text.secondary')">
                    </div>
                    <div class="input">
                        <label>{{$t('text.contain')}}</label>
                        <input type="text" v-model="request.contain" :placeholder="$t('text.contain')">
                    </div>
                </section>
                <section class="data" v-else-if="init.type === 'action'">
                    <div class="input">
                        <label>{{$t('text.primary')}}</label>
                        <input type="text" v-model="request.usEN" :placeholder="$t('text.primary')">
                    </div>
                    <div class="input">
                        <label>{{$t('text.secondary')}}</label>
                        <input type="text" v-model="request.zhCN" :placeholder="$t('text.secondary')">
                    </div>
                    <div class="default">
                        <checkbox v-model="request.prefix" label="text.prefix"></checkbox>
                        <checkbox v-model="request.ignoreDefaultPrice" label="text.ignorePrice"></checkbox>
                    </div>
                </section>
                <section class="data" v-else>
                    <div class="input">
                        <label>{{$t( 'text.primary')}}</label>
                        <input type="text" v-model="request.usEN" :placeholder="$t('text.primary')">
                    </div>
                    <div class="input">
                        <label>{{$t( 'text.secondary')}}</label>
                        <input type="text" v-model="request.zhCN" :placeholder="$t('text.secondary')">
                    </div>
                    <div class="input">
                        <label>{{$t('text.price')}}</label>
                        <input type="text" v-model.number="request.price" placeholder="0.00">
                    </div>
                    <div class="options">
                        <label>{{$t('text.category')}}</label>
                        <select v-model="request.category">
                            <option v-for="(category,index) in init.category" :key="index">{{category}}</option>
                        </select>
                    </div>
                </section>
            </div>
            <footer>
                <div class="f1">
                    <span class="del" @click="del" v-show="request._id">{{$t('button.delete')}}</span>
                </div>
                <div class="btn" @click="init.reject(false)">{{$t('button.cancel')}}</div>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex'
import checkbox from '../common/checkbox'
export default {
    components: { checkbox },
    props: ['init'],
    created() {
        this.request = JSON.parse(JSON.stringify(this.init.data));
    },
    data() {
        return {
            request: null
        }
    },
    methods: {
        del() {
            switch (this.init.type) {
                case "item":
                    this.$socket.emit("[CMS] REMOVE_REQUEST_ITEM", {
                        id: this.request._id,
                        grp: this.init.grp,
                        sub: this.init.sub,
                        index: this.init.index
                    });
                    break;
            }
            this.init.resolve()
        },
        confirm() {
            switch (this.init.type) {
                case "category":
                    this.request.item = [];
                    !Array.isArray(this.request.contain) && (this.request.contain = this.request.contain.split(","));
                    this.$socket.emit("[CMS] UPDATE_REQUEST_CATEGORY", { category: this.request, index: this.init.index });
                    break;
                case "action":
                    this.$socket.emit("[CMS] UPDATE_REQUEST_ACTION", {
                        action: this.request,
                        index: this.init.index
                    })
                    break;
                case "item":
                    !isNumber(this.request.price) && (this.request.price = 0);
                    this.$socket.emit("[CMS] UPDATE_REQUEST_ITEM", {
                        item: this.request,
                        grp: this.init.grp,
                        sub: this.init.sub,
                        index: this.init.index
                    });
                    break;
            }
            this.init.resolve()
        },
        ...mapActions(['updateRequestCategory'])
    }
}
</script>

<style scoped>
/* .form {
    width: 350px;
    background: #fff;
    box-sizing: border-box;
    overflow: hidden;
    border-top: 1px solid #3a948c;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
}

.form header {
    position: relative;
    padding: 10px 15px;
    background: #009688;
    color: #fafafa;
    box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12), 0px 3px 1px -2px rgba(0, 0, 0, 0.2);
}

.form header:before {
    background: rgba(0, 0, 0, 0.156);
    position: absolute;
    top: 0;
    left: 0;
    content: ' ';
    width: 100%;
    height: 15px;
}

.form header h2 {
    margin: 35px 0 5px 0;
    font-weight: normal;
    text-shadow: 0 1px 1px #333;
}

.form header h4 {
    font-size: 16px;
    font-weight: normal;
    color: rgba(255, 255, 255, 0.4);
}

.form .data {
    padding: 20px 23px;
    box-sizing: border-box;
    width: 100%;
}

section.data>div {
    position: relative;
}

label {
    position: absolute;
    left: 15px;
    top: -3px;
    background: white;
    padding: 0 5px;
}

.data input {
    width: 280px;
    padding: 8px;
    border: 2px solid rgba(0, 0, 0, 0.2);
    margin: 6px 2px;
    border-radius: 4px;
    color: #636363;
    outline: none;
    font-weight: normal;
    font-size: 20px;
    font-family: 'Yuanti-SC';
    transition: border-bottom 0.3s ease;
}

.data input:focus {
    border: 2px solid #FF9800;
}

footer {
    background: #e5e5e5;
    display: flex;
}

.default {
    margin: 15px 15px 0;
    padding: 10px 10px 0;
    text-align: center;
    border: 1px dashed #CFD8DC;
}

.option {
    padding: 6px 0;
}

.option select {
    border: 2px solid rgba(0, 0, 0, 0.2);
    outline: none;
    width: 302px;
    font-size: 20px;
    padding: 8px;
    border-radius: 4px;
}

.f1 {
    display: flex;
    align-items: center;
    padding: 0 15px;
}

.del {
    color: red;
    border-bottom: 1px dashed red;
    cursor: pointer;
} */
</style>