<template>
    <div class="relative">
        <div class="details relative" @click="toggle">
            <span class="date">{{record.date}}</span>
            <span class="f1">{{record.note}}</span>
            <span class="decimal">$ {{record.actual | decimal}}</span>
            <i class="fas fa-angle-down"></i>
        </div>
        <div v-if="display" class="credential column">
            <img :src="credential.image">
            <div class="info">
                <div class="row">
                    <div class="f2">
                        <h5>{{$t('text.cashDrawer')}}</h5>
                        <span>{{record.cashDrawer}}</span>
                    </div>                    
                    <div class="f1">
                        <h5>{{$t('text.time')}}</h5>
                        <span>{{record.time | moment('HH:mm:ss')}}</span>
                    </div>
                    <div class="f1">
                        <h5>{{$t('text.cashier')}}</h5>
                        <span>{{record.cashier}}</span>
                    </div>
                    <div class="f1">
                        <h5>{{$t('text.receiver')}}</h5>
                        <span>{{record.receiver}}</span>
                    </div>
                </div>
                <p><i class="far fa-comment-alt space light"></i>{{record.note}}</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  props: ["record"],
  data() {
    return {
      display: false,
      credential: null
    };
  },
  methods: {
    toggle() {
      if (!this.display) {
        this.$socket.emit(
          "[SIGNATURE] GET",
          this.record.credential,
          credential => {
            this.credential = credential;
            this.display = true;
          }
        );
      } else {
        this.display = false;
        this.credential = null;
      }
    }
  }
};
</script>

<style scoped>
.credential {
  width: 95%;
  margin: -5px auto;
  background: #fff;
  box-shadow: 0 1px 3px -1px #333;
}

.credential img {
  width: inherit;
  margin: auto;
  -webkit-user-drag: none;
}

.info {
  background: #eeeeee;
  padding: 10px 16px;
  border-top: 1px solid #ddd;
}

p {
  margin-top: 5px;
  padding-top: 7px;
  color: #ff5722;
  border-top: 1px dashed #e0e0e0;
}
</style>

