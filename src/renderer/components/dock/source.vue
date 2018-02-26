<template>
  <div class="source">
    <header>
      <h3>{{$t('title.thirdPartyOrder')}}</h3>
      <h5>{{$t('tip.thirdPartyProvider')}}</h5>
    </header>
    <ul>
      <li v-for="(provider,index) in providers" :key="index">
        <input type="radio" name="provider" v-model="service" :id="'provider'+index" :value="provider.name">
        <label :for="'provider'+index"><img :src="provider.img"></label>
      </li>
    </ul>
    <footer>
      <button class="btn" @click="init.reject">{{$t('button.cancel')}}</button>
      <button class="btn" :disabled="!service" @click="confirm">{{$t('button.confirm')}}</button>
    </footer>
  </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      providers: [
        { name: "GrubHub", img: "static/image/provider/grubhub.png" },
        { name: "Seamless", img: "static/image/provider/seamless.png" },
        { name: "Eat 24", img: "static/image/provider/eat24.png" },
        {
          name: "BeyondMenu",
          img: "static/image/provider/beyondmenu.png"
        },
        { name: "Uber Eats", img: "static/image/provider/ubereats.png" },
        { name: "EatStreet", img: "static/image/provider/eatstreet.png" },
        { name: "Postmates", img: "static/image/provider/postmates.png" }
      ],
      service: null
    };
  },
  created() {
    this.init.source !== "POS" && (this.service = this.init.source);
  },
  methods: {
    confirm() {
      this.init.resolve(this.service);
    }
  }
};
</script>

<style scoped>
.source {
  width: 740px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  text-align: center;
  background: #f8f8f8;
}
.source header {
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 25px 0 15px;
  border-radius: 4px 4px 0 0;
}

h5 {
  font-weight: normal;
  color: #757575;
}

ul {
  display: flex;
  flex-wrap: wrap;
  margin: 25px;
  justify-content: center;
}

.source img {
  height: 65px;
  width: 100px;
  padding: 30px;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

label {
  display: block;
  cursor: pointer;
  border: 2px solid transparent;
}

input:checked + label {
  border: 2px solid #eee;
  border-radius: 6px;
  background: #fff;
}

footer {
  background: #eee;
  border-top: 1px solid #eee;
  display: flex;
}

footer .btn {
  flex: 1;
  font-size: initial;
}
</style>