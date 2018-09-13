<template>
    <div class="types">
        <div v-for="(type,index) in types" :key="index">
            <input type="radio" v-model="method" name="type" :value="type" :id="type">
            <label :for="type">{{$t('type.'+ type)}}</label>            
        </div>   
    </div>
</template>

<script>
export default {
  props: ["value", "terminal", "external", "giftcard"],
  data() {
    return {
      types: ["CASH", "CREDIT", "THIRD", "GIFT"],
      method: "CASH"
    };
  },
  created() {
    if (!this.terminal || this.external)
      this.types = this.types.filter(type => type !== "CREDIT");

    if (!this.giftcard) this.types = this.types.filter(type => type !== "GIFT");

    if (this.types.length > 3)
      this.types = this.types.filter(type => type !== "THIRD");
  },
  watch: {
    value(type) {
      this.method = type;
    },
    method(type) {
      this.$emit("change", type);
    }
  }
};
</script>

<style scoped>
.types {
  display: flex;
}

label {
  display: block;
  width: 97px;
  margin: 0px 4px 4px 0;
  background: #fff;
  border: 2px solid #e0e0e0;
  position: relative;
  text-align: center;
  line-height: 49px;
  border-radius: 4px;
  color: #bdbdbd;
}

input:checked + label {
  background: #66bb6a;
  color: #fafafa;
  border: 2px solid #009688;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

input:checked + label:before {
  position: absolute;
  content: " ";
  width: 23px;
  height: 15px;
  background: #009688;
  bottom: 0;
  right: 0;
  border-top-left-radius: 4px;
}

input:checked + label:after {
  position: absolute;
  content: "\f00c";
  bottom: -18px;
  right: 3px;
  font-weight: bold;
  font-family: fontAwesome;
}
</style>


