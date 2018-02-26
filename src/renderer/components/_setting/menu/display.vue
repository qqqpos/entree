<template>
    <div>
        <section class="card">
            <header>{{$t('setting.display')}}</header>
            <article>
                <smart-switch v-model="display.menuID" label="text.menuID"></smart-switch>
                <smart-switch v-model="display.favorite" label="text.favoriteItem"></smart-switch>
                <smart-switch v-model="display.voidItem" label="text.displayVoidItem"></smart-switch>
                <smart-switch v-model="display.autoTemplate" label="text.autoTemplate" tip="tip.autoTemplate"></smart-switch>
                <smart-switch v-model="display.alphabetical" label="text.alphabetical" tip="tip.alphabetical"></smart-switch>
            </article>
        </section>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import smartSwitch from '../common/smartSwitch'
export default {
    components: { smartSwitch },
    data() {
        return {
            display: {}
        }
    },
    created() {
        try {
            this.display = JSON.parse(JSON.stringify(this.config.display));
        } catch (e) {
            Object.assign(this.config, {
                display: {
                    menuID: false,
                    favorite: false,
                    voidItem: false,
                    autoTemplate: false
                }
            })
        } finally {
            this.display = JSON.parse(JSON.stringify(this.config.display))
        }
    },
    watch: {
        display: {
            handler(n) {
                let change = false;
                Object.keys(this.display).forEach(key => {
                    if (this.display[key] !== this.config.display[key]) change = true;
                });
                change ? this.$emit("change", n) : this.$emit("unchange");
            }, deep: true

        }
    },
    computed: {
        ...mapGetters(['config'])
    }
}
</script>

<style></style>