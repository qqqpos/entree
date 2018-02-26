<template>
    <div class="field-entry f1">
        <h4>{{$t('text.note')}}</h4>
        <div class="wrap" id="note">
            <i class="fa fa-commenting icon"></i>
            <input :value="value" @click="$emit('focus','note')" @input="$emit('input',$event.target.value)">
        </div>
    </div>
</template>

<script>
export default {
  props: ["value"]
};
</script>