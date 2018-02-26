<template>
  <div class="dropdownWrap relative">
    <label>{{$t(label)}}</label>
    <div @click.self="toggleDropdown" class="dropdown">
      <span class="tag relative" v-for="(tag,i) in tags" :key="i">
        {{tag}}
        <i v-if="multiple" @click.stop="deselect(i)" class="remove">&times;</i>
      </span>
      <input ref="search" id="search" v-model="search" @keydown.delete="del" @keyup.esc="esc" @blur="closeDropdown" @click="toggleDropdown" :style="inputStyle">
      <i class="fa fa-chevron-down" @click="toggleDropdown"></i>
    </div>
  
    <transition>
      <ul v-if="open" class="dropdownMenu">
        <li v-for="(option,index) in options" @mousedown.prevent="select(index)" :key="index">{{option}}</li>
      </ul>
    </transition>
  </div>
</template>

<script>
export default {
  props: ['value', 'options', 'label', 'multiple'],
  data() {
    return {
      open: false,
      search: "",
      width: 310
    }
  },
  methods: {
    toggleDropdown() {
      this.open = !this.open;
    },
    closeDropdown() {
      this.open = false;
    },
    select(i) {
      let tag = this.options[i];
      let index = this.tags.indexOf(tag);
      index === -1 ? this.tags.push(this.options[i]) : this.tags.splice(index, i)
    },
    deselect(i) {
      this.tags.splice(i, 1);
    },
    calcInputWidth() {
      let total = 300;
      this.$nextTick(() => {
        let tags = document.querySelectorAll('.tag');
        tags.forEach(dom => {
          total -= dom.offsetWidth;
        })
        this.width = Math.abs(total);
      })
    },
    del() {

    },
    esc() {

    }
  },
  computed: {
    tags() {
      return this.value
    },
    inputStyle() {
      let trigger = this.value;
      this.calcInputWidth();
      return {
        width: this.width + "px"
      }
    }
  }
}
</script>

<style>
.dropdownWrap {
  border-bottom: 1px solid #ccc;
  display: flex;
  font-size: 1.3em;
  font-family: 'Microsoft YaHei';
  color: #666;
}

.dropdown {
  width: 325px;
  padding-right: 36px;
  position: relative;
}

.dropdownWrap label {
  width: 143px;
  text-indent: 1.4em;
  padding: 6px 0;
}

span.tag {
  display: inline-flex;
  padding: 3px 20px 3px 8px;
  margin: 2px;
  border-radius: 4px;
  background: #2856b6;
  color: #fff;
}

.dropdown input {
  border: none;
  outline: none;
  font-size: 1.13em;
  width: 141px;
  padding: 5px 0;
}

.dropdown i {
  position: absolute;
  right: 15px;
  top: calc(50% - 10px);
}

ul.dropdownMenu {
  position: absolute;
  top: 35px;
  right: 0px;
  width: 360px;
  border-top: none;
  max-height: 170px;
  overflow-y: scroll;
  background: #fff;
  box-shadow: 0 3px 4px 0px rgba(0, 0, 0, 0.3);
}

ul.dropdownMenu li:hover {
  background: #E0E0E0;
}

ul.dropdownMenu li {
  padding: 5px 20px;
  border-bottom: 1px solid #eee;
}

.tag i {
  position: absolute;
  right: 1px;
  color: #C5CAE9;
  font-size: 1em;
  font-family: sans-serif;
  padding: 0 5px;
}
</style>
