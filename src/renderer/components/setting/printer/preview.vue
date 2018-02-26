<template>
  <div class="preview">
    <div :is="component" :init="componentData"></div>
    <div class="fn">
      <i class="fa fa-refresh" @click="refresh"></i>
      <i class="fa fa-volume-up" @click="buzzer"></i>
      <i class="fa fa-print" @click="preview"></i>
    </div>
  </div>
</template>

<script>
import preview from "../../common/ticket";
export default {
  props: ["printer"],
  components: { preview },
  data() {
    return {
      componentData: null,
      component: null,
      ticket: null
    };
  },
  beforeRouteEnter: (to, from, next) => {
    appSocket.emit("[PRINTER] PREVIEW", ticket =>
      next(vm => {
        vm.ticket = ticket;
        vm.$p("preview", { ticket, printer: vm.printer });
      })
    );
  },
  methods: {
    refresh() {
      this.$socket.emit("[PRINTER] PREVIEW", ticket => {
        this.ticket = ticket;
        this.$p("preview", { ticket, printer: this.printer });
      });
    },
    buzzer() {
      Printer.buzzer(this.printer);
    },
    preview() {
      Printer.setTarget(this.printer).print(this.ticket);
    }
  }
};
</script>

<style scoped>
.preview {
  width: 949px;
  margin:initial;
  background: transparent;
  box-shadow: initial;
  height: 677px;
  display: flex;
  justify-content: center;
  padding: 10px 0;
  overflow: scroll;
}

.fn {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 55px;
}

.fn i {
  height: 45px;
  width: 45px;
  background: #fff;
  border-radius: 50%;
  line-height: 45px;
  text-align: center;
  margin: 5px;
  cursor: pointer;
  color: #3c3c3c;
  box-shadow: 0 1px 2px rgba(60, 60, 60, 0.54);
}
</style>