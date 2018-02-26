<template>
    <div class="range">
        <label :for="id">{{$t(label)}}</label>
        <input :id="id" :value="value" type="range" @input="$emit('input',$event.target.value)" :min="min" :max="max" :step="step">
        <span>{{value}}</span>
    </div>
</template>

<script>
export default {
    props: ['value', 'label', 'min', 'max', 'step'],
    created() {
        this.id = Math.random().toString(36).substr(2, 5);
    },
    data() {
        return {
            id: null
        }
    }
}
</script>

<style scoped>
.range {
    display: flex;
}

label{
    width: 130px;
    text-align: right;
    color: #666;
    font-size: 1.05em;
    padding: 8px 20px 8px 0;
}

span {
    text-align: center;
    padding: 10px;
    margin-left: 20px;
    background: #ECEFF1;
    color: #333;
    width: 50px;
    font-weight: bold;
}

input[type="range"] {
    flex:1;
    -webkit-appearance: none;
}

input[type="range"]:focus {
    outline: none;
}

input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: 5px;
    cursor: pointer;
    background: #B3E5FC;
    border-radius: 10px;
    transition: background 0.22s linear;
}

input[type=range]:focus::-webkit-slider-runnable-track {
    background: #03A9F4;
}

input[type=range]::-webkit-slider-thumb {
    border: 5px solid #fff;
    height: 21px;
    width: 21px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    -webkit-appearance: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    margin-top: -7px;
}
</style>