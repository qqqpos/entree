<template>
    <div class="ticket">
        <header>
            <span>#{{order.number}}</span>
            <span class="type">{{$t('type.'+order.type)}}</span>
            <span class="balance">$ {{order.payment.balance | decimal}}</span>
        </header>
        <ul :class="unique">
            <li v-for="(item,index) in order.content" :key="index" @click="add(item)" :data-unique="item.unique">
                <div class="main">
                    <span class="qty">{{item.qty}}</span>{{item[language]}}<span class="side">{{item.side[language]}}</span>
                </div>
                <div class="sub" v-for="(sub,idx) in item.choiceSet" :key="idx">{{sub[language]}}</div>
            </li>
        </ul>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: ["order", "buffer"],
  data() {
    return {
      unique: "ul" + String().random()
    };
  },
  methods: {
    add(item) {
      const buffer = this.buffer;

      const index = buffer.findIndex(i => i.unique === item.unique);
      index === -1 ? buffer.push(item) : buffer.splice(index, 1);

      this.$emit("update:buffer", buffer);
    }
  },
  computed: {
    ...mapGetters(["tax", "config", "store", "dineInOpt", "language"])
  },
  watch: {
    buffer(list) {
      const doms = document.querySelectorAll("li.active");
      doms.forEach(dom => dom.classList.remove("active"));

      list.map(i => i.unique).forEach(unique => {
        const dom = document.querySelector(
          `ul.${this.unique} [data-unique='${unique}']`
        );
        dom && dom.classList.add("active");
      });
    },
    "order.content"() {
      this.$calculatePayment(this.order);
    }
  }
};
</script>

<style scoped>
.ticket {
  display: inline-flex;
  flex-direction: column;
}

header {
  background: #607d8b;
  color: #fff;
  padding: 15px;
  display: flex;
}

.type {
  margin-left: 10px;
}

.balance {
  flex: 1;
  text-align: right;
  font-family: "Agency FB";
  font-weight: bold;
}

ul {
  height: 520px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.85);
}

li {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-bottom: 1px solid #ddd;
  background: #fff;
  padding: 10px 5px 10px 10px;
  width: 300px;
}

.qty {
  width: 20px;
  margin-right: 5px;
  text-align: center;
  display: inline-block;
}

.side {
  margin-left: 5px;
  opacity: 0.5;
}

.sub {
  font-size: 0.8em;
  text-indent: 25px;
  color: #ff9800;
}

.active {
  color: #fff;
  background: #a1887f;
  border-bottom: 1px solid #bcaaa4;
}

.active .sub {
  color: #d7ccc8;
}
</style>

