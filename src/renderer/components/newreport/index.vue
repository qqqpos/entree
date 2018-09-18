<template>
    <div class="popupMask dark center" @click.self="init.resolve">
        <div class="report">
            <header class="boxCenter column">
                <h3>Sales Report</h3>
                <h5>Please select a report layout</h5>
            </header>
            <div class="wrap">
                <ul class="row boxCenter">
                    <li class="column">
                        <input type="radio" name="type" value="CLASSIC" v-model="layout" id="CLASSIC">
                        <div class="sketch">

                        </div>
                        <label for="CLASSIC">Classic</label>
                    </li>
                    <li class="column">
                        <input type="radio" name="type" value="CASHFLOW" v-model="layout" id="CASHFLOW">
                        <div class="sketch"></div>
                        <label for="CASHFLOW">Cash Flow</label>
                    </li>
                    <li class="column">
                        <input type="radio" name="type" value="CUSTOMIZE" v-model="layout" id="CUSTOMIZE">
                        <div class="sketch"></div>
                        <label for="CUSTOMIZE">Customize</label>
                    </li>
                </ul>
            </div>
            <footer>

            </footer>
        </div>
    </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      layout: "CLASSIC"
    };
  },
  methods: {}
};
</script>

<style scoped>
.report {
  width: 820px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  text-align: center;
  background: #f1f1f1;
}

header {
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 20px 0 15px;
  border-radius: 4px 4px 0 0;
}

h5 {
  font-weight: normal;
  color: #757575;
}

.wrap {
  height: 400px;
}

li {
  margin: 25px;
}

.sketch {
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
  background: #fff;
  width: 160px;
  height: 170px;
  border-radius: 3px;
}
</style>