<template>
    <div class="customer">
        <header>
            <nav>
                <h3><i class="fa fa-phone-square"></i><span>{{$t('title.callList')}}</span></h3>
            </nav>
            <section class="filter">

            </section>
        </header>
        <table>
            <thead>
                <tr>
                    <th>{{$t('thead.date')}}</th>
                    <th>{{$t('thead.time')}}</th>
                    <th>{{$t('thead.phone')}}</th>
                    <th>{{$t('thead.customer')}}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(call,index) in calls" :key="index">
                    <td>{{call.date}}</td>
                    <td>{{call.time | moment("HH:mm:ss")}}</td>
                    <td>{{call.phone | phone}}</td>
                    <td>{{call.customer}}</td>
                </tr>
            </tbody>
        </table>
        <footer>
            <div class="svg">
                <!-- <trend :data="customerTrend" :gradient="['#6fa8dc', '#42b983', '#2c3e50']" :height="51" auto-draw smooth></trend> -->
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
        <div :is="component" :init="componentData"></div>
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
      totalPage: 0,
      customerTrend: [],
      calls: [],
      page: 0
    };
  },
  created() {
    this.$socket.emit("[CALL] COUNT", count => {
      this.totalPage = Math.floor(count / 20);
    });
    this.$socket.emit("[CALL] TREND_WEEKLY", data => {
      console.log(data);
      this.customerTrend = data;
    });
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.$socket.emit("[CALL] FETCH_LIST", this.page);
    }
  },
  watch: {
    page() {
      this.fetchData();
    }
  },
  sockets: {
    CALL_LIST(data) {
      this.calls = data;
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

table {
  table-layout: auto;
  border-spacing: 0;
  width: 100%;
  height: 630px;
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
