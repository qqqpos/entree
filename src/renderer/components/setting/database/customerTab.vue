<template>
  <div>
    <ul class="tabs">
      <router-link tag="li" class="tab" :to="{name:'Setting.database.customer'}">{{$t('nav.list')}}</router-link>
      <router-link tag="li" class="tab" :to="{name:'Setting.database.customer.profile',params:{profile}}" :class="{disable:!profile}">{{$t('nav.profile')}}</router-link>
      <router-link tag="li" class="tab" :to="{name:'Setting.database.customer.analyze'}">{{$t('nav.analyze')}}</router-link>
    </ul>
    <transition name="slide" mode="out-in">
      <router-view class="tab-content" :total="total" :customers="customers" @update="setPage" @set="setCustomer" @reset="profile = null" @refresh="fetchData" @create="fetchTotal"></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      customers: [],
      profile: null,
      total: 0,
      page: 0
    };
  },
  beforeRouteEnter: (to, from, next) => {
    appSocket.emit("[CUSTOMER] COUNT", total => {
      appSocket.emit("[CUSTOMER] LIST", 0, customers => {
        next(vm => {
          vm.total = total;
          vm.customers = customers;
        });
      });
    });
  },
  methods: {
    setPage(page) {
      this.page = page;
    },
    setCustomer(profile) {
      this.profile = profile;
      this.$router.push({
        name: "Setting.database.customer.profile",
        params: { profile }
      });
    },
    fetchData(page) {
      page = isNumber(page) ? page : this.page;
      this.$socket.emit("[CUSTOMER] LIST", page, customer => {
        this.customers = customer;
      });
    },
    fetchTotal() {
      this.$socket.emit("[CUSTOMER] COUNT", total => {
        this.total = total;
      });
    }
  },
  watch: {
    page(n) {
      this.fetchData(n);
    }
  }
};
</script>