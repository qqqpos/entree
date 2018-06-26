<template>
    <div>
      <section>
        <label class="type"><i class="fas fa-user-tag"></i>{{$t('tag.opinion')}}</label>
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
        <label class="type"><i class="fas fa-location-arrow"></i>{{$t('tag.place')}}</label>
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
        <label class="type"><i class="fab fa-adversal"></i>{{$t('tag.other')}}</label>
          <div class="tag">
            <input type="checkbox" name="tag" v-model="tags" value="ad" id="ad">
            <label for="ad">{{$t('tag.ad')}}</label>
          </div>
          <div class="tag">
            <input type="checkbox" name="tag" v-model="tags" value="prank" id="prank">
            <label for="prank">{{$t('tag.prank')}}</label>
          </div>
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
      </section>
      <section>
        <label class="type"><i class="fas fa-allergies"></i>{{$t('tag.allergy')}}</label>
        <div class="tags">
          <div class="tag">
            <input type="checkbox" name="allergy" v-model="allergy" value="MILK" id="milk">
            <label for="milk">{{$t('allergy.MILK')}}</label>
          </div>
          <div class="tag">
            <input type="checkbox" name="allergy" v-model="allergy" value="EGG" id="egg">
            <label for="egg">{{$t('allergy.EGG')}}</label>
          </div>
          <div class="tag">
            <input type="checkbox" name="allergy" v-model="allergy" value="NUTS" id="nuts">
            <label for="nuts">{{$t('allergy.NUTS')}}</label>
          </div>
          <div class="tag">
            <input type="checkbox" name="allergy" v-model="allergy" value="SOY" id="soy">
            <label for="soy">{{$t('allergy.SOY')}}</label>
          </div>
          <div class="tag">
            <input type="checkbox" name="allergy" v-model="allergy" value="WHEAT" id="wheat">
            <label for="wheat">{{$t('allergy.WHEAT')}}</label>
          </div>
          <div class="tag">
            <input type="checkbox" name="allergy" v-model="allergy" value="SHELLFISH" id="shellfish">
            <label for="shellfish">{{$t('allergy.SHELLFISH')}}</label>
          </div>
          <div class="tag">
            <input type="checkbox" name="allergy" v-model="allergy" value="FISH" id="fish">
            <label for="fish">{{$t('allergy.FISH')}}</label>
          </div>

          <div class="tag">
            <input type="checkbox" name="allergy" v-model="allergy" value="GARLIC" id="garlic">
            <label for="garlic">{{$t('allergy.GARLIC')}}</label>
          </div> 
          <div class="tag">
            <input type="checkbox" name="allergy" v-model="allergy" value="CELERY" id="celery">
            <label for="celery">{{$t('allergy.CELERY')}}</label>
          </div>   
          <div class="tag">
            <input type="checkbox" name="allergy" v-model="allergy" value="AVOCADO" id="avocado">
            <label for="avocado">{{$t('allergy.AVOCADO')}}</label>
          </div> 
          <div class="tag">
            <input type="checkbox" name="allergy" v-model="allergy" value="SESAME" id="sesame">
            <label for="sesame">{{$t('allergy.SESAME')}}</label>
          </div>                                       
        </div>          
      </section>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      tags: [],
      allergy: []
    };
  },
  created() {
    this.tags = this.customer.tags || [];
    this.allergy = this.customer.allergy || [];
  },
  methods: {
    updateTag(tags) {
      this.customer._id &&
        this.$socket.emit(
          "[CUSTOMER] UPDATE_TAGS",
          {
            _id: this.customer._id,
            tags
          },
          () => this.setCustomer({ tags })
        );
    },
    updateAllergy(allergy) {
      this.customer._id &&
        this.$socket.emit(
          "[CUSTOMER] UPDATE_ALLERGY",
          {
            _id: this.customer._id,
            allergy
          },
          () => this.setCustomer({ allergy })
        );
    },
    ...mapActions(["setCustomer"])
  },
  computed: {
    ...mapGetters(["customer"])
  },
  watch: {
    tags: "updateTag",
    allergy: "updateAllergy"
  }
};
</script>

<style scoped>
section {
  display: flex;
  padding: 5px 10px 0 10px;
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
  min-width: 50px;
  text-align: center;
  cursor: pointer;
  background: #f5f5f5;
  color: #666;
}

i {
  display: inline-block;
  width: 25px;
}

.tag {
  display: flex;
}

label.type {
  width: 90px;
  color: #3c3c3c;
  font-weight: bold;
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