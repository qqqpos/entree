<template>
    <div class="popupMask dark center" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <div>
                    <h3>{{$t('text.driver')}}</h3>
                    <h5>{{$t('tip.temporaryDriver')}}</h5>
                </div>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <ul class="letters">
                    <li v-for="letter in letters" :key="letter" @click="set(letter)" :class="{active:name === letter}">{{letter}}</li>
                    <li class="clear" @click="set('')"><i class="fas fa-eraser space"></i>{{$t('button.reset')}}</li>
                </ul>
            </div>
            <footer>
                <button @click="init.resolve(name)" :disabled="!name" class="btn">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {
      letters: [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z"
      ],
      name: ""
    };
  },
  methods: {
    set(name) {
      this.name = name;
    }
  }
};
</script>

<style scoped>
.wrap {
  padding: 5px;
  background: #eceff1;
}

ul.letters {
  display: flex;
  flex-wrap: wrap;
  width: 518px;
}

.letters li {
  width: 70px;
  height: 60px;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.3);
  background: #fff;
  margin: 2px;
  border-radius: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.letters li:active {
  background: #eee;
}

li.active:after {
  font-family: "fontAwesome";
  font-weight: bold;
  content: "\f00c";
  position: absolute;
  bottom: 5px;
  right: 5px;
  color: #009688;
}

li.clear {
  width: 144px;
}
</style>


