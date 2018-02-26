<template>
    <div class="popupMask dark center">
        <div class="terminal">
            <header v-if="init.edit">
                <h5>{{device.model}}</h5>
                <h3>Edit Terminal</h3>
            </header>
            <header v-else>
                <h5></h5>
                <h3>New Terminal</h3>
            </header>
            <div class="wrap">

            </div>
            <footer>
                <div class="f1">
                    <span class="del">{{$t('button.delete')}}</span>
                </div>
                <button class="btn" @click="init.reject">{{$t('button.cancel')}}</button>
                <button class="btn">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      device: {}
    };
  },
  created() {
    this.device = Object.assign({}, this.init.device);
  }
};
</script>

<style scoped>
.terminal {
  background: #fff;
  width: 600px;
  box-shadow: var(--shadow);
}

header {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #eee;
  padding: 15px 0 10px 25px;
}

h5{
    color:#3c3c3c;
}

footer{
    display: flex;
}
</style>