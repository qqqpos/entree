<template>
    <div class="relative">
        <div class="slider" :style="position"></div>
        <ul class="tab">
            <li @click="move('Information',0)">{{$t('text.contactInfo')}}</li>
            <li @click="move('Map',1)">{{$t('text.map')}}</li>
            <li @click="move('History',2)">{{$t('text.history')}}</li>
        </ul>
    </div>
</template>

<script>
export default {
  data() {
    return {
      offset: 0
    };
  },
  methods: {
    move(name, offset) {
      this.$router.push({ name });
      this.offset = offset;
    }
  },
  computed: {
    position() {
      return { transform: `translate3d(${this.offset * 222.67}px,0,0)` };
    }
  }
};
</script>

<style scoped>
.relative {
  border-top: 2px solid #cfd8dc;
}

ul.tab {
  display: flex;
}

ul.tab li {
  flex: 1;
  text-align: center;
  padding: 15px;
  cursor: pointer;
  background: #f5f5f5;
}

.slider {
  position: absolute;
  width: 222.67px;
  height: 2px;
  background: #607d8b;
  top: -2px;
  transition: transform 0.3s ease-out;
}

.slider:before {
  content: " ";
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #607d8b;
  position: absolute;
  left: 100px;
}
</style>