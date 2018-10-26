<template>
    <div class="menu row">
        <div class="option">
            <div class="inner">
                <h2>General Report</h2>
                <p>Summary of all sales</p>
                <div class="percentage">
                    <span class="agency">58 %</span>
                </div>
                <div class="progress">
                    <div class="bar" :style="{width:'58%'}"></div>
                </div>
                <p>Lorem ipsum dolor sit amet. Some more super groovy information about this stat.</p>
            </div>
            <div class="drop">
                <p>Print General Report</p>
                <div class="arrow"></div>
            </div>
        </div>
        <div class="option">
            <i class="fas fa-chevron-circle-right ghost"></i>
            <div class="inner">
                <h2>Sales By Type</h2>
                <p>Summarize by ticket type</p>
                <div class="row">
                    <ul class="f1">
                        <li v-for="(data,type,index) in types" class="row" :key="index">
                          <span class="f1">{{$t('type.'+type)}}</span>
                          <span class="light"><i class="fas fa-dollar-sign space-right"></i>{{data.amount | decimal}}</span>
                        </li>
                    </ul>   
                    <div class="f1 flex-center row">
                        <div class="graph row">
                            <div class="bar" v-for="(data,type,index) in types" :key="index" :style="{height:data.amount / overall * 60 + 'px'}"></div>
                        </div>
                    </div>                                     
                </div>
                <div class="hint">
                  <p>{{mostSaleType}}</p>
                </div>
            </div>
            <div class="drop">
                <p>Print Sales Report</p>
                <div class="arrow"></div>
            </div>            
        </div>
        <div class="option">
            <i class="fas fa-chevron-circle-right ghost"></i>
            <div class="inner">
                <h2>Sales Details</h2>
                <p>Highest hourly sales</p>
                <div class="percentage">
                    <span class="agency">$ {{peakAmount | decimal}}</span>
                </div>
                <div class="progress">
                    <div class="bar" :style="{width:peakRatio}"></div>
                </div>
                <p>This Highest sales volume happened at {{rushHour}}. It caps {{peakRatio}} of today total sales.</p>                
            </div>
            <div class="drop">
                <p>Print Report</p>
                <div class="arrow"></div>
            </div>            
        </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      rushHour: null,
      peakAmount: 0,
      overall: 0,
      types: {
        WALK_IN: {
          amount: 0
        },
        PICK_UP: {
          amount: 0
        },
        DINE_IN: {
          amount: 0
        }
      }
    };
  },
  created() {
    this.$bus.on("REPORT_SUMMARY", this.applyData);
  },
  beforeDestroy() {
    this.$bus.off("REPORT_SUMMARY", this.applyData);
  },
  methods: {
    applyData(obj) {
      console.log(obj);
      Object.assign(this, obj);
    }
  },
  computed: {
    peakRatio() {
      const ratio = parseFloat((this.peakAmount / this.overall) * 100) || 0;
      return ratio.toFixed(2) + "%";
    },
    mostSaleType() {
      const { amount, count, type } = Object.entries(this.types).reduce(
        (a, c) =>
          c[1].amount > a.amount
            ? { amount: c[1].amount, count: c[1].count, type: c[0] }
            : a,
        { amount: 0, count: 0, type: "" }
      );

      const ptg = ((amount / this.overall) * 100).toFixed(2);

      return this.$t(
        "report.tip.mostSaleType",
        this.$t("type." + type),
        count,
        amount.toFixed(2),
        ptg
      );
    }
  }
};
</script>

<style scoped>
.menu {
  width: 800px;
  margin: 0 auto;
  margin-top: 40px;
  text-align: initial;
}

.option {
  flex: 1;
  height: 220px;
  position: relative;
  color: #fff;
  background: #3d3d3d;
  float: left;
  box-shadow: -1px 0px rgba(250, 250, 250, 0.09);
  cursor: pointer;
  transform: scale(1);
  transition-property: transform, background;
  transition-duration: 0.3s;
}

.option .inner {
  padding: 30px 30px 13px;
}

.option > i {
  position: absolute;
  right: 0;
  top: 0;
  padding: 15px 20px;
}

h2 {
  font-weight: normal;
  font-size: 16px;
  margin: -4px 0px 3px 0px;
}

p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  clear: left;
  font-weight: 300;
  width: 180px;
  margin: 2px 0px 15px 0px;
}

.percentage span {
  font-size: 36px;
  font-weight: 700;
}

.progress {
  width: 100%;
  margin-top: 10px;
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  margin-bottom: 15px;
  border-radius: 4px;
}

.progress .bar {
  height: 6px;
  float: left;
  width: 0%;
  background: #4fa584;
  border-radius: 4px;
  transition: width 2s ease-in-out;
  /* animation: bar 2s; */
}

.graph {
  width: 85px;
  height: 50px;
  justify-content: space-evenly;
  align-items: flex-end;
  margin-left: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
}

.graph .bar {
  width: 10px;
  height: 0;
  position: relative;
  border-radius: 3px 3px 0 0;
  background: #4fa584;
  transition: height 1s ease;
}

ul {
  margin: 0px 5px 10px 0px;
  padding: 0;
  list-style-type: none;
  font-size: 11px;
  font-weight: 400;
  line-height: 20px;
}

.drop {
  z-index: -3;
  opacity: 0;
  width: calc(100% - 60px);
  height: 10px;
  background: #3e8368;
  position: absolute;
  color: white;
  bottom: 0;
  padding: 12px 30px 21px 30px;
  transition-property: bottom, opacity;
  transition-duration: 0.3s;
}

.drop p {
  color: #f8fbfa;
}

.option:hover {
  border-radius: 4px 4px 0 0;
  background: #4fa584;
  transform: scale(1.1);
  transition-property: border-radius, transform, background;
  transition-duration: 0.3s;
  position: relative;
  z-index: 1;
}

.option:hover > .inner p {
  color: #b3dacb;
}

.option:hover .progress .bar,
.option:hover .graph .bar {
  background: #fff;
}

.option:hover > .drop {
  transition-property: bottom, opacity;
  transition-duration: 0.3s;
  bottom: -42px;
  opacity: 1;
}

.arrow {
  width: 4px;
  height: 4px;
  transition: transform 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transform: rotate(45deg);
  border-top: 1px solid #cdead3;
  border-right: 1px solid #cdead3;
  float: right;
  position: relative;
  top: -24px;
  right: 0px;
}

.option:hover > .drop .arrow {
  transition-duration: 1s;
  transform: rotate(765deg);
}

.hint {
  margin-top: 10px;
}

.hint p {
  width: unset;
  margin: unset;
}
</style>

