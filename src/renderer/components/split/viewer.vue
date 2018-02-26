<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5></h5>
                <h3>{{$t('title.split')}}</h3>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <ticket v-for="(split,index) in init.splits" :key="index" :invoice="split" @click.native="trigger"></ticket>
            </div>
            <footer>
                <button class="btn" @click="confirm" :disabled="ban">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import ticket from "../history/component/ticket";

export default {
    props: ["init"],
    components: { ticket },
    computed: {
        ...mapGetters(["order"])
    },
    data() {
        return {
            ban: true
        }
    },
    methods: {
        trigger() {
            this.ban = false;
        },
        confirm() {
            this.init.resolve(this.order)
        }
    }
}
</script>

<style scoped>
.wrap {
  width: 600px;
  display: flex;
}
</style>