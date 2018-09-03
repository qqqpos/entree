<template>
  <div class="popupMask dark center" @click.self="init.reject">
    <div class="editor">
      <header>
        <div>
          <h5>{{$t('button.select')}}</h5>
          <h3>{{$t('dialog.switchOperator')}}</h3>
        </div>
      </header>
      <div class="banner"></div>
      <div class="wrap">
        <div class="operators">
          <div class="operator" v-for="(operator,index) in operators" :key="index" @click="select(operator)" :data-id="operator._id">
            <span class="name">{{operator.name}}</span>
            <span class="role">{{$t('type.'+operator.role)}}</span>
          </div>
        </div>
        <paginator :of="employees" @page="setPage" :perPage="24" :maxPage="5"></paginator>
      </div>
      <footer>
        <button class="btn" @click="confirm" :disabled="!operator">{{$t('button.confirm')}}</button>
      </footer>
    </div>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import dialogModule from "../../common/dialog";
import paginator from "../../common/paginator";

export default {
  props: ["init"],
  components: { dialogModule, paginator },
  data() {
    return {
      componentData: null,
      component: null,
      operator: null,
      employees: [],
      page: 0
    };
  },
  created() {
    this.employees = this.init.operators.filter(
      o =>
        o.role !== "Owner" &&
        o.role !== "Worker" &&
        o.name !== this.order.server
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
          this.table &&
            this.table.server &&
            Object.assign(this.table, { server: this.operator.name });
            
          Object.assign(this.order, { server: this.operator.name });

          this.$socket.emit("[ORDER] CHANGE_SERVER", this.order);
          this.init.resolve();
        })
        .catch(this.exitComponent);
    },
    setPage(index) {
      this.page = index;
    }
  },
  computed: {
    operators() {
      const min = this.page * 24;
      const max = min + 24;

      return this.employees.slice(min, max);
    },
    ...mapGetters(["order", "table"])
  }
};
</script>

<style scoped>
.wrap {
  width: 496px;
  padding: 15px 25px 3px;
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
  text-align: center;
}

.role {
  color: rgba(0, 0, 0, 0.5);
  font-size: 0.8em;
  margin-top: 4px;
}

.select {
  border: 2px solid #26a69a;
  background: #f5f5f5;
  opacity: 1;
}
</style>