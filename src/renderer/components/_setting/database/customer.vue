<template>
  <div class="customer">
    <header>
      <nav>
        <h3>
          <i class="fa fa-users"></i>
          <span>{{$t('title.customerList')}}</span>
        </h3>
      </nav>
      <section class="filter">
        <div class="search">
          <i class="fa fa-search"></i>
          <input type="text" v-model="phone" @keypress.enter="search">
        </div>
        <div></div>
        <div></div>
      </section>
    </header>
    <table>
      <thead>
        <tr>
          <th class="phone">{{$t('thead.phone')}}</th>
          <th class="address">{{$t('thead.address')}}</th>
          <th class="name">{{$t('thead.name')}}</th>
          <th class="amount">{{$t('thead.total')}}</th>
          <th class="amount">{{$t('thead.count')}}</th>
          <th>{{$t('thead.lastUpdate')}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(customer,index) in customers" :key="index" @click="edit(customer)">
          <td class="phone">{{customer.phone | phone}}</td>
          <td class="address">{{customer.address}}</td>
          <td class="name">{{customer.name}}</td>
          <td class="amount">{{customer.extra.orderAmount | decimal}}</td>
          <td class="amount">{{customer.extra.orderCount}}</td>
          <td>{{customer.extra.lastDate | fromNow}}</td>
        </tr>
      </tbody>
    </table>
    <footer>
      <div>
        <span class="text">{{$t("text.totalCustomers")}}</span>
        <span class="value">{{totalCustomers}}</span>
      </div>
      <div class="svg">
        <trend :data="customerTrend" :gradient="['#6fa8dc', '#42b983', '#2c3e50']" :height="51" auto-draw smooth></trend>
      </div>
      <div class="pagination">
        <button @click="page--" :disabled="page === 0">
          <i class="fa fa-chevron-left"></i>
        </button>
        <div class="wrap">
          <span>{{page + 1}}</span>
          <span> / </span>
          <span>{{totalPage}}</span>
        </div>
        <button @click="page++" :disabled="page === totalPage - 1">
          <i class="fa fa-chevron-right"></i>
        </button>
      </div>
    </footer>
    <div :is="component" :init="componentData" @remove="remove" @update="update" @refresh="fetchData"></div>
  </div>
</template>

<script>
import editor from "./component/customerEditor";
export default {
  props: ["init"],
  components: { editor },
  data() {
    return {
      componentData: null,
      component: null,
      totalCustomers: 0,
      customerTrend: [],
      customers: [],
      totalPage: 1,
      phone: "",
      page: 0
    };
  },
  created() {
    this.$socket.emit("[CUSTOMER] COUNT", total => {
      this.totalCustomers = total;
      this.totalPage = Math.ceil(total / 20);
    });
    this.$socket.emit("[CUSTOMER] TREND_WEEKLY", data => {
      this.customerTrend = data;
    });
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.$socket.emit("[CUSTOMER] FETCH_LIST", this.page);
    },
    search() {
      this.$socket.emit("[CUSTOMER] SEARCH", this.phone, customer => {
        this.edit(customer);
      });
    },
    edit(customer) {
      this.$p("editor", { customer });
    },
    remove(customer) {
      this.$socket.emit("[CUSTOMER] DELETE", customer, callback => {
        this.fetchData();
      });
      this.$q();
    },
    update(customer) {
      console.log(customer);
      this.$q();
    }
  },
  watch: {
    page() {
      this.fetchData();
    }
  },
  sockets: {
    CUSTOMER_LIST(data) {
      this.customers = data;
    }
  }
};
</script>

<style scoped>
.customer {
  background: #fafafa;
}

header {
  display: flex;
}

.filter {
  flex: 1;
  display: flex;
  padding: 0 15px;
  align-items: center;
  justify-content: flex-end;
}

.search {
  background: #fff;
  border: 1px solid #e0e0e0;
  display: flex;
  padding: 6px;
  border-radius: 4px;
}

input {
  border: none;
  outline: none;
  width: 120px;
  font-family: "Yuanti-SC";
  background: transparent;
  font-weight: bold;
  color: #3c3c3c;
  font-size: 18px;
}

.search i {
  margin: 0 7px 0 4px;
  color: #555;
}

table {
  height: 630px;
}

tbody {
  display: block;
  height: 507px;
  text-align: center;
}

thead,
tbody tr,
tfoot tr {
  display: table;
  table-layout: fixed;
  width: 100%;
}

h3 {
  padding: 20px 0 15px 25px;
  color: #37474f;
  font-weight: normal;
}

h3 i {
  margin-right: 5px;
}

thead th {
  background: #4d6d83;
  padding: 6px 0;
  color: #fff;
  font-weight: normal;
}

td {
  text-align: center;
  padding: 6px 0;
}

tbody tr:nth-child(even) {
  background: #f5f5f5;
}

.phone {
  width: 140px;
}

.address {
  width: 320px;
}

.name {
  width: 220px;
}

.amount {
  width: 70px;
}

footer {
  display: flex;
  align-items: center;
  height: 51px;
  overflow: hidden;
  padding: 0 15px;
  border-top: 1px solid #eee;
}

.svg {
  flex: 1;
  height: 51px;
}

.pagination {
  text-align: right;
  display: flex;
  min-width: 160px;
}

.pagination .wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.pagination button {
  padding: 7px 5px;
  width: 45px;
  border-radius: 4px;
  background: linear-gradient(#fefefe, #cfd0d3);
  border: none;
  outline: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}
</style>
