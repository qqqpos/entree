<template>
    <div v-if="!mode && splits.length > 1" class="viewer">
        <label v-for="(split,index) in splits" :key="index">
            <input type="radio" name="split" :id="'split_'+index" :value="index" v-model="page" @change="$emit('switch',index)" @input="$emit('input',index)">
            <label :for="'split_'+index" class="tag">{{index + 1}}</label>
            <div class="preview" @click="$emit('preview',index)">
            <i class="fa fa-wpforms"></i>
            <span>{{$t('text.preview')}}</span>
            </div>
        </label>
    </div>
</template>

<script>
export default {
  props: ["value", "splits", "mode"],
  data() {
    return {
      page: null
    };
  },
  watch: {
    value: {
      immediate: true,
      handler: function(page) {
        this.page = page;
      }
    }
  }
};
</script>

<style scoped>
.viewer {
  display: inline-flex;
  margin-left: 25px;
  max-width: 765px;
}

.viewer input:checked + label {
  background: #2196f3;
  color: #fff;
}

.viewer .tag {
  width: 40px;
  justify-content: center;
  display: flex;
  margin-right: 5px;
  padding: 4px 0px;
  cursor: pointer;
  transition: background 0.3s ease;
  border-radius: 4px;
  background: #eee;
  font-family: "Agency FB";
  font-weight: bold;
  color: #666;
}

.viewer label {
  position: relative;
}

.viewer input:checked ~ .preview {
  animation: preview 0.5s 0.2s ease-out forwards;
}

.preview {
  visibility: hidden;
  position: absolute;
  bottom: 40px;
  left: -18px;
  width: 75px;
  height: 70px;
  background-color: #555;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
  z-index: 1;
  opacity: 0;
  display: flex;
  flex-direction: column;
}

.preview:after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

.preview span {
  font-size: 16px;
}

.preview i {
  font-size: 28px;
  color: #eeeeee;
  padding: 8px 2px;
}
</style>
