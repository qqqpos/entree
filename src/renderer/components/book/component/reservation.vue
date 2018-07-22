<template>
    <div class="books-outer-wrap">
      <div class="books-inner-wrap" :style="verticalStyle" ref="dom">
          <div v-for="(session,hour,index) in schedule" :key="index" class="hourly">
            <div class="hour" :id="'bk'+index">{{hour+":00"}}</div>
            <hourly-session :hour="hour" :unique="'bk'+index" :session="session"></hourly-session>
        </div>
      </div>
        <v-touch id="slider" @panup="verticalPan" @pandown="verticalPan" @panstart="panstart" @panend="panend"></v-touch>
    </div>
</template>

<script>
import hourlySession from "./session";

export default {
  props: ["books"],
  components: { hourlySession },
  data() {
    return {
      schedule: {},
      vertical: 0,
      lastVerticalDelta: 0
    };
  },
  methods: {
    initial(data) {
      const hours = {};

      data.forEach(book => {
        const { timestamp } = book;
        const time = moment(timestamp).format("HH");
        const session = this.sessionize(timestamp);

        if (hours[time]) {
          hours[time][session]
            ? hours[time][session].push(book)
            : (hours[time][session] = [book]);
        } else {
          hours[time] = {
            [session]: [book]
          };
        }
      });
      this.schedule = hours;
    },
    sessionize(timestamp) {
      const time = parseInt(moment(timestamp).format("mm"));

      if (time < 15) {
        return ":00";
      } else if (time >= 15 && time < 30) {
        return ":15";
      } else if (time >= 30 && time < 45) {
        return ":30";
      } else {
        return ":45";
      }
    },
    verticalPan(e) {
      this.vertical = this.lastVerticalDelta + e.deltaY;
    },
    panstart() {},
    panend() {
      this.smooth(this.$refs.dom.children);
      this.lastVerticalDelta = this.vertical;
    },
    smooth(doms) {
      const parent = document.querySelector(`.detail header`);
      const overlay = Array.from(doms)
        .reverse()
        .find(dom => util.isCollide(parent, dom));
      if (overlay) {
        const {
          top: parentTop,
          height: parentHeight
        } = parent.getBoundingClientRect();

        const {
          top: overlayTop,
          height: overlayHeight
        } = overlay.getBoundingClientRect();

        const diffs = this.vertical + overlayHeight - overlayTop + 5;

        util.ease({
          start: this.vertical,
          end: diffs,
          progress: value => {
            this.vertical = value;
          },
          done: () => {
            this.lastVerticalDelta = this.vertical;
          }
        });
      } else {
        util.ease({
          start: this.vertical,
          end: 0,
          progress: value => {
            this.vertical = value;
          },
          done: () => {
            this.lastVerticalDelta = 0;
            this.vertical = 0;
          }
        });
      }
    }
  },
  watch: {
    books: {
      immediate: true,
      handler: "initial"
    }
  },
  computed: {
    verticalStyle() {
      return { transform: `translate3d(0,${this.vertical}px,0)` };
    }
  }
};
</script>

<style scoped>
.books-outer-wrap {
  position: relative;
  overflow: hidden;
}

.books-inner-wrap {
}

.hourly {
  height: 118.5px;
  display: flex;
  width: 694px;
  overflow: hidden;
  position: relative;
}

.hour {
  display: flex;
  width: 60px;
  align-items: center;
  justify-content: center;
  background: #fff;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  box-shadow: inset 2px 0px 6px -6px, inset -3px 0 6px -5px;
}

#slider {
  position: absolute;
  top: 0;
  left: 0;
  width: 60px;
  height: 593px;
}
</style>

