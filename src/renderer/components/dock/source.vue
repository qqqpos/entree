<template>
  <div class="source">
    <header>
      <h3>{{$t('title.thirdPartyTicket')}}</h3>
      <h5>{{$t('tip.thirdPartyProvider')}}</h5>
    </header>
    <ul v-if="providers.length">
      <li v-for="(provider,index) in providers" :key="index">
        <input type="radio" name="provider" v-model="service" :id="'provider'+index" :value="provider.name">
        <label :for="'provider'+index"><img :src="provider.img" :title="provider.name"></label>
      </li>
    </ul>
    <div v-else class="wrap">
      <div class="placeholder">
        <i class="far fa-comment-alt"></i>
        <p>There is no third party provider available.</p>
      </div>
    </div>
    <footer>
      <button class="btn" @click="init.reject">{{$t('button.cancel')}}</button>
      <button class="btn" :disabled="!service" @click="init.resolve(service)">{{$t('button.confirm')}}</button>
    </footer>
  </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      providers: [
        {
          index: 0,
          name: "GrubHub",
          enable: true,
          default: true,
          img: "static/image/provider/grubhub.png"
        },
        {
          index: 1,
          name: "Seamless",
          enable: true,
          default: false,
          img: "static/image/provider/seamless.png"
        },
        {
          index: 2,
          name: "Delivery",
          enable: true,
          default: false,
          img: "static/image/provider/delivery.png"
        },
        {
          index: 3,
          name: "Beyond Menu",
          enable: true,
          default: false,
          img: "static/image/provider/beyondmenu.png"
        },
        {
          index: 4,
          name: "Uber Eats",
          enable: true,
          default: false,
          img: "static/image/provider/ubereats.png"
        },
        {
          index: 5,
          name: "Eat Street",
          enable: true,
          default: false,
          img: "static/image/provider/eatstreet.png"
        },
        {
          index: 6,
          name: "Postmates",
          enable: true,
          default: false,
          img: "static/image/provider/postmates.png"
        },
        {
          index: 7,
          name: "Groupon",
          enable: true,
          default: false,
          img: "static/image/provider/groupon.png"
        },
        {
          index: 8,
          name: "QMenu",
          enable: true,
          default: false,
          img: "static/image/provider/qMenu.png"
        },
        {
          index: 9,
          name: "Takeout Waiter",
          enable: true,
          default: false,
          img: "static/image/provider/takeoutWaiter.png"
        }
      ],
      service: null
    };
  },
  created() {
    const { providers } = this.$store.getters.config;

    if (providers) {
      providers.forEach(provider => {
        const index = this.providers.findIndex(
          preset => preset.name === provider.name
        );

        index !== -1 && Object.assign(this.providers[index], provider);
      });

      this.providers = this.providers
        .filter(p => p.enable)
        .sort((a, b) => (a.index > b.index ? 1 : -1));
    }

    if (this.init.source !== "POS") {
      const source = this.providers.find(p => p.default);
      this.service = this.init.source || (source && source.name) || null;
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
  padding: 20px 0 15px;
  border-radius: 4px 4px 0 0;
}

h5 {
  font-weight: normal;
  color: #757575;
}

.wrap{
  height: 350px;
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