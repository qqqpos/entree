<template>
  <div class="pagination" v-show="totalPage > 1">
    <div class="page direction" @click="prev">
      <i class="fa fa-angle-left"></i>
    </div>
    <template v-if="style==='full'">
      <div class="page" v-for="i in pages" :key="i" :class="{active:i === page}" @click="setPage(i)">{{i}}</div>
    </template>
    <template v-else-if="style==='side'">
      <div class="page" v-for="i in first(pages)" :key="i" :class="{active:i === page}" @click="setPage(i)">{{i}}</div>
      <div>......</div>
      <div class="page" v-for="i in last(pages)" :key="i" :class="{active:i === page}" @click="setPage(i)">{{i}}</div>
    </template>
    <template v-else-if="style==='end'">
      <div class="page" @click="setPage(1)">1</div>
      <div>......</div>
      <div class="page" v-for="i in rear(pages)" :key="i" :class="{active:i === page}" @click="setPage(i)">{{i}}</div>
    </template>
    <template v-else>
      <div class="page" @click="setPage(1)">1</div>
      <div>......</div>
      <div class="page" v-for="i in middle(pages)" :key="i" :class="{active:i === page}" @click="setPage(i)">{{i}}</div>
      <div>......</div>
      <div class="page" v-for="i in last(pages)" :key="i" :class="{active:i === page}" @click="setPage(i)">{{i}}</div>
    </template>
    <div class="page direction" @click="next">
      <i class="fa fa-angle-right"></i>
    </div>
  </div>
</template>

<script>
export default {
  props: ["of", "contain", "max"],
  data() {
    return {
      pages: [],
      page: 1,
      style: "full"
    };
  },
  created() {
    this.format(this.page);
  },
  methods: {
    first(pages) {
      const min = 0;
      const max = 10;
      return pages.slice(min, max);
    },
    last(pages) {
      const length = pages.length - 1;
      return pages.slice(length - 1, length);
    },
    middle(pages) {
      const page = this.page;
      const min = page - 4;
      const max = page + 4;
      return pages.slice(min, max);
    },
    rear(pages) {
      const max = this.pages.length;
      const min = max - 10;
      return pages.slice(min, max);
    },
    format(page) {
      let array;
      this.pages = [...Array(this.totalPage).keys()].map((e, i) => i + 1);

      if (this.totalPage <= this.max) {
        this.style = "full";
      } else if (page <= 6) {
        this.style = "side";
      } else if (page > this.totalPage - 6) {
        this.style = "end";
      } else {
        this.style = "middle";
      }
    },
    setPage(number) {
      this.$emit("page", number - 1);
      this.page = number;
      this.format(number);
    },
    prev() {
      this.page > 1 && this.setPage(--this.page);
    },
    next() {
      this.page < this.totalPage && this.setPage(++this.page);
    }
  },
  computed: {
    totalPage() {
      return Math.ceil(this.of.length / this.contain);
    }
  },
  watch: {
    of() {
      this.page = 1;
      this.format(0);
    }
  }
};
</script>

<style scoped>
.pagination {
  justify-content: center;
  align-items: center;
  display: flex;
}

.pagination .page {
  margin: 5px;
  flex: 1;
  max-width: 35px;
  text-align: center;
  cursor: pointer;
  padding: 10px 10px;
  border-radius: 4px;
  text-shadow: 0 1px 1px #fff;
  background: linear-gradient(#fefefe, #cfd0d3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
}

.page.active {
  font-weight: bold;
  background: #676767;
  color: #fff;
  text-shadow: 0 1px 1px #000;
  box-shadow: rgba(0, 0, 0, 0.75) 0 0 0 0 inset;
}
</style>