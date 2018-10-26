<template>
  <div class="grid">
    <h3>{{$t('setting.softwareSetting')}}</h3>
    <section class="options">
      <router-link tag="figure" :to="{name:'Setting.store'}">
        <i class="fa fa-2x fa-cogs"></i>
        <figcaption>{{$t('setting.store')}}</figcaption>
        <p>{{$t('setting.storeTip')}}</p>
      </router-link>
      <router-link tag="figure" :to="{name:'Setting.station'}">
        <i class="fas fa-2x fa-chalkboard-teacher"></i>
        <figcaption>{{$t('setting.station')}}</figcaption>
        <p>{{$t('setting.stationTip')}}</p>
      </router-link>      
      <router-link tag="figure" :to="{name:'Setting.menu'}">
        <i class="fa fa-2x fa-braille"></i>
        <figcaption>{{$t('setting.menu')}}</figcaption>
        <p>{{$t('setting.menuTip')}}</p>
      </router-link>
      <router-link tag="figure" :to="{name:'Setting.dineIn'}">
        <i class="fas fa-2x fa-cocktail"></i>
        <figcaption>{{$t('setting.dineIn')}}</figcaption>
        <p>{{$t('setting.dineInTip')}}</p>
      </router-link>
      <router-link tag="figure" :to="{name:'Setting.online'}" class="disabled">
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
        <i class="fas fa-2x fa-users-cog"></i>
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
    <system-info></system-info>
    <about></about>
  </div>
</template>

<script>
import about from "./component/about";
import systemInfo from "./component/systemInformation";

export default {
  components: { about, systemInfo }
};
</script>

<style scoped>
.grid {
  display: grid;
  text-align: center;
  justify-content: center;
  grid-template-rows: 120px 1fr;
}

h3 {
  padding: 44px 0 41px;
  line-height: 1;
  font-size: 2em;
  color: #3c3c3c;
  text-shadow: 0 1px 1px #f5f5f5;
  font-family: "Microsoft YaHei";
}

.options {
  display: grid;
  grid-gap: 15px;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 1fr 1fr 1fr;
  justify-content: center;
}

figure {
  background: linear-gradient(to bottom, #fff 0%, #f1f3f5 100%);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 10px 10px;
  height: 104px;
  width: 170px;
  border-radius: 4px;
  box-shadow: var(--shadow);
  position: relative;
}

figure:active {
  color: #678;
  background: #f6f6f6;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.45);
}

i {
  color: var(--deepBlue);
}

figcaption {
  font-family: "Microsoft YaHei";
  font-weight: bold;
  margin: 7px 0 3px;
  color: #345;
  font-size: 1.25em;
}

p {
  color: #678;
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>