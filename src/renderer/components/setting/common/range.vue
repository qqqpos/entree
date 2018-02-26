<template>
  <div class="range">
    <label :for="id">{{$t(title)}}</label>
    <input type="range" @input="$emit('input',$event.target.value)" @change="$emit('update',$event.target.value)" :id="id" :value="value" :min="min" :max="max" :step="step">
    <span>{{value}}</span>
  </div>
</template>

<script>
export default {
  props: {
    value: [Number,String],
    title: String,
    tooltip: String,
    min: Number,
    max: Number,
    step: Number
  },
  data() {
    return {
      id: Math.random()
        .toString(36)
        .substr(2, 5)
    };
  }
};
</script>

<style scoped>
.range {
  display: flex;
  align-items: center;
  height: 40px;
}

label {
  text-align: right;
  margin-right: 20px;
  min-width: 50px;
}

span {
  text-align: center;
  padding: 5px;
  margin-left: 20px;
  background: #fff;
  color: #333;
  width: 50px;
  font-weight: bold;
  border-radius: 4px;
}

input[type="range"] {
  flex: 1;
  -webkit-appearance: none;
}

input[type="range"]:focus {
  outline: none;
}

input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 7px;
  cursor: pointer;
  background: #b3e5fc;
  border-radius: 6px;
  transition: background 0.22s linear;
}

input[type="range"]:focus::-webkit-slider-runnable-track {
  background: #03a9f4;
}

input[type="range"]::-webkit-slider-thumb {
  border: 5px solid #fff;
  height: 21px;
  width: 21px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  -webkit-appearance: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  margin-top: -7px;
}
</style>