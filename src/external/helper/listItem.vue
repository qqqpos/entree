<template>
  <li class="item" :class="{disable:$route.name === 'Menu' && (item.split || item.pending)}">
    <div class="main">
      <span class="itemQty">{{item.qty}}</span>
      <div class="wrap">
        <span class="name">{{item[language]}}</span>
        <span class="side">{{item.side[language]}}</span>
      </div>
      <span class="price">{{item.total | decimal}}</span>
    </div>
    <div class="sub" v-for="(set,index) in item.choiceSet" :key="index">
      <span class="itemQty" :class="{hide:set.qty === 1}">{{set.qty}}</span>
      <span class="item">{{set[language]}}</span>
      <span class="price" :class="{hide:parseFloat(set.price) === 0}">({{set.price | decimal}})</span>
    </div>
  </li>
</template>

<script>
export default {
  props: ["item"],
  filters: {
    decimal(value) {
      return /^-?[\d.]+(?:e-?\d+)?$/.test(value)
        ? parseFloat(value).toFixed(2)
        : value;
    }
  },
  data() {
    return {
      language: "usEN"
    };
  }
};
</script>

<style scoped>
li {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-bottom: 1px solid #ddd;
  background: #fff;
  padding: 10px 5px 10px 0;
}

.main,
.sub {
  display: flex;
  position: relative;
}

.itemQty {
  width: 35px;
  text-align: center;
}

.main .wrap {
  flex: 1;
  display: flex;
  max-width: 251px;
  margin-right: 5px;
}

.sub .item {
  color: #666;
  max-width: 245px;
}

.sub .item:before {
  content: "·";
  color: rgba(154, 154, 154, 0.5);
  padding: 0 2px;
}

.sub.target {
  background: #bcaaa4;
  border-radius: 2px;
  color: #fff;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.8);
}

.sub .price {
  min-width: 35px;
  padding-left: 4px;
  color: darkgray;
}

.sub.target .item,
.active .sub .item,
.active .price,
.target .price {
  color: #fff;
}

.side {
  color: #666;
  margin-left: 3px;
  position: relative;
}

.active {
  background: #a1887f;
  color: #fff;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.8);
}

.active .side {
  color: #fff;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.8);
}

.item.print .price {
  visibility: hidden;
}

.item.print:after {
  content: "\F04C";
  font-family: fontAwesome;
  font-weight: 600;
  position: absolute;
  right: 10px;
  color: #ff9800;
}

.item.print.pending:after {
  content: "\f017";
}

.item.print.pending {
  background: #eceff1;
  border-bottom: 1px dashed #ddd;
}

.hide {
  visibility: hidden;
}

.price.hide {
  display: none;
}

.todo {
  height: 18px;
}

li.disable {
  opacity: 0.75;
  background: #fafafa;
  color: #9e9e9e;
  border-bottom: 1px dashed #ddd;
  pointer-events: none;
}

li.disable .side {
  color: #9e9e9e;
}

.splitor {
  position: absolute;
  right: 50px;
  top: -9px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.44);
  border-radius: 4px;
  cursor: pointer;
  display: none;
  color: #fff;
  box-shadow: 0 1px 1px #735448;
}

.active .splitor {
  display: inline-block;
}
</style>