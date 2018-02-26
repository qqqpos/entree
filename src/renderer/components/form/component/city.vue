<template>
    <div class="field-entry">
        <h4>{{$t('text.city')}}</h4>
        <div class="wrap" id="city">
            <i class="fa fa-map-marker icon"></i>
            <input :value="value" @click="focus" @input="$emit('input',$event.target.value)">
        </div>
        <template v-if="dropdown === 'list'">
          <transition name="menu" appear>
            <ul class="preset" v-outer-click="close">
              <li v-for="(city,index) in cities" @click="setCity(city)" :key="index">
                <h4>{{city}}</h4>
              </li>
            </ul>
          </transition>
      </template>
    </div>
</template>

<script>
export default {
  props: ["value"],
  created() {
    this.$socket.emit("[ADDRESS] CITIES", cities => {
      this.cities = cities;
    });
  },
  data() {
    return {
      cities: [],
      dropdown: null
    };
  },
  methods: {
    focus() {
      this.$emit("focus", "city");

      if (!this.value) this.dropdown = "list";
    },
    setCity(city) {
      this.$emit("input", city);
      this.dropdown = null;
    },
    close() {
      this.dropdown = null;
    }
  }
};
</script>