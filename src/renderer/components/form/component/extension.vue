<template>
    <div class="field-entry f1">
        <h4>{{$t('text.extension')}}</h4>
        <div class="wrap" id="extension">
            <i class="fa fa-fax icon"></i>
            <input :value="value" @click="$emit('focus','extension')" @input="$emit('input',$event.target.value)">
        </div>
    </div>
</template>

<script>
export default {
    props: ["value"]
};
</script>