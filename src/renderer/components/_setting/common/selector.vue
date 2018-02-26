<template>
    <div class="popupMask center dark" @click.self="init.reject(false)">
        <div class="editor">
            <header class="title">
                <h2>{{$t('title.optionList')}}</h2>
            </header>
            <div class="inner" v-if="type==='checkbox'">
                <div v-for="(option,index) in init.options" :key="index">
                    <input type="checkbox" v-model="select" name="option" :id="'option'+index" :value="option.value">
                    <label :for="'option'+index" class="choice">
                        <h5 class="title">{{option.label}}</h5>
                        <p class="tooltip">{{$t(option.tooltip)}}</p>
                    </label>
                </div>
            </div>
            <div class="inner" v-else>
                <div v-for="(option,index) in init.options" :key="index">
                    <input type="radio" v-model="select" name="option" :id="'option'+index" :value="option.value">
                    <label :for="'option'+index" class="choice">
                        <h5 class="title">{{option.label}}</h5>
                        <p class="tooltip">{{$t(option.tooltip)}}</p>
                    </label>
                </div>
            </div>
            <footer>
                <div class="btn" @click="init.reject(false)">{{$t('button.cancel')}}</div>
                <button class="btn" @click="confirm">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      type: "radio",
      select: []
    };
  },
  created() {
    this.type = this.init.type;
    this.select = this.init.defaultValue;
  },
  methods: {
    confirm() {
      this.init.resolve(this.select);
    }
  }
};
</script>

<style scoped>
.inner {
  align-items: inherit;
  min-width: 350px;
}
.choice {
  display: flex;
  justify-content: center;
  min-width: 250px;
  height: 45px;
  padding: 5px 10px;
  flex-direction: column;
  background: #fff;
  margin-bottom: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  position: relative;
}
input:checked + label {
  background: url("../../../assets/image/mis.png") #009688;
  color: #fff;
  text-shadow: 0 1px 1px #333;
}
input:checked + label:after {
  position: absolute;
  bottom: 5px;
  right: 7px;
  content: "\f058";
  font-family: fontAwesome;
  color: #fff;
}
h5 {
  font-weight: normal;
  font-size: 18px;
}
input {
  display: none;
}
.tooltip {
  color: #ff9800;
}
</style>