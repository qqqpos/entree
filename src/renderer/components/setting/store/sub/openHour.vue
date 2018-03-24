<template>
  <div>
    <header class="nav">
      <div class="back" @click="$router.push({ name: 'Setting.store' })">
        <i class="fa fa-chevron-left"></i>
      </div>
      <div class="title">{{$t('text.openHour')}}</div>
    </header>
  </div>
</template>

<script>
export default {
    data(){
        return{
            
        }
    }
};
</script>

<style scoped>

</style>
