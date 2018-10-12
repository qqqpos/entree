<template>
    <div class="popupMask dark center setting" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <div>
                    <h5>{{$t('title.create')}}</h5>
                    <h3>{{$t('inventory.product')}}</h3>
                </div>
            </header>
            <div class="banner"></div>
            <div class="wrap">

            </div>
            <footer>
                <button class="btn">{{$t('button.confirm')}}</button>
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

