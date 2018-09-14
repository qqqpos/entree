<template>
    <div class="tutorial">
        <h2>Learning Center</h2>
        <p class="light">Searching your questions</p>

        <ul>
            <!-- <li><i class="fas fa-question-circle"></i>How to add <b>Credit Card Terminal</b>?</li>
            <li><i class="fas fa-question-circle"></i>How to make a payment?</li>
            <li><i class="fas fa-question-circle"></i>How to add / adjust Tip?</li>
            <li><i class="fas fa-question-circle"></i>How to add employee?</li>
            <li><i class="fas fa-question-circle"></i>How to add printer?</li> -->
            <li @click="getVideo('g1UtIq6ks9Y')"><i class="fas fa-question-circle"></i>How to split a ticket?</li>
            <li @click="getVideo('fMUCAuVneUs')"><i class="fas fa-question-circle"></i>How to customize a receipt ticket?</li>
            <li @click="getVideo('4gPHD7aoxzE')"><i class="fas fa-info-circle"></i>Selling a gift card</li>
            <!-- <li><i class="fas fa-question-circle"></i>How to evenly split a ticket?</li>
            <li><i class="fas fa-info-circle"></i>Selling a gift card</li>
            <li><i class="fas fa-question-circle"></i>Reload a gift card</li>
            <li><i class="fas fa-question-circle"></i>Setup reward program</li>
            <li><i class="fas fa-question-circle"></i>Setup caller id</li>
            <li><i class="fas fa-question-circle"></i>Setup delivery Fees</li>
            <li><i class="fas fa-question-circle"></i>Setup Reward program</li>
            <li><i class="fas fa-info-circle"></i>Store Marketing</li>
            <li><i class="fas fa-info-circle"></i>About rounding methods</li>
            <li><i class="fas fa-info-circle"></i>About your warranty</li> -->
        </ul>
        <div class="popupMask dark center setting" v-if="url" @click="close">
            <iframe width="560" height="315" :src="url" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      url: null
    };
  },
  methods: {
    getVideo(videoId) {
      this.url = `https://www.youtube.com/embed/${videoId}?rel=0&amp;showinfo=0`;
    },
    close() {
      this.url = null;
    }
  }
};
</script>

<style scoped>
.tutorial {
  background: #fafafa;
  padding: 25px;
}

ul {
  margin-top: 25px;
}

li {
  margin-bottom: 5px;
  color: #3c3c3c;
  cursor: pointer;
}

li i {
  margin-right: 10px;
}
</style>
