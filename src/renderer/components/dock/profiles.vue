<template>
  <div class="popupMask dark center" @click.self="init.reject">
    <div class="profiles">
      <div class="profile" v-for="(profile,index) in init.customer.profiles" :key="index" @click="select(profile)">
        <i class="fa fa-pencil-square" @click.stop="edit(index)"></i>
        <div>
          <h3 class="name">{{profile.name}}</h3>
          <h5 class="address">{{profile.address}}</h5>
        </div>
        <i class="fa fa-trash" @click.stop="remove(index)"></i>
      </div>
      <div class="profile new" @click="create">
        <i class="fa fa-plus"></i>
        <span>{{$t('button.new')}}</span>
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
  width: 300px;
  position: absolute;
  top: 32px;
  left: 350px;
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
  height: 50px;
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
  padding: 15px;
  cursor: pointer;
  color: #666;
}

h5 {
  font-weight: normal;
  color: #666;
}

h3 {
  color: #3c3c3c;
}

.new {
  justify-content: center;
  padding: initial;
}
</style>