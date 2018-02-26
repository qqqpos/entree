<template>
    <section class="index">
        <h3>{{$t('setting.softwareSetting')}}</h3>
        <section class="grid">
            <figure @click="go('Setting.store')">
                <i class="fa fa-2x fa-cogs"></i>
                <figcaption>{{$t('setting.store')}}</figcaption>
                <span class="intro">{{$t('setting.storeTip')}}</span>
            </figure>
            <figure @click="go('Setting.menu')">
                <i class="fa fa-2x fa-table"></i>
                <figcaption>{{$t('setting.menu')}}</figcaption>
                <span class="intro">{{$t('setting.menuTip')}}</span>
            </figure>
            <figure @click="go('Setting.table')">
                <i class="fa fa-2x fa-cutlery"></i>
                <figcaption>{{$t('setting.seat')}}</figcaption>
                <span class="intro">{{$t('setting.seatTip')}}</span>
            </figure>
            <figure @click="go('Setting.online')">
                <i class="fa fa-2x fa-globe"></i>
                <figcaption>{{$t('setting.onlineOrder')}}</figcaption>
                <span class="intro">{{$t('setting.onlineOrderTip')}}</span>
            </figure>
            <figure @click="go('Setting.print')">
                <i class="fa fa-2x fa-print"></i>
                <figcaption>{{$t('setting.print')}}</figcaption>
                <span class="intro">{{$t('setting.printTip')}}</span>
            </figure>
            <figure @click="go('Setting.operator.index')">
                <i class="fa fa-2x fa-users"></i>
                <figcaption>{{$t('setting.operator')}}</figcaption>
                <span class="intro">{{$t('setting.operatorTip')}}</span>
            </figure>
            <figure @click="go('Setting.database.index')">
                <i class="fa fa-2x fa-database"></i>
                <figcaption>{{$t('setting.database')}}</figcaption>
                <span class="intro">{{$t('setting.databaseTip')}}</span>
            </figure>
            <figure @click="go('Setting.thirdParty.index')">
                <i class="fa fa-2x fa-list-alt"></i>
                <figcaption>{{$t('setting.thirdParty')}}</figcaption>
                <span class="intro">{{$t('setting.thirdPartyTip')}}</span>
            </figure>
            <figure @click="go('Setting.sales')">
                <i class="fa fa-2x fa-money"></i>
                <figcaption>{{$t('setting.sales')}}</figcaption>
                <span class="intro">{{$t('setting.salesTip')}}</span>
            </figure>
            <figure v-if="op.role === 'Admin'" @click="go('Setting.develop')">
                <i class="fa fa-2x fa-microchip"></i>
                <figcaption>{{$t('setting.system')}}</figcaption>
                <span class="intro">{{$t('setting.systemTip')}}</span>
            </figure>
            <figure @click="go('Dashboard')">
                <i class="fa fa-2x fa-external-link"></i>
                <figcaption>{{$t('setting.exit')}}</figcaption>
                <span class="intro">{{$t('setting.exitTip')}}</span>
            </figure>
        </section>
        <section class="about" @contextmenu="showCredit">
            <div>
                <span class="text">{{$t('setting.host')}}:</span>
                <span class="value">{{about.host}}</span>
            </div>
            <div>
                <span class="text">{{$t('setting.version')}}:</span>
                <span class="value">{{app}}
                    <span :title="$t('setting.buildTime')+time(about.build)">({{about.version}})</span>
                </span>
            </div>
            <div>
                <span class="text">{{$t('setting.support')}}:</span>
                <span class="value">{{about.support}}</span>
            </div>
        </section>
        <div :is="component" :init="componentData"></div>
    </section>
</template>

<script>
import { mapGetters } from "vuex";
import Electron from "electron";
import credit from "./credit";
export default {
  data() {
    return {
      component: null,
      componentData: null,
      about: {},
      app: null
    };
  },
  components: { credit },
  created() {
    this.app = Electron.remote.app.getVersion();
    this.$socket.emit("ABOUT", us => {
      this.about = us;
    });
  },
  methods: {
    go(name) {
      this.$router.push({ name });
    },
    time(value) {
      return moment(value).fromNow();
    },
    showCredit() {
      this.$p("credit");
    }
  },
  computed: {
    ...mapGetters(["op"])
  }
};
</script>

<style scoped>
.index {
  flex-direction: column;
  justify-content: center;
  align-items: center;
  display: flex;
  margin: 3em 0;
  position: relative;
}

h3 {
  font-size: 2em;
  font-family: "Microsoft YaHei";
  color: #666;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 3em 0;
}

figure {
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  padding: 20px 10px 10px;
  height: 104px;
  width: 170px;
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
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
  margin-top: 10px;
  color: #3c3c3c;
  font-size: 1.25em;
}

.intro {
  color: gray;
  text-align: center;
}

section.about {
  position: fixed;
  left: 5px;
  bottom: 5px;
}

section.about > div {
  display: flex;
  width: 180px;
}

section.about .value {
  flex: 1;
  text-align: right;
  color: #37474f;
}
</style>