<template>
    <div class="popupMask dark center" @click.self="init.resolve">
        <div class="editor">
            <header>
                <div>
                    <h3>{{$t('title.setDriver')}}</h3>
                    <h5>{{$t('tip.foundRecords',0)}}</h5>
                </div>
            </header>
            <div class="wrap">

            </div>
            <footer>
                <button class="btn">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import dialogModule from "../../common/dialog";

export default {
  propt: ["init"],
  components: { dialogModule },
  data() {
    return {};
  },
  computed: {}
};
</script>

<style scoped>
</style>



