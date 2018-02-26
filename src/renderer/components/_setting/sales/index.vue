<template>
    <div class="wrap">
        <aside>
            <!-- <div v-for="(day,index) in days" :key="index">{{day}}</div> -->
        </aside>
        <article></article>
    </div>
</template>

<script>
export default {
    data() {
        return {
            days: [1,2,3,4,5,6,7,8,9,10]
        }
    },
    created(){
        this.initial()
    },
    methods:{
        initial(){
            let date = today();
            
        }
    }
}
</script>