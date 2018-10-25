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
                        <li>Pick Up</li>
                        <li>Walk In</li>
                        <li>Delivery</li>
                        <li>Dine In</li>
                    </ul>   
                    <div class="f1 flex-center row">
                        <div class="graph">
                            <div class="bar"></div>
                            <div class="bar"></div>
                            <div class="bar"></div>
                            <div class="bar"></div>
                        </div>
                    </div>                                     
                </div>
                <p>Toggle next icon to see payment types.</p>
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
      overall: 0
    };
  },
  created() {
    console.log("trigger");
    this.$bus.on("HIGHEST_HOURLY_SALES", this.applyData);
  },
  beforeDestroy() {
    this.$bus.off("HIGHEST_HOURLY_SALES", this.applyData);
  },
  methods: {
    applyData(obj) {
      Object.assign(this, obj);
    }
  },
  computed: {
    peakRatio() {
      const ratio = parseFloat((this.peakAmount / this.overall) * 100) || 0;
      return ratio.toFixed(2) + "%";
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

.option i {
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
  color: #b6b6b6;
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
  width: 85px;
  text-align: center;
  position: relative;
  padding-left: 20px;
}

.graph .bar {
  float: left;
  width: 10px;
  margin-right: 10px;
  position: relative;
  border-radius: 3px 3px 0 0;
  background: #4fa584;
}

.graph .bar:nth-child(1) {
  height: 20px;
  bottom: -10px;
  animation: graph1 1s;
}
.graph .bar:nth-child(2) {
  animation: graph2 1s;
  height: 30px;
}

.graph .bar:nth-child(3) {
  height: 24px;
  animation: graph3 1s;
  bottom: -6px;
}

.graph .bar:nth-child(4) {
  height: 14px;
  animation: graph4 1s;
  bottom: -16px;
}

ul {
  margin: 0px 30px 10px 0px;
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

/* @keyframes bar {
  from {
    width: 0px;
  }
  to {
    width: 58%;
  }
} */

@keyframes graph1 {
  from {
    height: 0px;
  }
  to {
    height: 20px;
  }
}

@keyframes graph2 {
  from {
    height: 0px;
  }
  to {
    height: 30px;
  }
}

@keyframes graph3 {
  from {
    height: 0px;
  }
  to {
    height: 24px;
  }
}

@keyframes graph4 {
  from {
    height: 0px;
  }
  to {
    height: 13px;
  }
}
</style>

