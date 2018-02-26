<template>
    <transition appear name="fadeUp">
        <div class="note" v-show="show" @click="show = false">
            <div>
                <span class="text">{{txt}}</span>
            </div>
        </div>
    </transition>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    data() {
        return {
            show: false,
            txt: ''
        }
    },
    mounted() {
        this.show = this.spooler.length > 0;
        this.txt = this.$t('text.delayTask', this.spooler.length)
    },
    computed: {
        ...mapGetters(['spooler'])
    },
    watch: {
        spooler(n) {
            this.show = n.length > 0
        }
    }
}
</script>

<style scoped>
.note {
    position: fixed;
    right: 0;
    bottom: 0;
    height: 35px;
    min-width: 150px;
    background: #FAFAFA;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top-left-radius: 10px;
    border-right: 2px solid #FF5722;
    box-shadow: -5px 0px 7px rgba(0, 0, 0, 0.3);
}

.note .text {
    font-weight: bold;
    color: #009688;
}
</style>