<template>
    <div>
        <header class="nav">
            <div class="back" @click="save">
                <i class="fa fa-chevron-left"></i>
            </div>
            <div class="title">
                <h5>{{profile.name}}</h5>
                <h3>{{profile.phone | phone}}</h3>
            </div>
            <nav>
                <span class="add" @click="remove">{{$t('button.remove')}}</span>
            </nav>
        </header>
        <div>
            <text-input title="text.address" v-model="profile.address"></text-input>
            <text-input title="text.city" v-model="profile.city"></text-input>
            <text-input title="text.extension" v-model="profile.extension"></text-input>
            <text-input title="text.name" v-model="profile.name"></text-input>
            <text-input title="text.dob" v-model="profile.dob" placeholder="MM-DD" mask="##-##"></text-input>
            <text-input title="text.email" v-model="profile.email"></text-input>
            <external title="text.viewTag"></external>
            <external title="text.viewFavoriteItem"></external>
            <external title="text.viewProfile"></external>
            <div class="statistic">
                <h3>{{$t('text.date')}}</h3>
                <h5>
                    <span>{{$t('text.firstDate')}}</span>
                    <span>{{profile.firstDate | moment('YYYY-MM-DD HH:mm:ss')}}</span>
                </h5>
                <h5>
                    <span>{{$t('text.lastDate')}}</span>
                    <span>{{profile.lastDate | moment('YYYY-MM-DD HH:mm:ss')}}
                        <span class="from">({{profile.lastDate | fromNow}})</span>
                    </span>
                </h5>
            </div>
            <div class="statistic">
                <h3>{{$t('text.activity')}}</h3>
                <h5>
                    <span>{{$t('text.orderCount')}}</span>
                    <span>{{profile.orderCount}}</span>
                </h5>
                <h5>
                    <span>{{$t('text.orderAmount')}}</span>
                    <span>$ {{profile.orderAmount | decimal}}</span>
                </h5>
                <h5>
                    <span>{{$t('text.callCount')}}</span>
                    <span>{{profile.callCount}}</span>
                </h5>
                <h5>
                    <span>{{$t('text.cancelCount')}}</span>
                    <span>{{profile.cancelCount}}</span>
                </h5>
                <h5>
                    <span>{{$t('text.cancelAmount')}}</span>
                    <span>$ {{profile.cancelAmount | decimal}}</span>
                </h5>
            </div>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import external from "../../common/external";
import textInput from "../../common/textInput";
import dialoger from "../../../common/dialoger";

export default {
    props: ["profile"],
    components: { dialoger, external, textInput },
    data() {
        return {
            componentData: null,
            component: null
        };
    },
    methods: {
        remove() {
            const prompt = {
                type: "question",
                title: "dialog.removeCustomer",
                msg: "dialog.removeCustomerConfirm"
            };
            this.$dialog(prompt)
                .then(() => {
                    this.$q();
                    this.$socket.emit("[CUSTOMER] DELETE", this.profile, callback => {
                        this.$emit("reset");
                        this.$emit("refresh");
                        this.$router.push({ name: "Setting.database.customer" });
                    });
                })
                .catch(() => this.$q());
        },
        save() {
            this.$emit("reset");
            this.$socket.emit("[CUSTOMER] UPDATE", this.profile, () =>
                this.$router.push({ name: "Setting.database.customer" })
            );
        }
    }
};
</script>

<style scoped>
.date {
  padding: 4px 20px 0;
  border-bottom: 1px solid #eee;
  height: 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

p {
  color: #656565;
}

.from {
  margin-left: 10px;
  color: #009688;
}
</style>