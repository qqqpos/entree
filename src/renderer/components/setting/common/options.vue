<template>
  <div>
    <header class="column">
      <span class="label">{{$t(title)}}</span>
      <span class="tooltip">{{$t(tooltip)}}</span>
    </header>
    <div class="wrap column">
      <div class="row" v-for="(option,index) in opts" :key="index">
        <input type="radio" name="id" :id="id+index" :checked="option.value === value" :value="option.value" @change="$emit('input',$event.target.value),$emit('update',$event.target.value)">
        <label :for="id+index" class="clickable">
          <span class="label">{{$t(option.label)}}</span>
          <span class="tooltip">{{$t(option.tooltip)}}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: [String, Number],
    title: String,
    tooltip: String,
    opts: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      id: Math.random()
        .toString(36)
        .substring(3, 6)
    };
  }
};
</script>

<style scoped>
header {
  padding: 5px 20px;
}

.wrap {
  padding: 0 0 5px;
  background: #f1f3f5;
  align-items: flex-end;
}

.tooltip {
  color: rgba(0, 0, 0, 0.5);
}

label {
  border: 2px solid transparent;
  padding: 5px 10px 5px 40px;
  width: 250px;
  margin: 5px 20px 0 0;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #fff;
  box-shadow: 0 6px 8px rgba(102, 119, 136, 0.03),
    0 1px 2px rgba(102, 119, 136, 0.3);
}

label:before {
  position: absolute;
  font-family: fontAwesome;
  left: 15px;
  top: 15px;
  font-weight: 500px;
  content: "\f111";
  color: lightgray;
}

input:checked + label {
  border: 2px solid #009688;
}

input:checked + label .tooltip {
  color: #03a9f4;
}

input:checked + label:before {
  content: "\f058";
  color: #009688;
}
</style>