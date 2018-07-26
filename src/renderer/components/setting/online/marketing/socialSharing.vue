<template>
    <div>
        <social-sharing url="http://www.qqqpos.com"
            title="Testing"
            description="Hello from Entree POS."
            quote="Vue is a progressive framework for building user interfaces."
            hashtags="Restaurant,DineIn"
            twitter-user="Entree POS"
            inline-template>
            <div>
                <network network="facebook">
                    <i class="fab fa-facebook-square"></i> Facebook
                </network>
                <network network="googleplus">
                    <i class="fab fa-google-plus-square"></i> Google +
                </network>
                <network network="twitter">
                    <i class="fab fa-twitter-square"></i> Twitter
                </network>
                <network network="pinterest">
                    <i class="fab fa-pinterest-square"></i> Pinterest
                </network>
            </div>
        </social-sharing>
    </div>
</template>

<script>
export default {
  data() {
    return {
      tasks: {
        email: false,
        facebook: false,
        googleplus: false,
        twitter: false
        }
    };
  },
  created(){
      this.$root.$on('social_shares_open', this.modalWindowHanlder);
  },
  beforeDestroy(){
      this.$root.$off('social_shares_open', this.modalWindowHanlder)
  },
  methods:{
      modalWindowHandler(network,url){
          console.log(this.$electron.remote.webContents.getAllWebContents())
      }
  }
};
</script>
