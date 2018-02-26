<template>
    <div class="input">
        <div class="wrap">
            <label class="label">{{$t(label)}}</label>
            <label class="input-toggle">
                <input type="checkbox" :checked="value" @change="$emit('input',$event.target.checked)">
                <span></span>
            </label>
        </div>
        <div class="tip" v-show="tip">
            <i class="fa fa-exclamation-circle"></i>
            <span>{{$t(tip)}}</span>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        value: {
            type: Boolean,
            default: false
        },
        label: String,
        tip: String,
    }
}
</script>

<style scoped>
.input {
    display: flex;
    flex-direction: column;
}

.wrap {
    display: flex;
}

.label {
    width: 130px;
    text-align: right;
    color: #666;
    padding: 8px 20px 8px 0;
}

.tip {
    color: #4DB6AC;
    background: #EEEEEE;
    padding: 0 5px;
    display: flex;
    align-items: center;
}

.tip i{
    margin-right:5px;
}
</style>