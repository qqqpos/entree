<template>
  <div class="popupMask dark center" @click.self="init.reject">
    <div class="profiles">
      <div class="profile" v-for="(profile,index) in init.customer.profiles" :key="index" @click="select(profile)">
        <i class="fas fa-user-edit" @click.stop="edit(index)"></i>
        <div class="f1">
          <h3 class="name" v-show="profile.name">{{profile.name}}<span class="extension">{{profile.extension}}</span></h3>
          <h4 class="address">{{profile.address}}</h4>
        </div>
        <i class="fa fa-trash" @click.stop="remove(index)"></i>
      </div>
      <div class="profile new" @click="create">
        <i class="fas fa-user-plus"></i>
        <h3>{{$t('button.new')}}</h3>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  props: ["init"],
  methods: {
    select(profile) {
      const customer = Object.assign({}, this.init.customer, profile);

      this.$socket.emit("[CUSTOMER] UPDATE", customer, data => {
        this.setCustomer(data);
        this.init.resolve();
      });
    },
    create() {
      this.emptyCustomerInfo(
        Object.assign({}, this.init.customer, {
          address: "",
          extension: "",
          city: "",
          name: "",
          note: "",
          duration: "",
          distance: "",
          coordinate: [],
          direction: ""
        })
      );

      this.$router.push({ name: "Information" });
      this.init.resolve();
    },
    edit(index) {
      this.init.customer.profiles.splice(index, 1);
      this.init.resolve();
      this.$socket.emit("[CUSTOMER] UPDATE", this.init.customer, () => {
        this.emptyCustomerInfo(this.init.customer);
        this.$router.push({ name: "Information" });
      });
    },
    remove(index) {
      this.init.customer.profiles.splice(index, 1);
      this.$socket.emit("[CUSTOMER] UPDATE", this.init.customer, data =>
        this.setCustomer(data)
      );
    },
    ...mapActions(["setCustomer", "emptyCustomerInfo"])
  }
};
</script>

<style scoped>
.profiles {
  font-size: initial;
  position: absolute;
  top: 32px;
  left: 350px;
  width: 265px;
  padding: 4px 4px 0;
  border-radius: 4px;
  background: linear-gradient(
    rgba(255, 255, 255, 0.45),
    rgba(255, 255, 255, 0.85)
  );
  color: #263238;
  box-shadow: 0px 4px 8px -1px rgba(0, 0, 0, 0.6);
}

.profile {
  background: linear-gradient(to bottom, #fff 0%, #e5e5e5 100%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  margin-bottom: 4px;
  height: 55px;
  display: flex;
  align-items: center;
}

.profile div {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.profile i {
  font-size: 22px;
  cursor: pointer;
  padding: 20px 15px;
  color: var(--deepBlue);
}

.extension{
  margin-left: 10px;
}

h4 {
  font-weight: normal;
  color: #345;
}

h3 {
  color: #3c3c3c;
}

.new {
  justify-content: center;
  padding: initial;
}
</style>