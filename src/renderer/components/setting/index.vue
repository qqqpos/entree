<template>
  <div class="wrap">
    <h3>{{$t('setting.softwareSetting')}}</h3>
    <section class="grids">
      <router-link tag="figure" :to="{name:'Setting.store'}">
        <i class="fa fa-2x fa-cogs"></i>
        <figcaption>{{$t('setting.store')}}</figcaption>
        <p>{{$t('setting.storeTip')}}</p>
      </router-link>
      <router-link tag="figure" :to="{name:'Setting.menu'}">
        <i class="fa fa-2x fa-braille"></i>
        <figcaption>{{$t('setting.menu')}}</figcaption>
        <p>{{$t('setting.menuTip')}}</p>
      </router-link>
      <router-link tag="figure" :to="{name:'Setting.table'}">
        <i class="fa fa-2x fa-tablets"></i>
        <figcaption>{{$t('setting.seat')}}</figcaption>
        <p>{{$t('setting.seatTip')}}</p>
      </router-link>
      <router-link tag="figure" :to="{name:'Setting.online'}" v-show="store.onlineOrder">
        <div class="ribbon red"><span>New</span></div>
        <i class="fas fa-2x fa-globe-americas"></i>
        <figcaption>{{$t('setting.onlineOrder')}}</figcaption>
        <p>{{$t('setting.onlineOrderTip')}}</p>
      </router-link>
      <router-link tag="figure" :to="{name:'Setting.printer'}">
        <i class="fa fa-2x fa-print"></i>
        <figcaption>{{$t('setting.print')}}</figcaption>
        <p>{{$t('setting.printTip')}}</p>
      </router-link>
      <router-link tag="figure" :to="{name:'Setting.operator'}">
        <i class="fa fa-2x fa-users"></i>
        <figcaption>{{$t('setting.operator')}}</figcaption>
        <p>{{$t('setting.operatorTip')}}</p>
      </router-link>
      <router-link tag="figure" :to="{name:'Setting.sales'}">
        <i class="fas fa-2x fa-chart-line"></i>
        <figcaption>{{$t('setting.sales')}}</figcaption>
        <p>{{$t('setting.salesTip')}}</p>
      </router-link>
      <router-link tag="figure" :to="{name:'Setting.chart'}">
        <i class="fas fa-2x fa-chart-pie"></i>
        <figcaption>{{$t('setting.chart')}}</figcaption>
        <p>{{$t('setting.chartTip')}}</p>
      </router-link>
      <router-link tag="figure" :to="{name:'Setting.database'}">
        <i class="fa fa-2x fa-database"></i>
        <figcaption>{{$t('setting.database')}}</figcaption>
        <p>{{$t('setting.databaseTip')}}</p>
      </router-link>
      <router-link tag="figure" :to="{name:'Setting.debug'}">
        <i class="fa fa-2x fa-bug"></i>
        <figcaption>{{$t('setting.tool')}}</figcaption>
        <p>{{$t('setting.troubleshooting')}}</p>
      </router-link>
      <router-link tag="figure" :to="{name:'Dashboard'}">
        <i class="fas fa-2x fa-sign-out-alt"></i>
        <figcaption>{{$t('setting.exit')}}</figcaption>
        <p>{{$t('setting.exitTip')}}</p>
      </router-link>
    </section>
    <system-information class="spec"></system-information>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import systemInformation from "./component/systemInformation";

export default {
  components: { systemInformation },
  data() {
    return {
      componentData: null,
      component: null
    };
  },
  computed: {
    ...mapGetters(["op", "store"])
  },
  methods: {
    go(name) {
      this.$router.push({ name });
    }
  }
};
</script>

<style scoped>
.wrap {
  flex-direction: column;
  align-items: center;
  display: flex;
}

h3 {
  font-family: "Microsoft YaHei";
  margin: 30px 0 10px;
  font-size: 2em;
  color: #666;
}

.grids {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 2em 0;
}

figure {
  background: linear-gradient(to bottom, #fff 0%, #e5e5e5 100%);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  padding: 20px 10px 10px;
  height: 104px;
  width: 170px;
  border-radius: 4px;
  box-shadow: var(--shadow);
  position: relative;
}

figure:active {
  background: #f6f6f6;
  color: #666;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.45);
}

figure i {
  color: #1e88e5;
}

figcaption {
  font-family: "Microsoft YaHei";
  font-weight: bold;
  margin: 7px 0 3px;
  color: #3c3c3c;
  font-size: 1.25em;
}

p {
  color: gray;
  text-align: center;
}

.spec {
  width: 97%;
}

.ribbon {
  position: absolute;
  right: -5px;
  top: -5px;
  z-index: 1;
  overflow: hidden;
  width: 75px;
  height: 75px;
  text-align: right;
}

.ribbon span {
  font-size: 10px;
  color: #fff;
  text-transform: uppercase;
  text-align: center;
  font-weight: bold;
  line-height: 20px;
  transform: rotate(45deg);
  width: 100px;
  display: block;
  background: #79a70a;
  background: linear-gradient(#9bc90d 0%, #79a70a 100%);
  box-shadow: 0 3px 10px -5px rgba(0, 0, 0, 1);
  position: absolute;
  top: 19px;
  right: -21px;
  text-shadow: 0 1px 2px #333;
}

.ribbon span::before {
  content: "";
  position: absolute;
  left: 0px;
  top: 100%;
  z-index: -1;
  border-left: 3px solid #79a70a;
  border-right: 3px solid transparent;
  border-bottom: 3px solid transparent;
  border-top: 3px solid #79a70a;
}
.ribbon span::after {
  content: "";
  position: absolute;
  right: 0%;
  top: 100%;
  z-index: -1;
  border-right: 3px solid #79a70a;
  border-left: 3px solid transparent;
  border-bottom: 3px solid transparent;
  border-top: 3px solid #79a70a;
}

.red span {
  background: linear-gradient(#f70505 0%, #8f0808 100%);
}
.red span::before {
  border-left-color: #8f0808;
  border-top-color: #8f0808;
}
.red span::after {
  border-right-color: #8f0808;
  border-top-color: #8f0808;
}

.blue span {
  background: linear-gradient(#2989d8 0%, #1e5799 100%);
}
.blue span::before {
  border-left-color: #1e5799;
  border-top-color: #1e5799;
}
.blue span::after {
  border-right-color: #1e5799;
  border-top-color: #1e5799;
}
</style>