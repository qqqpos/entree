<template>
  <div>
    <div class="tab-content">
      <header class="nav">
        <h3 class="title">{{$t('setting.title.thirdParty')}}</h3>
        <nav>
          <button @click="addProvider" class="mini-btn" :disabled="true">{{$t('button.create')}}</button>
        </nav>
      </header>
      <slick-list axis="y" v-model="providers" class="providers" :useDragHandle="true">
        <slick-item v-for="(provider,index) in providers" :key="index" :index="index" class="provider row flex-center" @click.native.self="setDefault(provider)">
          <checkbox v-model="provider.enable" title="text.enable"></checkbox>
          <img :src="provider.img">
          <span class="f1">{{provider.name}}</span>
          <span class="default">
            <template v-if="provider.default">
              <i class="fas fa-check-circle"></i>
              <span>{{$t('button.default')}}</span>
            </template>
          </span>
          <i class="fas fa-bars clickable ghost" v-handle></i>
        </slick-item>
      </slick-list>
    </div>
  </div>
</template>

<script>
import {
  SlickList,
  SlickItem,
  ElementMixin,
  HandleDirective
} from "vue-slicksort";
import checkbox from "../common/checkbox";

export default {
  components: { checkbox, SlickList, SlickItem },
  directives: { handle: HandleDirective },
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
      ]
    };
  },
  created() {
    if (Array.isArray(this.$store.getters.config.providers)) {
      this.$store.getters.config.providers.forEach(provider => {
        const index = this.providers.findIndex(p => p.name === provider.name);

        index !== -1 && Object.assign(this.providers[index], provider);
      });

      this.providers.sort((a, b) => (a.index > b.index ? 1 : -1));
    }
  },
  beforeDestroy() {
    const providers = this.providers.map((provider, index) => ({
      index,
      name: provider.name,
      enable: provider.enable || false,
      default: provider.default || false
    }));

    this.$socket.emit("[CONFIG] UPDATE", {
      key: "providers",
      value: providers
    });
  },
  methods: {
    addProvider() {},
    setDefault(provider) {
      this.providers.forEach(p => {
        p.default = false;
      });
      Object.assign(provider, { default: true });
    }
  }
};
</script>

<style scoped>
.providers {
  max-height: 671px;
  overflow: auto;
}

.provider {
  height: 50px;
  background: #fff;
  padding: 5px 10px;
  box-shadow: 0 6px 8px rgba(102, 119, 136, 0.03),
    0 1px 2px rgba(102, 119, 136, 0.3);
}

.fa-bars {
  padding: 5px 10px;
}

.default {
  width: 80px;
  padding-right: 20px;
  text-align: center;
  color: #009688;
}

.f1 {
  margin-left: 15px;
}

img {
  width: 55px;
}
</style>
