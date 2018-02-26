<template>
    <div class="popupMask center dark" @click.self="init.reject">
        <div class="about">
            <header>{{$t('text.aboutPOS')}}</header>
            <div class="wrap">

            </div>
        </div>
    </div>
</template>

<script>
export default {
  props: ["init"]
};
</script>
