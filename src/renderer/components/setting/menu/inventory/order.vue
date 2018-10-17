<template>
    <div>
        <nav class="row flex-center">
            <h3 class="f1 normal">{{$t('inventory.order')}}</h3>
            <button class="mini-btn" @click="stockIn"><i class="fa fa-plus space light"></i>{{$t('button.new')}}</button>
        </nav>
        <div class="row">
            <aside>
                <div class="row flex-center">
                  <div class="filter-wrap row">
                      <i class="fa fa-search ghost space"></i>
                      <input type="text" v-model="search" :placeholder="$t('title.search')+'...'" @keypress.enter="searchOrder">
                  </div>
                </div>
                <ul class="order">
                    <li v-for="(order,index) in orders" :key="index" class="row pointer" @click="view(order)">
                        <div>
                            <h5><span class="date normal">{{order.time | moment('ddd DD')}}</span>{{order.title}}</h5>
                            <p>{{order.memo}}</p>
                        </div>
                    </li>
                </ul>
            </aside>
            <main class="f1">
                <div class="detail">
                    <header class="row flex-center">
                        <h3 class="f1">{{$t('inventory.orderDetail')}}</h3>
                        <button class="mini-btn space-right"><i class="fa fa-print space"></i>{{$t('button.print')}}</button>
                        <button class="mini-btn"><i class="fa fa-edit space"></i>{{$t('button.edit')}}</button>
                    </header>
                    <div class="brief row">
                        <div class="row flex-center f1">
                            <div class="column f1">
                                <h5 class="normal">{{$t('inventory.vendor')}}</h5>
                                <h4>{{receipt.vendor}}</h4>
                            </div>
                            <i class="fas fa-box light"></i>
                        </div>
                        <div class="row flex-center f1">
                            <div class="column f1">
                                <h5 class="normal">{{$t('inventory.handler')}}</h5>
                                <h4>{{receipt.handler}}</h4>
                            </div>
                            <i class="fas fa-user-edit light"></i>
                        </div>                    
                        <div class="row flex-center f1">
                            <div class="column f1">
                                <h5 class="normal">{{$t('text.date')}}</h5>
                                <h4>{{receipt.date}}</h4>
                            </div>
                            <i class="far fa-calendar-alt light"></i>
                        </div>
                        <div class="row flex-center f1 borderless">
                            <div class="column f1">
                                <h5 class="normal">{{$t('text.time')}}</h5>
                                <h4>{{receipt.time | moment('HH:mm:ss')}}</h4>
                            </div>
                            <i class="far fa-clock light"></i>
                        </div>                                                            
                    </div>
                  <table>
                    <thead>
                      <tr>
                        <th>{{$t('inventory.product')}}</th>
                        <th>{{$t('inventory.cost')}}</th>
                        <th>{{$t('inventory.qty')}}</th>
                        <th>{{$t('inventory.total')}}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item,index) in receipt.items" :key="index">
                        <td>{{item.description}}</td>
                        <td>{{item.cost}}</td>
                        <td>{{item.stock}}</td>
                        <td>{{item.cost * item.stock | decimal}}</td>
                      </tr>
                    </tbody>
                    <tfoot></tfoot>
                  </table>                    
                </div>

            </main>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import chrono from "chrono-node";
import scanner from "./helper/scan";
import editor from "../editor/order";

export default {
  components: { scanner, editor },
  beforeRouteEnter: (from, to, next) => {
    appSocket.emit("[INVENTORY] ORDER_LIST", orders =>
      next(vm => {
        vm.orders = Object.freeze(orders);

        if (vm.orders.length) vm.receipt = vm.orders[0];
      })
    );
  },
  data() {
    return {
      componentData: null,
      component: null,
      search: "",
      orders: [],
      receipt: {}
    };
  },
  methods: {
    view(order) {
      this.receipt = order;
    },
    searchOrder() {
      const parse = chrono.parse(this.search);
      console.log(parse);
    },
    stockIn() {
      const inventory = {
        vendor: "",
        date: today(),
        handler: this.$store.getters.op.name,
        reference: "",
        memo: "",
        items: [],
        subtotal: 0,
        discount: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        paid: 0
      };

      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject, inventory };
        this.component = "editor";
      })
        .then(update => {
          this.exitComponent();
        })
        .catch(this.exitComponent);
    },
    openScanDialog() {
      return new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "scanner";
      });
    }
  }
};
</script>

<style scoped>
nav {
  padding: 5px 10px 5px 15px;
  background: #607d8b;
  color: #fff;
}

aside {
  width: 250px;
  border-right: 1px solid #ddd;
  background: #fff;
}

.filter-wrap {
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 5px;
  width: 200px;
  margin: 5px auto;
}

ul.order {
  border-bottom: 1px solid #eee;
}

ul.order li {
  min-height: 35px;
  padding: 5px 0 5px 15px;
  align-items: center;
  border-top: 1px solid #eee;
}

main {
  background: #efefef;
}

main .detail {
  margin: 15px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 620px;
}

.detail header {
  padding: 5px 10px 5px 15px;
  border-bottom: 1px solid #ddd;
}

.brief > div {
  padding: 0 15px;
  height: 46px;
  background: #eceff1;
  color: #3c3c3c;
  border-right: 1px solid #cfd8dc;
}

.date {
  margin-right: 5px;
}

tr th {
  padding: 5px 0 5px;
  background: #f5f5f5;
  color: #505865;
  border-right: 1px solid #eee;
  border-top: 1px solid #cfd8dc;
  border-bottom: 1px solid #eceff1;
}

tr td {
  text-align: center;
  padding: 7px 5px;
  border-right: 1px solid #eee;
}

tr:last-child td {
  border-bottom: 1px solid #eee;
}
</style>

