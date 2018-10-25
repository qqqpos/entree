<template>
    <div class="field-entry f1">
        <h4>{{$t(text)}}</h4>
        <div class="wrap" :id="field">
            <i :class="icon"></i>
            <input :value="value" :placeholder="placeholder" @click="$emit('focus',field)" @input="$emit('input',$event.target.value)" class="f1">
        </div>
    </div>
</template>

<script>
export default {
  props: ["value", "text", "field", "icon","placeholder"]
};
</script>