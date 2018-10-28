<template>
  <div>
    <header class="nav">
      <div>
        <span class="mini-btn" @click="exportData">{{$t('button.export')}}</span>
      </div>
      <div class="title">
        <h3>{{$t("title.customerList")}}</h3>
      </div>
      <nav>
        <span class="add" @click="create">{{$t('button.new')}}</span>
      </nav>
    </header>
    <ul>
      <li v-for="(customer,index) in customers" :key="index">
        <div class="f1">
          <h4>{{customer.phone | phone}}</h4>
          <h5>{{customer.address}}
            <span class="city" v-show="customer.city">, {{customer.city}}</span>
          </h5>
        </div>
        <span class="time">{{customer.lastDate | fromNow}}</span>
        <i class="fa fa-caret-right" @click="$emit('set',customer)"></i>
      </li>
      <li v-if="total > 14" class="footer">
        <p>
          <span>{{$t('text.totalCustomer')}}</span>
          <span>{{total}}</span>
        </p>
        <div class="mini-paginator">
          <i class="fa fa-angle-left" @click="prev"></i>
          <div>
            <span>{{page + 1}}</span>
            <span class="slash">/</span>
            <span>{{totalPage}}</span>
          </div>
          <i class="fa fa-angle-right" @click="next"></i>
        </div>
      </li>
    </ul>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import fileSaver from "file-saver";
import Preset from "../../../../preset";
import editor from "../component/customerEditor";

export default {
  props: ["total", "customers"],
  components: { editor },
  computed: {
    totalPage() {
      return Math.ceil(this.total / 14);
    }
  },
  data() {
    return {
      componentData: null,
      component: null,
      page: 0
    };
  },
  methods: {
    create() {
      new Promise((resolve, reject) => {
        const customer = Preset.customer();

        this.componentData = { resolve, reject, customer };
        this.component = "editor";
      })
        .then(update => {
          this.$socket.emit("[CUSTOMER] UPDATE", update, callback => {
            this.$emit("create");
            this.exitComponent();
          });
        })
        .catch(this.exitComponent);
    },
    exportData() {
      let excel = [
        ["Phone Number", "Name", "Address", "E-mail", "last Activity"]
      ];

      this.customers.forEach(customer => {
        const { phone, name, address, email, lastDate } = customer;
        excel.push([phone, name, address, email, moment(lastDate).fromNow()]);
      });

      let csvRows = [];

      for (let i = 0; i < excel.length; i++) {
        csvRows.push(excel[i].join(","));
      }

      let csvFile = csvRows.join("\n");
      let blob = new Blob([csvFile], { type: "text/plain;charset=utf-8" });

      fileSaver.saveAs(blob, `Customer Data.csv`);
    },
    prev() {
      if (this.page === 0) return;
      this.page--;
      this.$emit("update", this.page);
    },
    next() {
      if (this.page === this.totalPage - 1) return;
      this.page++;
      this.$emit("update", this.page);
    }
  }
};
</script>

<style scoped>
li {
  padding-left: 20px;
  height: 40px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}

h5 {
  font-weight: normal;
  color: #656565;
}

i.fa-caret-right {
  margin: 0 10px;
  padding: 10px 25px;
  color: #555;
  cursor: pointer;
  border-radius: 4px;
}

i:active {
  background: #eee;
}

.time {
  font-size: 14px;
  color: #9e9e9e;
}
</style>