<template>
  <div class="evener">
    <i class="fa fa-2x fa-times" @click="init.reject(false)"></i>
    <div>
      <h3>{{$t('text.itemSplit')}}</h3>
      <h5>{{$t('tip.itemSplit')}}</h5>
      <div class="input">
        <button @click="qty--" :disabled="qty==2">-</button>
        <input type="text" v-model="qty">
        <button @click="qty++">+</button>
      </div>
      <div @click="init.resolve(qty)" class="confirm">{{$t('button.confirm')}}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      qty: this.init.qty
    };
  }
};
</script>

<style scoped>
.evener {
  position: absolute;
  left: 0px;
  top: 0;
  background: #fff;
  width: 250px;
  height: 490px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  z-index: 1;
}

h3 {
  margin-bottom: 10px;
}

h5 {
  margin-bottom: 35px;
  font-weight: normal;
}

.confirm {
  padding: 15px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  color: #333;
}
i {
  position: absolute;
  top: 0;
  right: 0;
  padding: 15px 20px;
  color: #F44336;
}

.input {
  margin: 25px 0 45px;
}

button {
  font-family: sans-serif;
  padding: 0.7rem;
  width: 3rem;
  font-size: 1.5rem;
  background: #f3f3f3;
  color: #888;
  border: 0 solid #dbdbdb;
  text-align: center;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
  cursor: pointer;
  outline: none;
}

input {
  width: 4rem;
  padding: 0.7rem;
  font-size: 1.5rem;
  border: 0;
  border-top: 0 solid #dbdbdb;
  border-bottom: 0 solid #dbdbdb;
  text-align: center;
  background: #cfd8dc;
}
</style>