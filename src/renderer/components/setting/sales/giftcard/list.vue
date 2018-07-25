<template>
    <div>
        <header class="nav">
            <div class="title">
                <h3>{{$t('text.giftCard')}}</h3>
            </div>
            <nav>
                <span>{{$t('button.search')}}</span>
            </nav>
        </header>
        <ul>
            <li v-for="(giftcard,index) in giftcards" :key="index">
                <div class="f1">
                    <h4>{{giftcard.number | card}}</h4>
                    <h5>$ {{giftcard.balance | decimal}}</h5>
                </div>
                <span class="time">{{giftcard.time | fromNow}}</span>
                <i class="fa fa-caret-right" @click="$emit('set',giftcard)"></i>
            </li>
            <li v-if="total > 14" class="footer">
                <p>
                <span>{{$t('text.totalGiftCard')}}</span>
                <span>{{total}}</span>
                </p>
                <div class="mini-paginator">
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
    </div>
</template>

<script>
export default {
  data() {
    return {
      giftcards: [],
      totalPage: 0,
      total: 0,
      page: 0
    };
  },
  beforeRouteEnter: (to, from, next) => {
    appSocket.emit("[GIFTCARD] COUNT", total => {
      appSocket.emit("[GIFTCARD] LIST", 0, giftcards => {
        next(vm => {
          vm.total = total;
          vm.giftcards = giftcards;
          vm.totalPage = Math.ceil(total / 14);
        });
      });
    });
  },
  methods: {
    prev() {
      this.page = this.page > 0 ? this.page - 1 : this.page;
    },
    next() {
      this.page = this.page !== this.totalPage ? this.page + 1 : this.page;
    },
    fetch(page) {
      this.$socket.emit("[GIFTCARD] LIST", page, giftcards => {
        this.giftcards = giftcards;
      });
    }
  },
  watch: {
    page: "fetch"
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


