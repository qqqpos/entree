<template>
  <div>
    <ul class="tabs">
      <router-link tag="li" class="tab" :to="{name:'Setting.database.address'}">{{$t('nav.list')}}</router-link>
      <template v-if="address">
        <router-link tag="li" class="tab" :to="{name:'Setting.database.address.street',params:{address}}">{{$t('nav.address')}}</router-link>
      </template>
    </ul>
    <transition name="slide" mode="out-in">
      <router-view class="tab-content" :total="total" :addresses="addresses" @update="setPage" @set="setAddress" @reset="address = null" @refresh="fetchData"></router-view>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      addresses: [],
      address: null,
      total: 0,
      page: 0
    };
  },
  beforeRouteEnter: (to, from, next) => {
    appSocket.emit("[ADDRESS] COUNT", total => {
      appSocket.emit("[ADDRESS] LIST", 0, addresses => {
        next(vm => {
          vm.total = total;
          vm.addresses = addresses;
        });
      });
    });
  },
  methods: {
    setAddress(address) {
      this.address = address;
      this.$router.push({
        name: "Setting.database.address.street",
        params: { address }
      });
    },
    setPage(page) {
      this.page = page;
    },
    fetchData(page) {
      page = page || this.page;
      this.$socket.emit("[ADDRESS] COUNT", total => {
        this.total = total;
      });
      this.$socket.emit("[ADDRESS] LIST", page, addresses => {
        this.addresses = addresses;
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