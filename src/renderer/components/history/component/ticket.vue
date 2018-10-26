<template>
  <div class="ticket column" :data-number="invoice.number" @click="setViewOrder(invoice)" :class="{void:invoice.status === 0,settled:invoice.settled,split:invoice.split}">
    <span class="type" v-if="invoice.type ==='DELIVERY'">{{$t('type.'+invoice.type)}}
      <b>{{invoice.driver}}</b>
    </span>
    <span class="type" v-else>{{$t('type.'+invoice.type)}}</span>
    <div class="info column" v-if="invoice.type ==='DELIVERY'">
      <span>{{invoice.customer.phone | phone}}</span>
      <span class="data">{{invoice.customer.address}}</span>
    </div>
    <span class="info" v-else-if="invoice.type === 'DINE_IN' || invoice.type === 'HIBACHI' || invoice.type === 'BAR'">{{invoice.table}}</span>
    <div class="info" v-else>
      <span>{{invoice.customer.phone | phone}}</span>
      <span class="data">{{invoice.customer.name}}</span>
    </div>
    <span class="note" v-if="invoice.status === 0">{{$t('reason.'+invoice.void.note,(invoice.void.join || ""))}}</span>
    <span class="note discount" v-else-if="discountTag && invoice.payment.discount > 0">{{invoice.coupons[0] ? invoice.coupons[0].alias : '$ ' + invoice.payment.discount + ' OFF'}}</span>
    <span class="agency price prefix">{{invoice.payment.due | decimal}}</span>
    <span class="modified" v-if="invoice.modify" @click.self="$emit('recall',invoice._id)"></span>
  </div>
</template>


<script>
import { mapGetters, mapActions } from "vuex";

export default {
  props: ["invoice", "discountTag"],
  methods: {
    ...mapActions(["setViewOrder"])
  }
};
</script>

<style scoped>
.ticket {
  background: #fff;
  position: relative;
  color: #3c3c3c;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
}

.ticket:before {
  position: absolute;
  top: -6px;
  left: -5px;
  content: attr(data-number);
  min-width: 37px;
  height: 32px;
  color: #fff;
  text-align: center;
  line-height: 32px;
  background: #03a9f4;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  font-family: "Agency FB";
  font-size: 30px;
  border-radius: 4px;
}

.type {
  padding: 4px 0;
  font-size: 1.5vw;
  margin-left: 34px;
}

.info {
  flex: 1;
  color: gray;
  display: flex;
  font-size: 1.5vw;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.data {
  max-width: 119px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.price {
  text-align: center;
  font-size: 20px;
}

.ticket.active {
  background: #03a9f4;
  color: #fff;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.54);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
}

.active:before {
  background: #607d8b;
}

.void:before {
  background: red;
}

.active .info {
  border-color: #90caf9;
  color: #fff;
}

.note {
  text-align: center;
  color: #f44336;
  background: #ffcdd2;
  position: absolute;
  width: 100%;
  bottom: 22px;
  text-shadow: none;
  z-index: 1;
}

.note.discount {
  color: #ff5722;
  background: antiquewhite;
}

.active.void {
  background: #f44336;
}

.split:after {
  bottom: 0;
  right: 0px;
  width: 25px;
  height: 25px;
  content: " ";
  position: absolute;
  background: url(../../../assets/image/corner.png) transparent;
}

.split.active:after {
  transition: border-width 0.15s ease-in, opacity 0ms ease-in 0ms;
  border-color: transparent #fff #fff transparent;
  border-radius: 4px 0 0 0px;
  border-style: solid;
  position: absolute;
  background: #6fc1e6;
  height: 0;
  width: 0;
  right: 0;
  bottom: 0;
  opacity: 1;
  border-width: 8px;
  content: " ";
  display: block;
}

.settled:before {
  background: #ff9800;
}

b {
  float: right;
  padding: 0 5px;
  font-weight: bold;
}

.modified {
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 6px 10px;
}

.modified:after {
  content: " ";
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-clip: padding-box;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.39);
  background: linear-gradient(#ffcc80, #f57c00);
}
</style>