<template>
  <div>
    <header>
      <span class="label">{{$t(title)}}</span>
      <span class="tooltip">{{$t(tooltip)}}</span>
    </header>
    <div class="wrap">
      <div class="select" v-for="(option,index) in opts" :key="index">
        <input type="radio" name="id" :id="id+index" :checked="option.value === value" :value="option.value" @change="$emit('input',$event.target.value),$emit('update',$event.target.value)">
        <label :for="id+index">
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
.select {
  display: flex;
}

header {
  display: flex;
  flex-direction: column;
  padding: 5px 20px;
}

.wrap {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  padding: 0 0 5px;
  background: #eee;
}

.tooltip {
  color: rgba(0, 0, 0, 0.5);
}

label {
  border: 2px solid #eee;
  padding: 5px 10px 5px 40px;
  width: 250px;
  margin: 5px 20px 0 0;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #fff;
}

label:before {
  position: absolute;
  font-family: fontAwesome;
  left: 15px;
  top: 15px;
  content: "\f05d";
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