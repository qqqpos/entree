<template>
  <div>
    <header class="nav">
      <div class="title">
        <h5></h5>
        <h3>{{$t("title.addressList")}}</h3>
      </div>
      <nav>
        <span class="add" @click="create">{{$t('button.new')}}</span>
      </nav>
    </header>
    <ul>
      <li v-for="(address,index) in addresses" :key="index">
        <div class="f1">
          <h4>{{address.street}}</h4>
          <h5>{{address.city}}</h5>
        </div>
        <span class="time">{{address.zipCode}}</span>
        <i class="fa fa-caret-right" @click="$emit('set',address)"></i>
      </li>
      <li v-if="total > 14" class="footer">
        <p>
          <span>{{$t('text.totalAddress')}}</span>
          <span>{{total}}</span>
        </p>
        <div class="fliper">
          <i class="fa fa-angle-left" @click="prev"></i>
          <div>
            <span>{{page + 1}}</span>
            <span class="slash">/</span>
            <span>{{totalPage}}</span>
          </div>
          <i class="fa fa-angle-right" @click="next"></i>
        </div>
      </li>
    </ul>
    <div :is="component" :init="componentData"></div>
  </div>
</template>

<script>
import editor from "../component/addressEditor";

export default {
  props: ["total", "addresses"],
  components: { editor },
  computed: {
    totalPage() {
      return Math.ceil(this.total / 14);
    }
  },
  data() {
    return {
      componentData: null,
      component: null,
      page: 0
    };
  },
  methods: {
    create() {
      new Promise((resolve, reject) => {
        this.componentData = { resolve, reject };
        this.component = "editor"
      }).then(_address => {
        this.$socket.emit("[ADDRESS] SAVE", _address, callback => {
          this.$emit("reset");
          this.$emit("refresh");
          this.$q();
        })
      }).catch(() => this.$q());
    },
    prev() {
      if (this.page === 0) return;
      this.page--;
      this.$emit("update", this.page);
    },
    next() {
      if (this.page === this.totalPage - 1) return;
      this.page++;
      this.$emit("update", this.page);
    }
  }
};
</script>

<style scoped>
li {
  height: 40px;
  display: flex;
  padding-left: 20px;
  align-items: center;
  text-transform: capitalize;
  border-bottom: 1px solid #eee;
}

h5 {
  font-weight: normal;
  color: #656565;
}

i {
  margin: 0 10px;
  padding: 10px 25px;
  color: #555;
  cursor: pointer;
  border-radius: 4px;
}

i:active {
  background: #eee;
}

.time {
  font-size: 14px;
  color: #9e9e9e;
}
</style>