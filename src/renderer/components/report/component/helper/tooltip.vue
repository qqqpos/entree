<template>
    <transition name="popup">
        <div class="tooltip" :style="position">
            <ul>
                <li v-for="(stat,type,index) in data.types" :key="index" class="row">
                    <span class="type">{{$t('type.'+type)}}</span>
                    <b>{{stat.count}}</b>
                    <span class="f1"></span>
                    <span class="agency">$ {{stat.amount | decimal}}</span>
                </li>
            </ul>
            <div class="dashed row">
              <span class="type">{{$t('text.total')}}</span>
              <b>{{data.count}}</b>
              <span class="f1"></span>
              <span class="agency">$ {{data.amount | decimal}}</span>
            </div>
            <div class="arrow"></div>
        </div>
    </transition>
</template>

<script>
export default {
  props: ["data", "position"]
};
</script>

<style scoped>
.tooltip {
  padding: 10px 15px;
  width: 190px;
  position: absolute;
  transform: translate(-50%, -50%);
  border-radius: 4px;
  background: #fff;
  font-size: initial;
  z-index: 2;
  color: #345;
  box-shadow: 0px 5px 15px 0px rgba(0, 0, 0, 0.3);
}

.arrow {
  width: 50px;
  height: 25px;
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  overflow: hidden;
}

.arrow::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  background: #fff;
  top: 0;
  left: 50%;
  box-shadow: 1px 1px 20px 0px rgba(0, 0, 0, 0.6);
  transform: translateX(-50%) translateY(-50%) rotate(45deg);
}

.type {
  width: 75px;
  text-align: left;
}

.dashed {
  padding-top: 3px;
  margin-top: 3px;
  border-top: 1px dashed #eee;
}
</style>
