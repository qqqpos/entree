<template>
    <div class="radio">
        <input :id="id" :checked="value === val" :value="val" type="radio" :name="name" @change="$emit('input',$event.target.value)">
        <label class="box" :for="id"></label>
        <label class="text" :for="id">{{$t(label)}}</label>
    </div>
</template>

<script>
export default {
  props: ["val", "label", "value", "name"],
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
.radio {
  margin: 2px 10px;
  display: flex;
}

label.box {
  border: 2px solid #7a7a7a;
  border-radius: 50%;
  width: 15px;
  height: 15px;
  margin-right: 2px;
}

label.box:after {
  display: block;
  content: " ";
  transform: scale(0);
  background: #009688;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: 0.3s;
}
input:checked + label.box:after {
  transform: scale(0.8);
}
</style>
