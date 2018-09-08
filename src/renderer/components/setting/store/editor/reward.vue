<template>
    <div class="popupMask dark setting center">
        <div class="editor">
            <header>
                <h3>{{$t('title.rewardRules')}}</h3>
                <h5></h5>
            </header>
            <div class="banner"></div>
            <div class="wrap">

            </div>
            <footer>
                <button class="btn" @click="init.resolve">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {};
  }
};
</script>
