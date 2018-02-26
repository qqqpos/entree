<template>
  <div class="popupMask center dark" @click.self="init.reject">
    <div class="window">
      <header class="title">
        <span>{{$t('title.seatList')}}</span>
        <i class="fa fa-times" @click="init.reject"></i>
      </header>
      <div class="inner">
        <div class="btn" v-for="(guest,index) in init.guest" @click="set(guest)" :class="{active:guest === init.current}" :key="index">{{guest}}</div>
      </div>
      <footer>
        <button class="btn" @click="split">{{$t('button.split')}}</button>
        <button class="btn">{{$t('button.prevPage')}}</button>
        <button class="btn">{{$t('button.nextPage')}}</button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  props: ['init'],
  data() {
    return {
      page: 0
    }
  },
  methods: {
    set(guest) {
      this.init.resolve({ guest })
    },
    split() {
      this.init.resolve({ component: "split" })
    }
  }
}
</script>

<style scoped>
.inner {
  width: 400px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
}

.inner div {
  margin: 5px;
}

footer button {
  flex: 1;
  margin: 5px;
}

.active {
  background: linear-gradient(#4FC3F7, #039BE5);
  color: #fafafa;
  text-shadow: 0 1px 1px black;
  box-shadow: 0 1px 3px rgb(144, 164, 174);
}
</style>
