<template>
    <div class="input">
        <label>{{$t(label)}}</label>
        <select :value="value" @change="$emit('input', $event.target.value)">
            <option :value="option.value" v-for="(option,index) in data" :key="index">{{option.label}}</option>
        </select>
    </div>
</template>

<script>
export default {
    props: ['value', 'label', 'tip', 'options'],
    created() {
        this.data = this.options.map(option => typeof option === 'string' ? { label: option, value: option } : option)
    },
    data() {
        return {
            data: null
        }
    },
    watch: {
        'options': {
            handler(n) {
                this.data = this.options.map(option => typeof option === 'string' ? { label: option, value: option } : option)
            }, deep: true
        }
    }
}
</script>

<style scoped>
.input {
    display: flex;
    align-items: center;
}

label {
    width: 130px;
    padding-right: 20px;
    text-align: right;
    color: #666;
}

select {
    border: none;
    outline: none;
    flex: 1;
    padding: 8px 0;
    font-size: 1em;
    color: #9E9E9E;
    font-family: 'Yuanti-SC';
}
</style>