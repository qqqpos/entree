<template>
  <div class="popupMask dark center" @click.self="init.resolve">
      <div class="customer">
        <header>
          <h5></h5>
          <h3>{{$t(title)}}</h3>
        </header>
        <section class="info">
            <div class="field triple">
                <label>{{$t("text.phone")}}</label>
                <div class="input">
                    <i class="fa fa-phone"></i>
                    <input type="text" v-model="customer.phone">
                </div>
            </div>
            <div class="field triple">
                <label>{{$t("text.extension")}}</label>
                <div class="input">
                    <i class="fa fa-fax"></i>
                    <input type="text" v-model="customer.extension">
                </div>
            </div>
            <div class="field triple">
                <label>{{$t("text.name")}}</label>
                <div class="input">
                    <i class="fa fa-user"></i>
                    <input type="text" v-model="customer.name">
                </div>
            </div>
            <div class="field double">
                <label>{{$t("text.address")}}</label>
                <div class="input">
                    <i class="fa fa-map-marker"></i>
                    <input type="text" v-model="customer.address">
                </div>
            </div>
              <div class="field double">
                <label>{{$t("text.city")}}</label>
                <div class="input">
                    <i class="fa fa-map-marker"></i>
                    <input type="text" v-model="customer.city">
                </div>
            </div>
            <div class="field double">
                <label>{{$t("text.dob")}}</label>
                <div class="input">
                    <i class="fa fa-calendar"></i>
                    <input type="text" v-model="customer.extra.dob" v-mask="'##-##'" placeholder="MM-DD">
                </div>
            </div>
            <div class="field double">
                <label>{{$t("text.email")}}</label>
                <div class="input">
                    <i class="fa fa-envelope"></i>
                    <input type="text" v-model="customer.extra.email">
                </div>
            </div>
            <div class="field single">
                <label>{{$t("text.note")}}</label>
                <div class="input">
                    <i class="fa fa-note"></i>
                    <input type="text" v-model="customer.note">
                </div>
            </div>
        </section>
        <footer>
            <div class="f1">
                <span class="del" v-if="customer._id" @click="deleteConfirm">{{$t("button.delete")}}</span>
            </div>
            <button class="btn" @click="update">{{$t("button.update")}}</button>
        </footer>
      </div>
      <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import dialoger from "../../../common/dialoger";
export default {
  props: ["init"],
  components: { dialoger },
  data() {
    return {
      title: "",
      customer: null,
      component: null,
      componentData: null
    };
  },
  created() {
    this.title = this.init.customer.new
      ? "title.newCustomer"
      : "title.editCustomer";

    this.customer = Object.assign({}, this.init.customer);
  },
  methods: {
    deleteConfirm() {
      let data = {
        title: "dialog.removeClient",
        msg: ["dialog.removeClientTip", this.customer.phone]
      };

      this.$dialog(data)
        .then(() => {
          this.$emit("remove", this.customer);
          this.$q();
        })
        .catch(() => {
          this.$q();
        });
    },
    update() {
      this.$emit("update", this.customer);
    }
  }
};
</script>

<style scoped>
.customer {
  background: #fff;
  width: 650px;
  box-shadow: var(--shadow);
}

header {
  display: flex;
  border-bottom: 1px solid #eee;
}

h3 {
  padding: 15px 0 15px 15px;
  width: 100%;
}

.info {
  padding-bottom: 15px;
  display: flex;
  flex-wrap: wrap;
  background: #fafafa;
}

.triple {
  width: calc(33% - 18px);
}

.double {
  width: calc(50% - 22px);
}

.single {
  width: calc(100% - 29px);
}

input {
  border: none;
  outline: none;
  background: transparent;
  width: calc(90% - 30px);
  font-size: 20px;
  color: #656565;
}

.input {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 8px 0;
  font-size: 20px;
  color: #3c3c3c;
  background: #fff;
}

.field {
  padding: 0 0 0 15px;
  font-weight: bold;
  color: #3c3c3c;
}

.field label {
  padding: 7px 0px;
  font-weight: bold;
  color: #3c3c3c;
  display: block;
}

.field i {
  padding: 0 5px 0 10px;
}
.del {
  padding: 0 15px;
  color: #f44336;
  cursor: pointer;
}

footer {
  display: flex;
  align-items: center;
  border-top: 1px solid #eee;
  background: #f5f5f5;
}
</style>
