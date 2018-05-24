<template>
    <div class="popupMask dark center" @click.self="init.reject">
        <div class="editor">
            <header>
                <div>
                    <h5>{{setDate}}</h5>
                    <h3>{{$t('title.ledger')}}</h3>
                </div>
                <tab v-model="page" @switch="loadComponent"></tab>
            </header>
            <div class="wrap">
                <transition name="slide" mode="out-in">
                    <div :is="component" :init="componentData"></div>
                <transition></transition>
            </div>
            <footer>
                <button class="btn" @click="init.resolve">{{$t('button.done')}}</button>
            </footer>
            <loader :display="isLoading"></loader>
        </div>
    </div>
</template>

<script>
import loader from "../common/loader";

export default {
  props: ["init"],
  components: { loader },
  data() {
    return {
      component: null,
      componentData: null,
      isLoading: true
    };
  },
  created(){

  },
  mounted(){
      
  },
  methods: {
    loadComponent(name) {

    }
  }
};
</script>

<style scoped>
</style>

