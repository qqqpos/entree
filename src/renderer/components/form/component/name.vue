<template>
    <div class="field-entry f1">
        <h4>{{$t('text.name')}}</h4>
        <div class="wrap" id="name">
            <i class="fa fa-id-card-o icon"></i>
            <input :value="value" @click="$emit('focus','name')" @input="$emit('input',$event.target.value)">
        </div>
    </div>
</template>

<script>
export default {
  props: ["value"]
};
</script>