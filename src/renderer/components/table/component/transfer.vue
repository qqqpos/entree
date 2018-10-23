<template>
    <div class="popupMask dark center" @click.self="init.reject(false)">
        <div class="row">
            <ticket :order="invoices[0]" :buffer.sync="transfer[0]" side="l"></ticket>
                <div class="director">
                    <div>
                        <i class="fas fa-chevron-left mini-btn" :class="{enable:transfer[1].length && transfer[1].length < invoices[1].content.length}" @click="transferTo(1,0)"></i>
                        <i class="fas fa-chevron-right mini-btn" :class="{enable:transfer[0].length && transfer[0].length < invoices[0].content.length}" @click="transferTo(0,1)"></i>
                    </div>
                    <div>
                        <button class="btn" @click="init.reject(false)">{{$t('button.cancel')}}</button>
                        <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
                    </div>
                </div>
            <ticket :order="invoices[1]" :buffer.sync="transfer[1]" side="r"></ticket>
        </div>
    </div>
</template>

<script>
import ticket from "../helper/ticket";

export default {
  props: ["init"],
  components: { ticket },
  data() {
    return {
      invoices: JSON.parse(JSON.stringify(this.init.invoices)),
      transfer: [[], []]
    };
  },
  methods: {
    transferTo(from, to) {
      const items = this.transfer[from];
      this.invoices[to].content.push(...items);

      this.transfer.splice(from, 1, []);
      const uniques = items.map(i => i.unique);
      this.invoices[from].content = this.invoices[from].content.filter(
        i => !uniques.includes(i.unique)
      );

      this.$nextTick(() =>
        document
          .querySelectorAll("li.active")
          .forEach(dom => dom.classList.remove("active"))
      );
    },
    confirm() {
      this.invoices.forEach(invoice =>
        this.$socket.emit("[ORDER] UPDATE", invoice, false)
      );

      this.init.resolve();
    }
  }
};
</script>

<style scoped>
.director {
  margin: 0 35px;
}

.director div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 280px;
}

.director i {
  margin: 15px 0;
  padding: 15px 35px;
  opacity: 0.7;
  pointer-events: none;
}

i.enable {
  opacity: 1;
  pointer-events: initial;
}
</style>
