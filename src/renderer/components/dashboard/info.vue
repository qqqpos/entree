<template>
  <main class="window">
    <div class="switch">
      <figure :class="{active:ticket.type === 'PICK_UP'}" @click="setTicket({type:'PICK_UP'});setOrder({type:'PICK_UP'})">
        <i class="fa fa-user"></i>
        <span class="text">{{$t('type.PICK_UP')}}</span>
      </figure>
      <figure :class="{active:ticket.type === 'DELIVERY'}" @click="setTicket({type:'DELIVERY'});setOrder({type:'DELIVERY'})">
        <i class="fa fa-car"></i>
        <span class="text">{{$t('type.DELIVERY')}}</span>
      </figure>
    </div>
    <header>
      <span class="fa fa-user-circle avatar" @click="tap('customer')"></span>
      <div>
        <span>{{$t('dashboard.customerInfo')}}</span>
        <i class="fa fa-times close" @click="cancel"></i>
      </div>
    </header>
    <nav>
      <div class="tab active" @click="tap('form',$event)">{{$t('dashboard.customerInfo')}}</div>
      <div class="tab" @click="tap('note',$event)">{{$t('dashboard.note')}}</div>
      <div class="tab" @click="tap('history',$event)">{{$t('dashboard.history')}}</div>
      <div class="tab" @click="tap('giftCard',$event)">{{$t('dashboard.giftCard')}}</div>
    </nav>
    <router-view></router-view>
  </main>
</template> 

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  methods: {
    tap(tab, e) {
      e && document.querySelector(".tab.active").classList.remove("active");
      e && e.currentTarget.classList.add("active");
      switch (tab) {
        case "form":
          this.$router.push({ name: "Information" });
          break;
        case "note":
          this.$router.push({ name: "Note" });
          break;
        case "customer":
          this.customer.phone.length === 10 &&
            this.$router.push({ name: "Profile" });
          break;
        case "history":
          this.customer.phone.length === 10 &&
            this.$router.push({ name: "OrderHistory" });
          break;
        case "log":
          this.customer.phone.length === 10 &&
            this.$router.push({ name: "CallList" });
          break;
        case "giftCard":
          this.customer.phone.length === 10 &&
            this.$router.push({ name: "customerGiftCard" });
          break;
      }
    },
    cancel() {
      this.resetMenu();
      this.resetDashboard();
      this.$router.push({ path: "/main" });
    },
    ...mapActions(["resetMenu", "setTicket", "setOrder", "resetDashboard"])
  },
  computed: {
    ...mapGetters(["customer", "order", "ticket"])
  }
};
</script>

<style scoped>
main.moveUp {
  margin-bottom: 200px;
}

.switch {
  display: flex;
  position: absolute;
  top: -56px;
  left: 120px;
  z-index: 0;
  height: 55px;
  overflow: hidden;
}

.switch figure {
  background: #fafafa;
  margin: 0 5px;
  padding: 10px 30px 5px;
  flex-direction: column;
  cursor: pointer;
  transform: translate3d(0, 23px, 0);
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  opacity: 0.75;
  color: #3a5461;
  transition: all 0.22s ease-in-out;
}

figure .text {
  margin-top: 5px;
}

figure.active {
  transform: translate3d(0, 0px, 0);
  opacity: 1;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  border-top: 3px solid #2196f3;
  display: flex;
  align-items: center;
}

header {
  padding: 13px 27px 13px 126px;
  position: relative;
  border-bottom: 1px solid #183f67;
  background: #2599f2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  color: #fff;
  font-size: 1.25em;
  width: auto;
}

.avatar {
  position: absolute;
  left: 20px;
  top: -40px;
  border-radius: 50%;
  text-align: center;
  background: #03a9f4;
  font-size: 4em;
  font-family: fontAwesome;
  cursor: pointer;
}

i.close {
  padding: 14px 20px;
  position: absolute;
  top: 0;
  right: 0;
}

.tab.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 2px solid #ff9800;
}

.tab {
  padding: 10px 25px;
  transition: all 0.22s;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

nav {
  display: flex;
  background: #234c75;
  color: #607d8b;
  border-bottom: 1px solid #9e9e9e;
}
</style>