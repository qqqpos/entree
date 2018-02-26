<template>
  <div class="popupMask center dark" @dblclick.self="exit">
    <div class="dialog" :class="[init.type,loader]">
      <header class="progress" :style="bar"></header>
      <i class="fa"></i>
      <h3>{{title}}</h3>
      <h5>{{msg}}</h5>
      <footer>
        <div class="btn" v-for="(button,index) in init.buttons" @click="trigger(button,$event)" :key="index">{{$t(button.text)}}</div>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: ["init"],
  data() {
    return {
      loader: "",
      title: "",
      msg: "",
      bar: null,
      pct: 90,
      step: 0
    };
  },
  created() {
    this.initial();
  },
  methods: {
    initial() {
      this.title =
        typeof this.init.title === "string"
          ? this.$t(this.init.title)
          : this.$t(...this.init.title);
      this.msg =
        typeof this.init.msg === "string"
          ? this.$t(this.init.msg)
          : this.$t(...this.init.msg);
      if (this.init.timeout) {
        this.timeout = setTimeout(() => {
          typeof this.init.timeout.fn === "function"
            ? this.init.timeout.fn()
            : eval(this.init.timeout.fn);
        }, this.init.timeout.duration);
        this.loader = "loader";
        this.step = 90 / (this.init.timeout.duration / 1000);
        this.bar = {
          transform: `translate3d(-100%,0,0)`
        };
      }
    },
    trigger(button, e) {
      button.load && e.currentTarget.classList.add("loading");
      clearTimeout(this.timeout);
      typeof button.fn === "function" ? button.fn() : eval(button.fn);
    },
    exit() {
      clearTimeout(this.timeout);
      this.init.resolve() || this.$parent.$q();
    }
  },
  computed: {
    ...mapGetters(["time"])
  },
  watch: {
    "init.title"(n) {
      this.initial();
    },
    time(n) {
      if (this.init.timeout && this.pct > 0) {
        this.pct = this.pct - this.step;
        this.bar = { transform: `translate3d(${-this.pct}%,0,0)` };
      }
    }
  }
};
</script>

<style scoped>
.dialog {
  width: 550px;
  height: 320px;
  background: #fff;
  position: relative;
  text-align: center;
  overflow: hidden;
}

.progress {
  width: 100%;
  height: 2px;
  position: relative;
  transition: transform 1s ease;
}

.progress:after {
  position: absolute;
  right: 0;
  top: -7px;
  width: 50px;
  height: 2px;
  content: " ";
  z-index: 0;
  transform: rotate(3deg) translate(0, 4px);
}

.loader:after {
  width: 18px;
  height: 18px;
  box-sizing: border-box;
  border: 2px solid transparent;
  border-radius: 50%;
  position: absolute;
  top: 10px;
  right: 10px;
  content: " ";
  animation: spinner 400ms linear infinite;
}

.alert .progress {
  background: #ff9800;
}

.alert .progress:after {
  box-shadow: 0 0 10px #ef6c00, 0 0 7px #fb8c00;
}

.alert.loader:after {
  border-top-color: #ff9800;
  border-left-color: #ff9800;
}

.warning .progress {
  background: #f44336;
}

.warning .progress:after {
  box-shadow: 0 0px 10px #f44336, 0 0 7px #e64a19;
}

.warning.loader:after {
  border-top-color: #f44336;
  border-left-color: #f44336;
}

.dialog.success {
  border-top: 2px solid #13ce66;
}

.dialog.question {
  border-top: 2px solid #8bc34a;
}

.dialog.info {
  border-top: 2px solid #ffa726;
}

.dialog.error {
  border-top: 2px solid #f51900;
}

i.fa {
  font-size: 96px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
  margin: 20px 0 35px;
}

.alert i::before {
  content: "\F06a";
  color: #ffca28;
}

.question i::before {
  content: "\F059";
  color: #8bc34a;
}

.warning i::before {
  content: "\F071";
  color: #f44336;
}

.success i::before {
  content: "\F05d";
  color: #13ce66;
}

.info i::before {
  content: "\F05a";
  color: #ffa726;
}

.error i::before {
  content: "\f12a";
  color: #f51900;
}

footer {
  background: #f5f5f5;
  display: flex;
  position: absolute;
  bottom: 0;
  width: 100%;
}

footer .btn {
  flex: 1;
  margin: 10px;
  font-size: initial;
}

h3 {
  font-size: 32px;
  color: #333;
  text-shadow: none;
}

h5 {
  color: #666;
  margin-top: 5px;
  font-size: 13.3px;
  text-shadow: none;
  font-weight: normal;
}

.btn.loading {
  text-shadow: none;
  color: transparent !important;
  position: relative;
}

.btn.loading:before {
  position: absolute;
  left: 0;
  right: 0;
  margin: auto;
  border: 4px solid;
  border-color: lightgray #5d5b5b #5d5b5b #5d5b5b;
  box-shadow: 0 1px 1px #fff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  content: " ";
  animation: spinner 1.2s cubic-bezier(0.465, 0.183, 0.153, 0.946) infinite;
}

@keyframes spinner {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
