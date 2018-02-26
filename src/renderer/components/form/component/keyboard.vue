<template>
    <div class="keyboard" v-if="display" @mousedown.prevent.stop>
        <div>
            <section class="alphabetic">
                <div id="Q" @mousedown.prevent="input('Q')">Q</div>
                <div id="W" @mousedown.prevent="input('W')">W</div>
                <div id="E" @mousedown.prevent="input('E')">E</div>
                <div id="R" @mousedown.prevent="input('R')">R</div>
                <div id="T" @mousedown.prevent="input('T')">T</div>
                <div id="Y" @mousedown.prevent="input('Y')">Y</div>
                <div id="U" @mousedown.prevent="input('U')">U</div>
                <div id="I" @mousedown.prevent="input('I')">I</div>
                <div id="O" @mousedown.prevent="input('O')">O</div>
                <i class="fa fa-reply-all" @mousedown.prevent="$emit('reset')"></i>
            </section>
            <section class="alphabetic">
                <div id="A" @mousedown.prevent="input('A')">A</div>
                <div id="S" @mousedown.prevent="input('S')">S</div>
                <div id="D" @mousedown.prevent="input('D')">D</div>
                <div id="F" @mousedown.prevent="input('F')">F</div>
                <div id="G" @mousedown.prevent="input('G')">G</div>
                <div id="H" @mousedown.prevent="input('H')">H</div>
                <div id="J" @mousedown.prevent="input('J')">J</div>
                <div id="K" @mousedown.prevent="input('K')">K</div>
                <div id="L" @mousedown.prevent="input('L')">L</div>
                <i class="fa fa-long-arrow-left" @mousedown.prevent="$emit('backspace')"></i>
            </section>
            <section class="alphabetic">
                <div id="Z" @mousedown.prevent="input('Z')">Z</div>
                <div id="X" @mousedown.prevent="input('X')">X</div>
                <div id="C" @mousedown.prevent="input('C')">C</div>
                <div id="V" @mousedown.prevent="input('V')">V</div>
                <div id="B" @mousedown.prevent="input('B')">B</div>
                <div id="N" @mousedown.prevent="input('N')">N</div>
                <div id="M" @mousedown.prevent="input('M')">M</div>
                <div id="P" @mousedown.prevent="input('P')">P</div>
                <div @mousedown.prevent="input('/')">/</div>
                <div @mousedown.prevent="input('#')">#</div>
            </section>
            <section class="alphabetic">
                <i class="fa fa-search" @mousedown.prevent="$emit('search')"></i>
                <div @mousedown.prevent="input('|')">|</div>
                <div class="space" @mousedown.prevent="input(' ')"></div>
                <i class="fa fa-keyboard-o" @mousedown.prevent="$emit('hide')"></i>
                <div class="" @mousedown.prevent="$emit('cancel')">{{$t('button.cancel')}}</div>
                <div class="double" @mousedown.prevent="$emit('create')">{{$t('button.create')}}</div>
            </section>
        </div>
        <div>
            <section class="numeric">
                <div @mousedown.prevent="input('7')">7</div>
                <div @mousedown.prevent="input('8')">8</div>
                <div @mousedown.prevent="input('9')">9</div>
            </section>
            <section class="numeric">
                <div @mousedown.prevent="input('4')">4</div>
                <div @mousedown.prevent="input('5')">5</div>
                <div @mousedown.prevent="input('6')">6</div>
            </section>
            <section class="numeric">
                <div @mousedown.prevent="input('1')">1</div>
                <div @mousedown.prevent="input('2')">2</div>
                <div @mousedown.prevent="input('3')">3</div>
            </section>
            <section class="numeric">
                <div class="double" @mousedown.prevent="input('0')">0</div>
                <div @mousedown.prevent="input('-')">-</div>
            </section>
        </div>

    </div>
</template>

<script>
export default {
  props: ["display"],
  methods: {
    input(char) {
      this.$emit("input", char);
    }
  }
};
</script>