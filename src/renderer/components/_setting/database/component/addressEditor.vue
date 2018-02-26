<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h2>{{$t('setting.address')}}</h2>
            </header>
            <div class="inner">
                <div class="input">
                    <label>{{$t('text.street')}}</label>
                    <input v-model="address.street" ref="street">
                </div>
                <div class="input">
                    <label>{{$t('text.city')}}</label>
                    <input v-model="address.city" @keydown.enter="confirm">
                </div>
                <div class="input">
                    <label>{{$t('text.zipCode')}}</label>
                    <input v-model="address.zipCode" @keydown.enter="confirm">
                </div>
            </div>
            <footer>
                <div class="f1" v-show="Number.isInteger(this.init.index)">
                    <span class="del" @click="del">{{$t('button.delete')}}</span>
                </div>
                <div class="btn" @click="init.reject()">{{$t('button.cancel')}}</div>
                <div class="btn" @click="confirm">{{$t('button.confirm')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    props: ['init'],
    created() {
        this.address = Object.assign({}, this.init.address);
    },
    mounted() {
        this.$refs.street.focus();
    },
    data() {
        return {
            address: {}
        }
    },
    methods: {
        del() {
            this.$emit("del", this.init.index);
            this.$socket.emit("[CMS] REMOVE_ADDRESS", this.address._id);
            this.init.reject();
        },
        confirm() {
            if (!this.address.street) return;
            this.address.street = this.address.street.toUpperCase();
            this.address.city = this.address.city.toUpperCase();
            this.$emit("add", this.address);
            this.$socket.emit("[CMS] EDIT_ADDRESS", this.address);
            this.init.resolve();
        }
    }
}
</script>

<style></style>