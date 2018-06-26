<template>
    <div class="relative">
        <div class="slider" :style="position"></div>
        <ul class="tab">
            <li @click="move('Information',0)"><i class="fas fa-info-circle"></i>{{$t('text.contactInfo')}}</li>
            <li @click="move('Map',1)"><i class="fas fa-map-marked-alt"></i>{{$t('text.map')}}</li>
            <li @click="move('Tag',2)"><i class="fas fa-user-tag"></i>{{$t('text.tag')}}</li>
            <li @click="move('Config',3)"><i class="fas fa-user-cog"></i>{{$t('setting.config')}}</li>
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
      return { transform: `translate3d(${this.offset * 167}px,0,0)` };
    }
  }
};
</script>

<style scoped>
.relative {
  border-top: 2px solid #cfd8dc;
}

i {
  margin-right: 5px;
  color: #666;
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
  width: 167px;
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
  left: 71px;
}
</style>