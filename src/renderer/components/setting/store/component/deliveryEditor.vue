<template>
    <div class="popupMask dark center setting" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h5 v-if="init.edit">{{$t('title.edit')}}</h5>
                <h5 v-else>{{$t('title.create')}}</h5>
                <h3>{{$t('setting.deliveryCharge')}}</h3>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <inputer title="text.distance" v-model.trim="rule.distance" :autoFocus="true"></inputer>
                <inputer title="text.fee" v-model.number="rule.fee"></inputer>
            </div>
            <footer>
                <div class="opt">
                    <span class="del" @click="init.reject(true)" v-show="init.edit">{{$t('button.delete')}}</span>
                </div>
                <button class="btn" @click="confirm">{{$t('button.done')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";

export default {
    props: ["init"],
    components: { inputer },
    data() {
        return {
            rule: clone(this.init.rule)
        };
    },
    methods: {
        confirm() {
            this.init.resolve(this.rule);
        }
    }
};
</script>

<style scoped>
div.checkbox {
  min-width: 120px;
}
</style>