<template>
  <div class="popupMask center dark">
    <div class="editor">
      <header>
        <h5></h5>
        <h3>{{$t('title.voidNote')}}</h3>
      </header>
      <div class="banner"></div>
      <ul>
        <li v-for="(reason,index) in reasons" :key="index">
          <input type="radio" v-model="note" :value="reason.text" :id="'reason'+index">
          <label :for="'reason'+index">{{$t('reason.'+reason.text)}}
            <i class="fa fa-flag" v-if="reason.flag"></i>
          </label>
        </li>
        <li v-show="isManager" class="manager">
          <input type="radio" v-model="note" value="Manager Redemption" id="redemption">
          <label for="redemption">{{$t('reason.Manager Redemption')}}</label>
        </li>
      </ul>
      <footer>
        <button class="btn" @click="init.reject">{{$t('button.cancel')}}</button>
        <button class="btn" :disabled="!note" @click="confirm">{{$t('button.confirm')}}</button>
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
      reasons: [
        { text: "Customer No-Show", flag: true },
        { text: "Cancel By Customer", flag: false },
        { text: "Cancel By Staff", flag: false },
        { text: "Invalid Order", flag: false },
        { text: "Payment Issue", flag: false },
        { text: "Malice Order", flag: true }
      ],
      note: null,
      isManager: false
    };
  },
  created() {
    this.isManager = this.op.role === "Manager";
  },
  computed: {
    ...mapGetters(["op", "order"])
  },
  methods: {
    confirm() {
      Object.assign(this.order, {
        status: 0,
        void: {
          by: this.op.name,
          time: +new Date(),
          note: this.note
        }
      });

      this.$socket.emit("[UPDATE] INVOICE", this.order);
      this.init.resolve();
    }
  }
};
</script>

<style scoped>
ul {
  padding: 10px;
}

li {
  display: flex;
  width: 300px;
}

label i {
  margin: 0 5px;
  color: #ff5722;
  flex: 1;
  text-align: right;
}

.manager {
  margin-top: 30px;
}

label {
  padding: 5px 15px;
  background: #eeeeee;
  margin: 2px 10px;
  height: 40px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  width: 100%;
  cursor: pointer;
}

input:checked + label {
  background: url("../../../assets/image/mis.png") #009688;
  color: #fff;
  text-shadow: 0 1px 1px #333;
}
</style>