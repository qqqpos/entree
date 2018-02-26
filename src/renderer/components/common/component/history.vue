<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <h5></h5>
                <h3>{{$t('title.purchaseHistory')}}</h3>
            </header>
            <table class="event">
                <thead>
                    <tr>
                        <th>{{$t('thead.date')}}</th>
                        <th>{{$t('thead.type')}}</th>
                        <th>{{$t('thead.amount')}}</th>
                        <th>{{$t('thead.view')}}</th>
                        <th>{{$t('thead.action')}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(invoice,index) in init.invoices" :key="index">
                        <td>{{invoice.date}}</td>
                        <td>{{$t('type.'+invoice.type)}}</td>
                        <td>{{invoice.payment.due | decimal}}</td>
                        <td @click="view(invoice)">
                            <i class="fa fa-search"></i>
                        </td>
                        <td @click="copy(invoice)">
                            <i class="fa fa-clone"></i>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <transition name="fadeUp">
            <div class="popupMask center dark" @click.self="component = null" v-if="component">
                <div :is="component" :init="componentData"></div>
            </div>
        </transition>
    </div>
</template>

<script>
import ticket from "../ticket";
import { mapActions } from "vuex";

export default {
  props: ["init"],
  components: { ticket },
  data() {
    return {
      componentData: null,
      component: null
    };
  },
  methods: {
    view(ticket) {
      this.$p("ticket", { ticket });
    },
    copy(invoice) {
      let content = invoice.content.map(item => {
        item.choiceSet.forEach(sub => (sub.unique = String().random()));
        Object.assign(item, { unique: String().random() });
        return item;
      });

      this.setOrder({ content });
      this.init.resolve();
    },
    ...mapActions(["setOrder"])
  }
};
</script>

<style scoped>
.editor {
  width: 550px;
}

tbody td {
  padding: 10px 0;
}
</style>