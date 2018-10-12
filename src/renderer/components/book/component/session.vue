<template>
    <div class="outer-wrap" ref="parent">
        <v-touch class="inner-wrap" :style="horizontalStyle" @panleft="horizontalPan" @panright="horizontalPan" @panstart="horizontalStart" @panend="horizontalEnd">
            <div class="session" v-for="(books,frame) of session" :key="frame">
                <div class="time text-center">{{hour + frame}}</div>
                <div class="books" ref="children">
                    <div class="content relative" v-for="(book,i) in books" :key="i" @click="$emit('select',book)" :title="book.note">
                        <i class="fas fa-user-slash no-show" v-if="book.status === 0"></i>
                        <i class="far fa-comment-dots note" v-show="book.note" v-else></i>
                        <h5>{{book.name}}</h5>
                        <h5 class="phone">{{book.phone | phone}}</h5>
                        <p>
                            <span><i class="far fa-clock space-right light"></i>{{book.time}}</span>
                            <span><i class="fas fa-users space-right light"></i>{{book.guest | count}}</span>
                        </p>
                    </div>
                </div>
            </div>
        </v-touch>
    </div>
</template>

<script>
export default {
  props: ["session", "unique", "hour"],
  data() {
    return {
      lastHorizontalDelta: 0,
      horizontal: 0
    };
  },
  filters: {
    count(array) {
      return array.reduce((a, c) => a + c, 0);
    }
  },
  computed: {
    horizontalStyle() {
      return { transform: `translate3d(${this.horizontal}px,0,0)` };
    }
  },
  methods: {
    horizontalPan(e) {
      this.horizontal = this.lastHorizontalDelta + e.deltaX;
    },
    horizontalStart(e) {
      const doms = document.querySelectorAll(".inner-wrap");
      doms.forEach(dom => dom.classList.add("block"));
    },
    horizontalEnd(e) {
      this.smooth(this.$refs.children);
      this.lastHorizontalDelta = this.horizontal;

      const doms = document.querySelectorAll(".block");
      doms.forEach(dom => dom.classList.remove("block"));
    },
    smooth(doms) {
      const target = document.querySelector(`#${this.unique}`);
      const overlay = doms.find(dom => util.isCollide(target, dom));

      if (overlay) {
        const overlap = Array.from(overlay.children)
          .reverse()
          .find(dom => util.isCollide(target, dom));

        if (overlap) {
          const { left: parentLeft } = document
            .querySelector(".outer-wrap")
            .getBoundingClientRect();

          const { left: overlayLeft } = overlap.getBoundingClientRect();
          const diffs = overlayLeft - parentLeft;

          util.ease({
            start: this.horizontal,
            end: this.horizontal - diffs + 10,
            progress: value => {
              this.horizontal = value;
            },
            done: () => {
              this.lastHorizontalDelta = this.horizontal;
            }
          });
        }
      } else {
        util.ease({
          start: this.horizontal,
          end: 0,
          progress: value => {
            this.horizontal = value;
          },
          done: () => {
            this.lastHorizontalDelta = 0;
          }
        });
      }
    }
  }
};
</script>

<style scoped>
.outer-wrap {
  width: 634px;
  overflow: hidden;
  margin-left: 60px;
}

.inner-wrap {
  display: flex;
  flex-wrap: nowrap;
  position: relative;
  width: 200%;
}

.block:after {
  content: " ";
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
  left: 0;
  top: 0;
}

.session {
  display: flex;
  flex-direction: column;
}

.books {
  display: flex;
  padding: 0 5px;
}

.content {
  padding: 8px;
  margin: 5px;
  width: 100px;
  background: #fff;
  border-radius: 4px;
  box-shadow: var(--shadow);
}

.session .time {
  background: #00bcd4;
  text-shadow: 0 1px 1px #333;
  box-shadow: 0 1px 1px #b0bec5;
  margin: 5px 2px 5px;
  border-radius: 4px;
  color: #fff;
}

.content p {
  display: flex;
  border-top: 1px solid #eee;
  margin-top: 3px;
  padding-top: 7px;
  font-size: 12px;
  text-align: left;
  justify-content: space-between;
}

.content h5 {
  text-align: left;
  height: 20px;
  line-height: 20px;
  text-transform: capitalize;
  color: #424242;
}

h5.phone {
  color: #607d8b;
  font-weight: normal;
}

.hourly:nth-child(even) .hour {
  background: #fafafa;
}

i.note,
.no-show {
  position: absolute;
  right: 3px;
  top: 3px;
  color: #ffa726;
}

.no-show {
  color: #ff5722;
}
</style>


