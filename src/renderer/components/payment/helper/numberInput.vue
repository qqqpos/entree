<template>
    <section class="numpad">
        <div @click="$emit('input','7')" class="numKey">7</div>
        <div @click="$emit('input','8')" class="numKey">8</div>
        <div @click="$emit('input','9')" class="numKey">9</div>
        <div @click="$emit('input','4')" class="numKey">4</div>
        <div @click="$emit('input','5')" class="numKey">5</div>
        <div @click="$emit('input','6')" class="numKey">6</div>
        <div @click="$emit('input','1')" class="numKey">1</div>
        <div @click="$emit('input','2')" class="numKey">2</div>
        <div @click="$emit('input','3')" class="numKey">3</div>
        <div @click="$emit('input','0')" class="numKey">0</div>
        <div @click="$emit('input','00')" class="double numKey">00</div>
    </section>
</template>

<script>
export default {};
</script>

<style>
section.numpad {
  display: flex;
  flex-wrap: wrap;
  width: 315px;
}
</style>

