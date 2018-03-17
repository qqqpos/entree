<template>
    <div>
        <range-tab @update="fetchData" initial="currentWeek"></range-tab>
        <section>

        </section>
    </div>
</template>

<script>
import rangeTab from "../common/rangeTab";
export default{
    components:{ rangeTab },
    data(){
        return{

        }
    },
    created(){
        this.fetchData()
    },
    methods:{
        fetchData(range){
            if(!range){

            }else{
                
            }
        }
    }
    
}
</script>