<template>
    <div class="hibachi-grid">
        <div class="hibachi-seat" :class="[table.layout,table.orientation]" v-for="(table,index) in tables" :key="index">
            <span class="table-name">{{table.name}}</span>
            <span v-for="(seat,idx) in table.seats" :key="idx" :index="idx" class="seat" tag="span">{{seat.name}}</span>
        </div>
    </div>
</template>

<script>
export default {
  props: ["tables", "transfer"]
};
</script>

<style scoped>
.hibachi-grid {
  width: 637px;
  height: 700px;
  display: grid;
  grid-gap: 15px 5px;
  margin-top: -30px;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  justify-self: center;
  align-self: center;
}

.hibachi-seat {
  margin: 5px 10px;
  background: #b0bec5;
  display: grid;
  grid-gap: 4px;
  padding: 4px;
}
</style>