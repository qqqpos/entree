<template>
    <transition class="fadeIn">
        <ul v-show="trend.length > 0">
            <li class="head">
                <h3 class="f1">{{$t('text.itemTrend')}}</h3>
                <i class="fa fa-sort" @click="reverse"></i>
            </li>
            <li class="stats" v-for="(item,index) in items" :key="index" @click="$emit('edit',item)">
                <h5 class="name">{{item[language] || item.usEN}}</h5>
                <div>
                    <progress :max="max" :value="item.count"></progress>
                    <span class="count">{{item.count}}</span>
                </div>
            </li>
            <li class="footer">
                <span class="total">{{$t('text.items',trend.length)}}</span>
                <div class="wrap">
                    <i class="fa fa-angle-left page" @click="prev"></i>
                    <i class="fa fa-angle-right page" @click="next"></i>
                </div>
            </li>
        </ul>
    </transition>

</template>

<script>
export default {
  data() {
    return {
      language: this.$store.getters.language,
      max: 100,
      page: 0,
      trend: []
    };
  },
  computed: {
    items() {
      const min = this.page * 17;
      const max = min + 17;

      return this.trend.slice(min, max);
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      const date = {
        from: +moment()
          .subtract(4, "hours")
          .startOf("month")
          .hours(4),
        to: +moment()
          .subtract(4, "hours")
          .endOf("month")
          .add(1, "days")
          .hours(3)
          .minutes(59)
          .seconds(59)
      };

      this.$socket.emit("[TREND] ITEM", date, results => {
        this.max = results.reduce((a, c) => Math.max(a, c.count), 0);
        this.trend = results;
      });
    },
    reverse() {
      this.page = 0;
      this.trend.reverse();
    },
    prev() {
      if (this.page === 0) return;
      this.page--;
    },
    next() {
      const pages = Math.floor(this.trend.length / 17);
      if (this.page === pages) return;
      this.page++;
    }
  }
};
</script>

<style scoped>
ul {
  margin: 4px 2px 0 0;
  border: 1px solid #78909c;
  background: #fff;
}

li.head {
  display: flex;
  border-bottom: 1px solid #eee;
  align-items: center;
  text-indent: 10px;
  background: #f5f5f5;
}

.head i {
  cursor: pointer;
  padding: 12px 20px;
}

li.stats {
  padding: 5px 5px 0 10px;
}

li.stats:hover {
  background: #f5f5f5;
  cursor: pointer;
}

h5.name {
  height: 15px;
}

progress {
  border: 1px solid transparent;
  width: 200px;
}

::-webkit-progress-value {
  background-image: -webkit-linear-gradient(
      -45deg,
      transparent 33%,
      rgba(0, 0, 0, 0.1) 33%,
      rgba(0, 0, 0, 0.1) 66%,
      transparent 66%
    ),
    -webkit-linear-gradient(top, rgba(255, 255, 255, 0.25), rgba(0, 0, 0, 0.25)),
    -webkit-linear-gradient(left, #09c, #f44);
  transition: 0.3s ease-out;
  border-radius: 4px;
  background-size: 35px 20px, 100% 100%, 100% 100%;
}

::-webkit-progress-bar {
  background: transparent;
}

li.footer {
  display: flex;
  align-items: center;
  height: 43px;
}

.page {
  cursor: pointer;
  padding: 10px 16px;
}

.total {
  margin: 0 10px;
  flex: 1;
}

.count {
  float: right;
}

.wrap {
  display: flex;
  justify-content: center;
}

.wrap i {
  background: linear-gradient(to bottom, #fff 0%, #e5e5e5 100%);
  margin: 0 2px;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  cursor: pointer;
}
</style>