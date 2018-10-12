<template>
    <div class="popupMask dark center setting">
        <div class="scan column flex-center">
            <div class="relative">
              <i class="fas fa-barcode light"></i>
              <span class="line"></span>
            </div>
            <h3>{{$t('inventory.dialog.readyToScan')}}</h3>
            <h5 class="normal light">{{message}}</h5>
            <footer class="row">
                <button class="btn f1" @click="init.reject(false)">{{$t('button.cancel')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      message: this.$t("inventory.tip.scanProduct"),
      buffer: ""
    };
  },
  created() {
    window.addEventListener("keydown", this.reader, false);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.reader, false);
  },
  methods: {
    reader(e) {
      e.preventDefault();
      clearTimeout(this.timeout);

      this.timeout = setTimeout(() => {
        this.buffer = "";
      }, 200);

      if (e.key.length === 1) this.buffer += e.key;

      e.key === "Enter" && this.init.resolve(this.buffer);
    }
  }
};
</script>

<style scoped>
.scan {
  background: #f6f6f6;
  border-radius: 6px;
  width: 375px;
  box-shadow: var(--shadow);
}

i {
  font-size: 7em;
}

footer {
  background: #eee;
  margin-top: 15px;
  width: 100%;
}

footer button {
  margin: 10px;
}

.line {
  position: absolute;
  height: 105px;
  width: 3px;
  background: rgba(255, 152, 0, 0.5);
  top: 5px;
  left: -10px;
  border-radius: 10px;
  box-shadow: 0 5px 24px rgba(255, 152, 0, 0.75);
  animation: scan 1.5s ease-out infinite forwards;
}

@keyframes scan {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  25% {
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(150px);
  }
}
</style>


