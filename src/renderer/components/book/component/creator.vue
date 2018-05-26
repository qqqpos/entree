<template>
    <div class="popupMask dark center setting">
        <div class="editor">
            <header>
                <div>
                    <h5></h5>
                    <h3>{{$t('title.book')}}</h3>
                </div>
            </header>
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
    return {

    };
  },
  methods: {

  }
};
</script>