<template>
    <div class="popupMask dark center setting" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <div>
                    <h3>{{$t('text.foodAllergy')}}</h3>
                    <h5>{{$t('tip.foodAllergy')}}</h5>
                </div>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <div class="checkboxes">
                    <checkbox v-model="selected" v-for="(food,index) in allergies" :key="index" :title="$t('allergy.' + food)" :val="food" :multiple="true"></checkbox>
                </div>
            </div>
            <footer>
                <div class="opt">
                    <span class="del" @click="init.reject(true)">{{$t('button.delete')}}</span>
                </div>
                <button class="btn" @click="init.resolve(selected)">{{$t('button.save')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import checkbox from "../../common/checkbox";
export default {
  props: ["init"],
  components: { checkbox },
  data() {
    return {
      allergies: [
        "MILK",
        "EGG",
        "PEANUT",
        "NUTS",
        "WHEAT",
        "SOY",
        "SHELLFISH",
        "FISH",
        "SESAME SEED",
        "AVOCADO",
        "GARLIC",
        "CELERY"
      ],
      selected: []
    };
  },
  created() {
    this.selected = this.init.allergy || [];
  }
};
</script>

