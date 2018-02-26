<template>
  <div class="index">
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
        <i class="fa fa-2x fa-cutlery"></i>
        <figcaption>{{$t('setting.seat')}}</figcaption>
        <p>{{$t('setting.seatTip')}}</p>
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
      <router-link tag="figure" :to="{name:'Setting.database'}">
        <i class="fa fa-2x fa-database"></i>
        <figcaption>{{$t('setting.database')}}</figcaption>
        <p>{{$t('setting.databaseTip')}}</p>
      </router-link>
      <router-link tag="figure" :to="{name:'Setting.sales'}">
        <i class="fa fa-2x fa-line-chart"></i>
        <figcaption>{{$t('setting.sales')}}</figcaption>
        <p>{{$t('setting.salesTip')}}</p>
      </router-link>
      <router-link tag="figure" :to="{name:'Setting.chart'}">
        <i class="fa fa-2x fa-pie-chart"></i>
        <figcaption>{{$t('setting.chart')}}</figcaption>
        <p>{{$t('setting.chartTip')}}</p>
      </router-link>
      <router-link tag="figure" :to="{name:'Dashboard'}">
        <i class="fa fa-2x fa-external-link"></i>
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
    ...mapGetters(["op"])
  },
  methods: {
    go(name) {
      this.$router.push({ name });
    }
  }
};
</script>

<style scoped>
.index {
  flex-direction: column;
  justify-content: center;
  align-items: center;
  display: flex;
  position: relative;
}

h3 {
  font-family: "Microsoft YaHei";
  font-size: 2em;
  color: #666;
  margin: 30px 0 10px;
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
</style>