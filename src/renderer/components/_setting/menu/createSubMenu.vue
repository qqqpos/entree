<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="editor">
            <header>
                <h2>{{$t('title.subMenuGroup')}}</h2>
                <h4>{{$t('tip.createSubMenuGroup')}}</h4>
            </header>
            <div class="inner">
                <div class="input">
                    <label>{{$t('text.name')}}</label>
                    <input type="text" v-model="group" @keydown.enter="confirm" maxlength="10">
                </div>
            </div>
            <footer>
                <div class="btn" @click="init.reject">{{$t('button.cancel')}}</div>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    props: ['init'],
    data() {
        return {
            group: ""
        }
    },
    methods: {
        confirm() {
            this.group && this.init.resolve(this.group);
        }
    }
}
</script>