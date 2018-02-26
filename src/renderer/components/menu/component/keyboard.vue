<template>
    <div class="keyboard">
        <div>
            <section class="alphabetic">
                <div id="Q" @click="input('Q',$event)">Q</div>
                <div id="W" @click="input('W')">W</div>
                <div id="E" @click="input('E')">E</div>
                <div id="R" @click="input('R')">R</div>
                <div id="T" @click="input('T')">T</div>
                <div id="Y" @click="input('Y')">Y</div>
                <div id="U" @click="input('U')">U</div>
                <div id="I" @click="input('I')">I</div>
                <div id="O" @click="input('O')">O</div>
                <i class="fa fa-terminal" @click="clear"></i>
            </section>
            <section class="alphabetic">
                <div id="A" @click="input('A')">A</div>
                <div id="S" @click="input('S')">S</div>
                <div id="D" @click="input('D')">D</div>
                <div id="F" @click="input('F')">F</div>
                <div id="G" @click="input('G')">G</div>
                <div id="H" @click="input('H')">H</div>
                <div id="J" @click="input('J')">J</div>
                <div id="K" @click="input('K')">K</div>
                <div id="L" @click="input('L')">L</div>
                <i class="fa fa-long-arrow-left" @click="backspace"></i>
            </section>
            <section class="alphabetic">
                <div id="Z" @click="input('Z')">Z</div>
                <div id="X" @click="input('X')">X</div>
                <div id="C" @click="input('C')">C</div>
                <div id="V" @click="input('V')">V</div>
                <div id="B" @click="input('B')">B</div>
                <div id="N" @click="input('N')">N</div>
                <div id="M" @click="input('M')">M</div>
                <div id="P" @click="input('P')">P</div>
                <div @click="input('/')">/</div>
                <div @click="input('#')">#</div>
            </section>
            <section class="alphabetic">
                <i class="fa fa-search" @click="search"></i>
                <div @click="input('|')">|</div>
                <div class="space" @click="input(' ')"></div>
                <i class="fa fa-keyboard-o double"></i>
                <div class="double">{{$t('button.done')}}</div>
            </section>
        </div>
        <div>
            <section class="numeric">
            <div @click="input('7')">7</div>
            <div @click="input('8')">8</div>
            <div @click="input('9')">9</div>
            </section>
            <section class="numeric">
            <div @click="input('4')">4</div>
            <div @click="input('5')">5</div>
            <div @click="input('6')">6</div>
            </section>
            <section class="numeric">
            <div @click="input('1')">1</div>
            <div @click="input('2')">2</div>
            <div @click="input('3')">3</div>
            </section>
            <section class="numeric">
            <div class="double" @click="input('0')">0</div>
            <div @click="input('-')">-</div>
            </section>
        </div>
    </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {};
  },
  methods: {
    input(s) {
      this.$bus.emit("input", s);
    },
    backspace() {
      this.$bus.emit("backspace");
    },
    clear() {
      this.$bus.emit("clear");
    },
    search() {}
  }
};
</script>