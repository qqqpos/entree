<template>
  <div>
    <toggle title="setting.giftcard.expire" v-model="giftcard.expire">
      <transition name="dropdown">
        <div v-if="giftcard.expire" class="opt">
          <selector title="setting.giftcard.period" v-model="giftcard.period" :opts="periodOpts"></selector>
        </div>
      </transition>
    </toggle>
    <toggle title="setting.giftcard.bonus" v-model="giftcard.bonus">
      <transition name="dropdown">
        <div v-if="giftcard.bonus" class="opt">
          
        </div>
      </transition>
    </toggle>
  </div>
</template>

<script>
import toggle from "../common/toggle";
import inputer from "../common/inputer";
import switches from "../common/switches";
import selector from "../common/selector";

export default {
  components: { toggle, switches, inputer,selector },
  data() {
    return {
      giftcard: this.$store.getters.store.giftcard,
      periodOpts:[{
        label:this.$t('card.lifetime'),
        tooltip:'',
        value:0
      },{
        label:this.$t('card.periodYears',1),
        tooltip:'',
        value:1
      },{
        label:this.$t('card.periodYears',2),
        tooltip:'',
        value:2
      },{
        label:this.$t('card.periodYears',3),
        tooltip:'',
        value:3
      },{
        label:this.$t('card.periodYears',4),
        tooltip:'',
        value:4
      },{
        label:this.$t('card.periodYears',5),
        tooltip:'',
        value:5
      }]
    };
  },
  methods: {

  }
};
</script>