<template>
  <div class="profile">
    <section class="info">
      <div class="general">
        <p>
          <span class="since">{{$t('text.firstDate')}}:
            <span class="value">{{customer.firstDate | moment("YYYY-MM-DD")}}</span>
          </span>
          <span class="last">{{$t('text.lastDate')}}:
            <span class="value">{{customer.lastDate | fromNow}}</span>
          </span>
        </p>
        <div class="phone">{{customer.phone | phone}}</div>
        <div class="name">{{customer.name}}</div>
      </div>
      <div class="summary">

      </div>
    </section>
    <section class="tags">
      <span class="text">{{$t('dashboard.tag')}}</span>
      <ul class="wrap">
        <li v-for="(tag,index) in tags" :key="index">
          <input type="checkbox" v-model="customer.tags" :value="tag" :id="'tag'+index">
          <label :for="'tag'+index">{{$t('tag.'+tag)}}</label>
        </li>
      </ul>
    </section>
    <section class="map">
      <img :src="url">
    </section>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  data() {
    return {
      tags: [
        "goodCustomer",
        "badCustomer",
        "farAway",
        "lousyCustomer",
        "fraud",
        "noService",
        "impoliteCustomer",
        "white",
        "black",
        "mexican",
        "asian",
        "bar",
        "hotel",
        "company",
        "hospital"
      ],
      destination: null,
      polyline: null,
      origin: null,
      applied: [],
      route: null,
      url: null
    };
  },
  created() {
    this.getPolyline();
    !this.customer.hasOwnProperty("tags") &&
      Object.assign(this.customer, { tags: [] });
  },
  methods: {
    getPolyline() {
      const { matrix, zipCode } = this.store;
      const { api } = matrix;

      this.origin = `${this.store.address
        .split(" ")
        .join("+")},${this.store.city.split(" ").join("+")}+${
        this.store.state
      }+${zipCode}`;
      this.destination = this.$options.filters
        .formatAddress(this.customer.address)
        .split(" ")
        .join("+");
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${
        this.origin
      }&destination=${this.destination},${this.customer.city
        .split(" ")
        .join("+")}+${
        this.store.state
      }+${zipCode}&mode=driving&key=${api}&language=en&units=imperial`;

      this.$socket.emit("[GOOGLE] GET_POLYLINE", url, response => {
        if (response.statusCode === 200) {
          this.route = JSON.parse(response.body);
          this.polyline = this.route.routes[0].overview_polyline.points;
          this.url = `https://maps.googleapis.com/maps/api/staticmap?scale=1&size=650x250&maptype=roadmap&format=png&path=enc:${
            this.polyline
          }`;
        }
      });
    }
  },
  computed: {
    ...mapGetters(["customer", "store"])
  },
  filters: {
    formatAddress(address) {
      const reg = /\d+(\s+\w+){1,}\s+(?:st(?:\.|reet)?|dr(?:\.|ive)?|pl(?:\.|ace)?|ave(?:\.|nue)?|rd|road|lane|drive|way|court|plaza|square|run|parkway|point|pike|square|driveway|trace|park|terrace|blvd)/i;
      const match = address.match(reg);
      return match ? match[0] : address;
    }
  }
};
</script>

<style scoped>
input[type="checkbox"] {
  display: none;
}
.profile {
  width: 700px;
  padding-bottom: 10px;
}

.general {
  padding: 10px;
}

p {
  color: #3c3c3c;
}

.phone {
  font-family: "Agency FB";
  font-weight: bold;
  font-size: 32px;
  color: #57676f;
}

.value {
  margin-left: 5px;
}

.last {
  margin-left: 25px;
}

section.tags {
  padding: 0 10px 10px;
}

.tags .text {
  font-weight: bold;
  margin: 0 0 5px 15px;
  display: block;
}

ul.wrap {
  display: flex;
  flex-wrap: wrap;
}

li label {
  display: flex;
  padding: 5px;
  width: 69px;
  justify-content: center;
  border: 1px solid #eee;
  margin: 2px;
  background: #fff;
  border-radius: 6px;
  color: #747474;
}

input:checked + label {
  background: #ff9800;
  color: #fff;
  text-shadow: 0 1px 1px #333;
  border: 1px solid transparent;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
}

.map {
  display: flex;
  justify-content: center;
}

.map img {
  min-width: 600px;
  height: 250px;
  border: 6px solid #fff;
  box-shadow: 0 1px 3px #444;
}
</style>