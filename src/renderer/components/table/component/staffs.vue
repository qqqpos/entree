<template>
  <div class="popupMask dark center" @click.self="init.reject">
    <div class="editor">
      <header>
        <h5>{{$t('button.select')}}</h5>
        <h3>{{$t('dialog.switchOperator')}}</h3>
      </header>
      <div class="banner"></div>
      <div class="wrap">
        <div class="operators">
          <div class="operator" v-for="(operator,index) in operators" :key="index" @click="select(operator)" :data-id="operator._id">
            <span class="name">{{operator.name}}</span>
            <span class="role">{{$t('type.'+operator.role)}}</span>
          </div>
        </div>
      </div>
      <footer>
        <button class="btn" @click="confirm" :disabled="!operator">{{$t('button.confirm')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import dialoger from "../../common/dialoger";

export default {
  props: ["init"],
  components: { dialoger },
  data() {
    return {
      order: this.$store.getters.order,
      componentData: null,
      component: null,
      operators: [],
      operator: null
    };
  },
  created() {
    this.operators = this.init.operators.filter(
      o => o.role !== "Owner" && o.name !== this.order.server
    );
  },
  methods: {
    select(operator) {
      const dom = document.querySelector(".operator.select");
      dom && dom.classList.remove("select");

      this.operator = operator;
      document
        .querySelector(`[data-id="${operator._id}"]`)
        .classList.add("select");
    },
    confirm() {
      const prompt = {
        title: "dialog.switchServer",
        msg: [
          "dialog.switchServerConfirm",
          this.order.server,
          this.operator.name
        ]
      };

      this.$dialog(prompt)
        .then(() => {
          Object.assign(this.order, { server: this.operator.name });
          this.$socket.emit("[STAFF] SWITCH", this.order);
          this.init.resolve();
        })
        .catch(() => this.$q());
    }
  }
};
</script>

<style scoped>
.wrap {
  width: 496px;
}

.operators {
  display: flex;
  flex-wrap: wrap;
}

.operator {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 2px 5px;
  width: 100px;
  border: 2px solid #eee;
  background: #fff;
  padding: 5px;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.65;
}

.name {
  font-weight: bold;
}

.role {
  color: rgba(0, 0, 0, 0.5);
}

.select {
  border: 2px solid #009688;
  opacity: 1;
}
</style>