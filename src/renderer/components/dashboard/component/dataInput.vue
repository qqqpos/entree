<template>
  <section>
    <label :for="id">
      {{$t(label)}}
      <transition-group name="slideUp" class="matrix" tag="div">
        <span class="distance" v-if="distance" :key="1">{{distance}}</span>
        <span class="duration" v-if="duration" :key="2">{{duration}}</span>
      </transition-group>
    </label>
    <div class="field">
      <input type="text" :id="id" :value="value" @input="input($event)" @click="setAnchor($event)">
      <i :class="icon"></i>
    </div>
    <dialog v-if="autoComplete">
      <div class="predict" v-for="(data,index) in autoComplete" @click="fill(data)" :key="index">
        <div v-if="id === 'phone'" class="column">
          <div class="top">
            <span class="phone">{{data.phone | tel}}</span>
            <span class="time">{{data.lastDate | fromNow}}</span>
          </div>
          <span class="address">{{data.address}}</span>
        </div>
        <div v-else-if="id ==='address'" class="row">
          <span class="street">{{data.street}}</span>
          <span class="city">{{data.city}}</span>
        </div>
        <div v-else class="row">
          <span class="city">{{data}}</span>
        </div>
      </div>
    </dialog>
  </section>
</template>

<script>
export default {
  props: [
    "label",
    "value",
    "icon",
    "autoComplete",
    "duration",
    "distance",
    "id"
  ],
  methods: {
    setAnchor(e) {
      let dom = document.querySelector("input.active");
      dom && dom.classList.remove("active");

      e.currentTarget.classList.add("active");
      let caret = e.currentTarget.selectionStart;
      let target = e.currentTarget.id;
      this.$emit("focus", { target, caret });
    },
    input(e) {
      let value = e.target.value;
      let caret = e.currentTarget.selectionStart;
      let target = e.currentTarget.id;
      this.$emit("input", value);
      this.$emit("focus", { target, caret });
    },
    fill(data) {
      this.$emit("fill", data);
    }
  }
};
</script>

<style scoped>
section {
  display: inline-flex;
  flex-direction: column;
  position: relative;
}

input.active {
  border: 2px solid #02a7f2;
}

label {
  display: block;
  color: #333;
  font-weight: bold;
  text-indent: 5px;
  margin: 5px 0 2px 0;
  position: relative;
}

.field {
  position: relative;
  z-index: 1;
}

input {
  border: 2px solid #e5e5e5;
  padding: 5px;
  font-weight: bold;
  color: #3c3c3c;
  font-size: 1.25em;
  text-indent: 5px;
  width: 186px;
  outline: none;
}

.address input {
  width: 390px;
}

.note input {
  width: 594px;
}

dialog {
  min-width: 100%;
  border: 0px;
  display: block;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.4);
  top: 63px;
  z-index: 2;
}

.predict {
  padding: 0 5px;
}

.phone {
  min-width: 125px;
}

.predict > div {
  display: flex;
  position: relative;
}
.predict:nth-child(even) {
  background: #f5f5f5;
}
.column {
  flex-direction: column;
  min-height: 37px;
  padding: 5px 0;
}

.row {
  flex-direction: row;
  padding: 8px 5px;
}

.top {
  display: flex;
  flex-wrap: nowrap;
}

.time {
  flex: 1;
  text-align: right;
  white-space: nowrap;
  font-size: 0.8em;
  color: #455a64;
  font-family: "Microsoft YaHei";
}

.address {
  font-weight: bold;
  color: chocolate;
  white-space: nowrap;
}

span.street {
  flex: 1;
  color: chocolate;
}

.city {
  color: #9e9e9e;
  font-weight: normal;
}

.matrix {
  position: absolute;
  top: 3px;
  right: 0;
}

.matrix span {
  border: 2px solid #e5e5e5;
  border-bottom: 0;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  margin: 0 5px;
  padding: 2px 10px;
  color: #009688;
  background: #fff;
}

.predict:last-child div {
  border-bottom: none;
}

.slideUp-enter-active,
.slideUp-leave-active {
  transition: opacity 0.3s;
}

.slideUp-enter,
.slideUp-leave-active {
  opacity: 0;
}
</style>