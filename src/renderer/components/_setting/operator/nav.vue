<template>
    <section class="route">
        <ul class="nav">
            <div class="wrap">
                <router-link tag="li" :to="{name:'Setting.operator.index'}">
                    <i class="fa fa-users"></i>
                    <span class="text">{{$t('nav.index')}}</span>
                </router-link>
                <router-link tag="li" :to="{name:'Setting.operator.report'}" v-show="false">
                    <i class="fa fa-files-o"></i>
                    <span class="text">{{$t('nav.report')}}</span>
                </router-link>
                <div v-show="profile">
                    <router-link tag="li" :to="{name:'Setting.operator.profile'}">
                        <i class="fa fa-user-circle-o"></i>
                        <span class="text">{{$t('nav.user')}}</span>
                    </router-link>
                    <router-link tag="li" :to="{name:'Setting.operator.timecard'}">
                        <i class="fa fa-address-card"></i>
                        <span class="text">{{$t('nav.timecard')}}</span>
                    </router-link>
                    <router-link tag="li" :to="{name:'Setting.operator.event'}">
                        <i class="fa fa-file-text"></i>
                        <span class="text">{{$t('nav.event')}}</span>
                    </router-link>
                </div>
            </div>
            <li @click="back">
                <i class="fa fa-arrow-circle-left"></i>
                <span class="text">{{$t('nav.back')}}</span>
            </li>
        </ul>
        <section class="content">
            <transition name="switch">
                <router-view class="page" @profile="setProfile" @change="onChange" @unchanged="change = false" :profile="profile"></router-view>
            </transition>
            <transition appear name="fadeUp">
                <footer class="update" v-if="change">
                    <i class="fa fa-info-circle"></i>
                    <p class="f1">{{txt}}</p>
                    <div v-show="!send">
                        <span @click="cancel" class="cancel">{{$t('button.cancel')}}</span>
                        <span @click="verify" class="save">{{$t('button.save')}}</span>
                    </div>
                </footer>
            </transition>
        </section>
        <div :is="component" :init="componentData"></div>
    </section>
</template>

<script>
import { mapGetters } from 'vuex'
import dialoger from '../../common/dialoger'
export default {
    components: { dialoger },
    data() {
        return {
            componentData: null,
            component: null,
            profile: null,
            change: false,
            send: false,
            temp: null,
        }
    },
    methods: {
        back() {
            this.$route.name === 'Setting.operator.index' ?
                this.$router.push({ name: 'Setting.index' }) :
                this.$router.push({ name: 'Setting.operator.index' })
        },
        onChange(operator) {
            this.txt = this.$t("text.saveSetting");
            this.temp = operator;
            this.change = true;
            this.send = false;
        },
        setProfile(operator) {
            this.profile = operator
        },
        verify() {
            let pin = this.temp.pin;
            if (!pin) {
                this.$dialog({
                    title: 'dialog.saveOperatorFailed', msg: 'dialog.operatorNoPin',
                    buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                }).then(() => { this.$q() })
                return;
            };
            this.$socket.emit("[INQUIRY] OPERATORS", operators => {
                operators = operators.map(operator => operator._id !== this.temp._id).filter((op, index) => (index !== this.index && op.pin)).map(op => op.pin);
                if (operators.includes(pin)) {
                    this.$dialog({
                        title: 'dialog.saveOperatorFailed', msg: 'dialog.operatorPinDuplicate',
                        buttons: [{ text: 'button.confirm', fn: 'resolve' }]
                    }).then(() => { this.$q() })
                    return;
                }
                this.update()
            })
        },
        update() {
            this.send = true;
            this.txt = this.$t('text.settingUpdated')
            this.$socket.emit("[CMS] UPDATE_USER", this.temp)
            this.profile._id === this.op._id && Object.assign(this.op, this.temp)
            this.setProfile(this.temp)
            setTimeout(() => { this.cancel() }, 1000)
        },
        cancel() {
            this.change = false;
            this.send = false;
        }
    },
    computed: {
        ...mapGetters(['op'])
    }
}
</script>