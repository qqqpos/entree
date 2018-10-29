<template>
    <li class="row flex-center clickable" @click="$emit('click',index)">
        <i class="light" :class="network"></i>
        <div class="row f1 agency space-right">
            <span class="f1">{{data.card[0] | card}}</span>
            <span>{{data.card[1]}}</span>
            <span>{{data.card[2]}}</span>
        </div>
        <i class="fas fa-pen-square fn" @click.stop="$emit('edit',index)"></i>
        <i class="fas fa-trash-alt fn" @click.stop="$emit('remove',index)"></i>
    </li>
</template>

<script>
export default {
  props: ["data", "index"],
  filters: {
    card(number) {
      return number
        ? String(number).replace(/^\D?(\d{4})\D?(\d{4})/, "$1 $2") +
            " **** ****"
        : number;
    }
  },
  watch: {
    data(n) {
      console.log("trigger");
    }
  },
  computed: {
    network() {
      const network = this.data.network || this.data.card[0];

      switch (network) {
        case "Visa":
          return "visa-card";
        case "Master":
          return "master-card";
        case "Discover":
          return "discover-card";
        case "AmEx":
          return "amex-card";
        case "CREDIT":
          return "credit-card";
        default:
          if (/^5[1-5]/.test(network)) return "master-card";
          if (/^4/.test(network)) return "visa-card";
          if (/^3[47]/.test(network)) return "amex-card";
          return "credit-card";
      }
    }
  }
};
</script>

<style scoped>
li {
  height: 55px;
  padding: 0 15px 0 25px;
  margin-bottom: 10px;
  color: #345;
  border-radius: 3px;
  font-size: 19px;
  opacity: 0.3;
  background: linear-gradient(to bottom, #fff 20%, #f5f5f5 100%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

i.light {
  width: 50px;
  margin-right: 25px;
}

div span {
  margin-right: 25px;
}

i.fn {
  cursor: pointer;
  color: rgba(0, 0, 0, 0.5);
  padding: 0 10px;
  margin: 0 5px;
}
</style>

