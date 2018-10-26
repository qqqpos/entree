<template>
    <i line :style="style" v-if="display" ref="line">{{time.alias}}</i>
</template>

<script>
export default {
  props: ["time", "index"],
  data() {
    return {
      style: {
        top: "0px"
      },
      display: true
    };
  },
  mounted() {
    const doms = document.querySelectorAll("i[line]");
    const top = (150 / doms.length) * this.index + 10;

    const from = moment(new Date(today() + " " + this.time.from));
    const to = moment(new Date(today() + " " + this.time.to));
    const base = document.querySelector("div.hour");

    let width = Math.round(Math.abs(to.diff(from, "hours")) * 50);
    let left = `15`;

    if (base) {
      const baseHour = moment(today()).hour(base.dataset.hour);
      const diff = baseHour.diff(from, "hours") * -1;
      const { left: x1 } = base.getBoundingClientRect();
      const { left: x2 } = document
        .querySelector(".chart")
        .getBoundingClientRect();

      left = x1 - x2 + diff * 50;

      width = width + left > 750 ? 750 - left : width - 10;
    } else {
      this.display = false;
    }

    this.style = {
      top: top + "px",
      width: width + "px",
      left: left + "px",
      "transition-delay": this.index * 0.2 + "s"
    };
  },
  updated() {
    setTimeout(
      () =>
        this.$refs.line &&
        this.$refs.line.style.removeProperty("transition-delay"),
      100
    );
  }
};
</script>

<style scoped>
i[line] {
  width: 250px;
  font-size: 12px;
  top: 65px;
  left: 0;
  height: 15px;
  cursor: pointer;
  position: absolute;
  color: #d84315;
  font-style: initial;
  padding-top: 2px;
  margin-top: 15px;
  transform-origin: center;
  border-top: 1px dashed rgba(255, 152, 0, 0.45);
}

i[line]:hover {
  font-weight: bold;
}

i[line]:before,
i[line]:after {
  font-family: fontAwesome;
  position: absolute;
  top: -6px;
  display: block;
  font-weight: bold;
  color: rgb(255, 152, 0);
  font-size: 10px;
}

i[line]:before {
  content: "\f053";
  left: 0;
}

i[line]:after {
  content: "\f054";
  right: 0;
}
</style>

