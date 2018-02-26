<template>
    <div class="popupMask setting center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h5 v-if="init.edit">{{$t('title.edit')}}</h5>
                <h5 v-else>{{$t('title.create')}}</h5>
                <h3>{{$t('button.option')}}</h3>
            </header>
            <div class="wrap">
                <inputer title="text.alias" v-model="option.name" :autoFocus="true"></inputer>
                <inputer title="text.maxItem" v-model.number="option.max"></inputer>
                <inputer title="text.startAt" v-model="option.startAt"></inputer>
                <inputer title="text.overCharge" v-model="option.addition"></inputer>
            </div>
            <footer>
                <div class="opt">
                    <span class="del" v-if="init.edit" @click="init.reject(true)">{{$t('button.delete')}}</span>
                </div>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
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
            option: JSON.parse(JSON.stringify(this.init.option))
        }
    },
    methods: {
        confirm() {

            this.init.resolve(this.option)
        }
    }
}
</script>