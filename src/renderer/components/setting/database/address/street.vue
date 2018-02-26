<template>
  <div>
    <header class="nav">
      <div class="back" @click="save">
        <i class="fa fa-chevron-left"></i>
      </div>
      <div class="title">
        <h5>{{$t('title.edit')}}</h5>
        <h3>{{address.street}}</h3>
      </div>
      <nav>
        <span class="add" @click="remove">{{$t('button.remove')}}</span>
      </nav>
    </header>
    <div>
      <text-input v-model="address.street" title="text.street"></text-input>
      <text-input v-model="address.city" title="text.city"></text-input>
      <text-input v-model="address.zipCode" title="text.zipCode"></text-input>
      <external title="text.viewCustomer"></external>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import toggle from "../../common/toggle";
import external from "../../common/external";
import textInput from "../../common/textInput";
import dialoger from "../../../common/dialoger";

export default {
  props: ["address"],
  components: { toggle, external, textInput, dialoger },
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
        title: "dialog.addressRemove",
        msg: ["dialog.addressRemoveConfirm", this.address.street]
      };

      this.$dialog(prompt)
        .then(() => {
          this.$q();
          this.$socket.emit("[ADDRESS] REMOVE", this.address._id, callback => {
            this.$emit("reset");
            this.$emit("refresh");
            this.$router.push({ name: "Setting.database.address" });
          });
        })
        .catch(() => this.$q());
    },
    save() {
      this.$socket.emit("[ADDRESS] UPDATE", this.address, callback => {
        this.$emit("reset");
        this.$router.push({ name: "Setting.database.address" });
      });
    }
  }
};
</script>