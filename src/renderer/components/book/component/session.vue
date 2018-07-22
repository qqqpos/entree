<template>
    <div class="outer-wrap" ref="parent">
        <v-touch class="inner-wrap" :style="horizontalStyle" @panleft="horizontalPan" @panright="horizontalPan" @panstart="horizontalStart" @panend="horizontalEnd">
            <div class="session" v-for="(books,frame) of session" :key="frame">
                <div class="time">{{hour + frame}}</div>
                <div class="books" ref="children">
                    <div class="details" v-for="(book,i) in books" :key="i">
                        <h5>{{book.name}}</h5>
                        <h5 class="phone">{{book.phone | phone}}</h5>
                        <p>
                            <span><i class="far fa-clock space light"></i>{{book.time}}</span>
                            <span><i class="fas fa-users space light"></i>{{book.guest | count}}</span>
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
    horizontalStart() {},
    horizontalEnd(e) {
      this.smooth(this.$refs.children);
      this.lastHorizontalDelta = this.horizontal;
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
            end: this.horizontal - diffs + 5,
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
  width: 200%;
}

.session {
  display: flex;
  flex-direction: column;
}

.books {
  display: flex;
  padding: 0 5px;
}

.details {
  padding: 8px;
  margin: 5px;
  width: 100px;
  background: #fff;
  border-radius: 4px;
  box-shadow: var(--shadow);
}

.session .time {
  background: #00bcd4;
  box-shadow: 0 1px 1px rgba(8, 138, 126, 0.92);
  margin: 5px 2px 5px;
  border-radius: 10px;
  color: #fff;
}

.details p {
  display: flex;
  border-top: 1px solid #eee;
  margin-top: 3px;
  padding-top: 7px;
  font-size: 12px;
  text-align: left;
  justify-content: space-between;
}

.details h5 {
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
</style>


