<template>
    <transition appear name="popup">
        <div class="keyboard" @mousedown.prevent v-if="display">
            <template v-if="alphabet">
                <section class="alphabetic" :class="{uppercase:shift}">
                    <div @mousedown.prevent="input('Q')">Q</div>
                    <div @mousedown.prevent="input('W')">W</div>
                    <div @mousedown.prevent="input('E')">E</div>
                    <div @mousedown.prevent="input('R')">R</div>
                    <div @mousedown.prevent="input('T')">T</div>
                    <div @mousedown.prevent="input('Y')">Y</div>
                    <div @mousedown.prevent="input('U')">U</div>
                    <div @mousedown.prevent="input('I')">I</div>
                    <div @mousedown.prevent="input('O')">O</div>
                    <div @mousedown.prevent="input('P')">P</div>
                </section>
                <section class="alphabetic" :class="{uppercase:shift}">
                    <div @mousedown.prevent="input('A')">A</div>
                    <div @mousedown.prevent="input('S')">S</div>
                    <div @mousedown.prevent="input('D')">D</div>
                    <div @mousedown.prevent="input('F')">F</div>
                    <div @mousedown.prevent="input('G')">G</div>
                    <div @mousedown.prevent="input('H')">H</div>
                    <div @mousedown.prevent="input('J')">J</div>
                    <div @mousedown.prevent="input('K')">K</div>
                    <div @mousedown.prevent="input('L')">L</div>
                </section>
                <section class="alphabetic" :class="{uppercase:shift}">
                    <div class="fn" @mousedown.prevent="shift = !shift">shift</div>
                    <div @mousedown.prevent="input('Z')">Z</div>
                    <div @mousedown.prevent="input('X')">X</div>
                    <div @mousedown.prevent="input('C')">C</div>
                    <div @mousedown.prevent="input('V')">V</div>
                    <div @mousedown.prevent="input('B')">B</div>
                    <div @mousedown.prevent="input('N')">N</div>
                    <div @mousedown.prevent="input('M')">M</div>
                    <div class="fn" @mousedown.prevent="$emit('backspace')">delete</div>
                </section>
            </template>
            <template v-else>
                <section class="alphabetic">
                    <div @mousedown.prevent="input('1')">1</div>
                    <div @mousedown.prevent="input('2')">2</div>
                    <div @mousedown.prevent="input('3')">3</div>
                    <div @mousedown.prevent="input('4')">4</div>
                    <div @mousedown.prevent="input('5')">5</div>
                    <div @mousedown.prevent="input('6')">6</div>
                    <div @mousedown.prevent="input('7')">7</div>
                    <div @mousedown.prevent="input('8')">8</div>
                    <div @mousedown.prevent="input('9')">9</div>
                    <div @mousedown.prevent="input('0')">0</div>
                </section>
                <section class="alphabetic">
                    <div @mousedown.prevent="input('@')">@</div>
                    <div @mousedown.prevent="input('#')">#</div>
                    <div @mousedown.prevent="input('&')">&</div>
                    <div @mousedown.prevent="input('*')">*</div>
                    <div @mousedown.prevent="input('-')">-</div>
                    <div @mousedown.prevent="input('+')">+</div>
                    <div @mousedown.prevent="input('=')">=</div>
                    <div @mousedown.prevent="input('(')">(</div>
                    <div @mousedown.prevent="input(')')">)</div>
                </section>
                <section class="alphabetic">
                    <div class="fn">shift</div>
                    <div @mousedown.prevent="input('_')">_</div>
                    <div @mousedown.prevent="input('$')">$</div>
                    <div @mousedown.prevent="doubleQuote">"</div>
                    <div @mousedown.prevent="singleQuote">'</div>
                    <div @mousedown.prevent="input(':')">:</div>
                    <div @mousedown.prevent="input(';')">;</div>
                    <div @mousedown.prevent="input('/')">/</div>
                    <div class="fn" @mousedown.prevent="$emit('backspace')">delete</div>
                </section>
            </template>
            <section class="alphabetic ">
                <div class="fn" @mousedown.prevent="$emit('update:alphabet',!alphabet)">{{alphabet ? '123' : 'abc'}}</div>
                <div @mousedown.prevent="input(',')">,</div>
                <div class="space" @mousedown.prevent="space"></div>
                <div @mousedown.prevent="input('.')">.</div>
                <div class="fn" @mousedown.prevent="$emit('enter')">{{executeText}}</div>
            </section>
        </div>
    </transition>

</template>

<script>
export default {
  props: {
    display: Boolean,
    executeText: {
      type: String,
      default: "Enter"
    },
    alphabet: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      capLock: false,
      shift: true,
      layout: true
    };
  },
  methods: {
    input(string) {
      string = this.shift ? string.toUpperCase() : string.toLowerCase();

      this.$emit("input", string);
      this.shift = false;
    },
    doubleQuote() {
      this.$emit("input", '"');
    },
    singleQuote() {
      this.$emit("input", "'");
    },
    space(){
      this.$emit("input"," ");
      this.shift = true;
    }
  }
};
</script>

<style scoped>
.keyboard {
  flex-direction: column;
  margin: 0;
  left: 120px;
  border-radius: 2px 2px 0 0;
}

.keyboard > section {
  display: flex;
  justify-content: center;
  text-transform: lowercase;
}

div .fn {
  width: 110px;
  text-transform: capitalize;
  background: linear-gradient(#939ba6, #687180);
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7), 0 1px 0 rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.45);
  font-weight: normal;
}

.alphabetic.uppercase {
  text-transform: uppercase;
}
</style>