<template>
    <div class="popupMask dark center" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h5></h5>
                <h3></h3>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                
            </div>
            <footer>
                <button class="btn">{{$t('button.create')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
    props:["init"],
    data(){
        return{

        }
    },
    methods:{
        
    }
}
</script>
