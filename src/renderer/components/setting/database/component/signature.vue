<template>
    <div class="popupMask dark center setting" @click.self="init.reject">
        <div class="editor">
            <header>
                <div>
                    <h5></h5>
                    <h3>{{$t('title.signature')}}</h3>
                </div>
            </header>
            <div class="wrap">

            </div>
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