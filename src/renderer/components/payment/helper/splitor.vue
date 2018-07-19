<template>
    <div v-if="!disable && tickets.length > 1" class="viewer">
        <label v-for="(split,index) in tickets" :key="index" :class="{hidden:split.payment.remain === 0}">
            <input type="radio" name="split" :id="'split_'+index" :value="index" v-model="target" @change="$emit('switch',index)" @input="$emit('input',index)">
            <label :for="'split_'+index" class="tag">{{index + 1}}</label>
            <div class="preview" @click="$emit('preview',index)">
              <i class="fas fa-file-invoice"></i>
              <span>{{$t('text.preview')}}</span>
            </div>
        </label>
    </div>
</template>

<script>
export default {
  props: ["value", "tickets", "disable"],
  data() {
    return {
      target: null
    };
  },
  watch: {
    value: {
      immediate: true,
      handler: function(index) {
        this.target = index;
      }
    }
  }
};
</script>

<style scoped>
.viewer {
  display: inline-flex;
  padding-left: 20px;
  width: 765px;
  height: 115px;
  overflow: auto;
  margin-bottom: 74px;
  padding-bottom: 3px;
  align-items: flex-end;
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
  animation: preview 0.3s 0.2s ease-out forwards;
}

.hidden {
  display: none;
}

.preview {
  visibility: hidden;
  position: absolute;
  bottom: 34px;
  left: -14px;
  width: 65px;
  height: 70px;
  padding: 2px;
  background: #2196f3;
  color: #fff;
  text-align: center;
  border-radius: 4px;
  z-index: 1;
  opacity: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.preview:after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #2196f3 transparent transparent transparent;
}

.preview span {
  font-size: 16px;
}

.preview i {
  font-size: 28px;
  color: #eeeeee;
  padding: 8px 2px;
}

@keyframes preview {
  from {
    opacity: 0;
    transform: translate3d(0, 10px, 0);
  }
  to {
    opacity: 1;
    visibility: visible;
    transform: translate3d(0, 0, 0);
  }
}
</style>
