<template>
    <div>
      <section>
        <label class="type">{{$t('tag.opinion')}}</label>
        <div class="tags">
          <div class="tag">
            <input type="checkbox" name="tag" v-model="tags" value="goodCustomer" id="goodCustomer">
            <label for="goodCustomer">{{$t('tag.goodCustomer')}}</label>
          </div>
          <div class="tag">
            <input type="checkbox" name="tag" v-model="tags" value="badCustomer" id="badCustomer">
            <label for="badCustomer">{{$t('tag.badCustomer')}}</label>
          </div>
          <div class="tag">
            <input type="checkbox" name="tag" v-model="tags" value="lousyCustomer" id="lousyCustomer">
            <label for="lousyCustomer">{{$t('tag.lousyCustomer')}}</label>
          </div>
          <div class="tag">
            <input type="checkbox" name="tag" v-model="tags" value="impoliteCustomer" id="impoliteCustomer">
            <label for="impoliteCustomer">{{$t('tag.impoliteCustomer')}}</label>
          </div>
        </div>
      </section>
      <section>
        <label class="type">{{$t('tag.place')}}</label>
        <div class="tags">
            <div class="tag">
              <input type="checkbox" name="tag" v-model="tags" value="bar" id="bar">
              <label for="bar">{{$t('tag.bar')}}</label>
            </div>
            <div class="tag">
              <input type="checkbox" name="tag" v-model="tags" value="hotel" id="hotel">
              <label for="hotel">{{$t('tag.hotel')}}</label>
            </div>
            <div class="tag">
              <input type="checkbox" name="tag" v-model="tags" value="school" id="school">
              <label for="school">{{$t('tag.school')}}</label>
            </div>
            <div class="tag">
              <input type="checkbox" name="tag" v-model="tags" value="company" id="company">
              <label for="company">{{$t('tag.company')}}</label>
            </div>
            <div class="tag">
              <input type="checkbox" name="tag" v-model="tags" value="hospital" id="hospital">
              <label for="hospital">{{$t('tag.hospital')}}</label>
            </div>
            <div class="tag">
              <input type="checkbox" name="tag" v-model="tags" value="apartment" id="apartment">
              <label for="apartment">{{$t('tag.apartment')}}</label>
            </div>
        </div>
      </section>
      <section>
        <label class="type">{{$t('tag.class')}}</label>
          <div class="tags">
            <div class="tag">
              <input type="checkbox" name="tag" v-model="tags" value="white" id="white">
              <label for="white">{{$t('tag.white')}}</label>
            </div>
            <div class="tag">
              <input type="checkbox" name="tag" v-model="tags" value="black" id="black">
              <label for="black">{{$t('tag.black')}}</label>
            </div>
            <div class="tag">
              <input type="checkbox" name="tag" v-model="tags" value="asian" id="asian">
              <label for="asian">{{$t('tag.asian')}}</label>
            </div>
            <div class="tag">
              <input type="checkbox" name="tag" v-model="tags" value="mexican" id="mexican">
              <label for="mexican">{{$t('tag.mexican')}}</label>
            </div>
        </div>
      </section>
      <section>
        <label class="type">{{$t('tag.other')}}</label>
          <div class="tag">
            <input type="checkbox" name="tag" v-model="tags" value="farAway" id="farAway">
            <label for="farAway">{{$t('tag.farAway')}}</label>
          </div>
          <div class="tag">
            <input type="checkbox" name="tag" v-model="tags" value="fraud" id="fraud">
            <label for="fraud">{{$t('tag.fraud')}}</label>
          </div>
          <div class="tag">
            <input type="checkbox" name="tag" v-model="tags" value="noService" id="noService">
            <label for="noService">{{$t('tag.noService')}}</label>
          </div>
          <div class="tag">
            <input type="checkbox" name="tag" v-model="tags" value="ad" id="ad">
            <label for="ad">{{$t('tag.ad')}}</label>
          </div>
      </section>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      tags: []
    };
  },
  created() {
    this.tags = this.$store.getters.customer.tags || [];
  },
  beforeDestroy() {
    this.setCustomer({ tags: this.tags });
  },
  methods: {
    ...mapActions(["setCustomer"])
  }
};
</script>

<style scoped>
section {
  display: flex;
  padding: 5px 10px;
  border-bottom: 1px solid #eceff1;
}

section:last-child {
  border-bottom: none;
}

.tag label {
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 2px;
  margin: 0px 5px 5px;
  min-width: 65px;
  text-align: center;
  cursor: pointer;
  background: #fff;
}

.tag {
  display: flex;
}

label.type {
  width: 90px;
  color: #3c3c3c;
}

input:checked + label {
  background: #009688;
  border: 1px solid transparent;
  box-shadow: 0 1px 3px #9e9e9e;
  color: #fff;
}

.class {
  width: 150px;
}

.tags {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
}

input {
  display: none;
}
</style>