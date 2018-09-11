<template>
    <div class="popupMask dark center" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <div>
                    <h3>{{$t('title.book')}}</h3>
                    <h5>{{init.book.name || 'Customer'}}'s reservation detail</h5>
                </div>
                <div class="f1"></div>
                <nav>
                    <span class="mini-btn" v-show="book.status === 1">{{$t('button.sms')}}</span>
                </nav>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <section>
                    <h5>{{$t('booking.date')}}</h5>
                    <div class="content text-center">
                        <div class="input-wrap">
                            <i class="far fa-calendar-alt light space"></i>
                            <input type="text" v-model="book.date" placeholder="YYYY-MM-DD">
                        </div> 
                        <div class="input-wrap">
                            <i class="far fa-clock light space"></i>
                            <input type="text" v-model="book.time" placeholder="HH:mm (24 Hours)">
                        </div>                      
                    </div>
                </section>                 
                <section>
                    <h5>{{$t('booking.contact')}}</h5>
                    <div class="content text-center">
                        <div class="input-wrap">
                            <i class="fas fa-phone light space"></i>
                            <input type="text" v-model="book.phone" :placeholder="$t('text.phone')">
                        </div> 
                        <div class="input-wrap">
                            <i class="fas fa-user-friends light space"></i>
                            <input type="text" v-model="book.name" :placeholder="$t('text.name')">
                        </div>                      
                    </div>
                </section>
               <section>
                    <h5>{{$t('booking.request')}}</h5>
                    <div class="content text-center">
                        <textarea v-model="book.note"></textarea>
                    </div>
                </section>                
            </div>
            <footer>
                <div class="opt">
                    <span class="del" @click="removeDialog">{{$t('button.remove')}}</span>
                </div>
                <button class="btn" @click="save" :disabled="book.status === 2">{{$t('button.save')}}</button>
                <button class="btn" @click="checkIn" :disabled="book.status === 2">{{$t('text.checkIn')}}</button>
            </footer>
        </div>
        <div :is="component" :init="componentData"></div>
    </div>
</template>

<script>
import dialogModule from "../../common/dialog";

export default {
  props: ["init"],
  components: { dialogModule },
  data() {
    return {
      book: JSON.parse(JSON.stringify(this.init.book)),
      componentData: null,
      component: null
    };
  },
  methods: {
    edit() {
      this.isEdit = true;
    },
    removeDialog() {
      const prompt = {
        title: "dialog.confirm.remove",
        msg: ["dialog.removeBook",this.book.name || this.$t('nav.customer')],
        buttons: [
          {
            text: "button.cancel",
            fn: "resolve"
          },
          {
            text: "filter.noShows",
            fn: "reject"
          },
          {
            text: "button.remove",
            fn: "remove"
          }
        ]
      };

      this.$dialog(prompt)
        .then(this.exitComponent)
        .catch(remove => {
          if (remove) {
            this.$socket.emit("[BOOK] REMOVE", this.book);
            this.init.resolve();
          } else {
            Object.assign(this.book, { status: 0 });
            this.save();
          }
        });
    },
    save() {
      this.$socket.emit("[BOOK] SAVE", this.book);
      this.init.resolve();
    },
    checkIn() {
      Object.assign(this.book, { status: 2 });
      this.save();
    }
  }
};
</script>


<style scoped>
.wrap {
  width: 480px;
}

.content {
  display: flex;
  justify-content: space-between;
}

textarea {
  width: 450px;
  height: 45px;
  resize: none;
  outline: none;
  border-radius: 2px;
  padding: 7px 10px;
  border: 2px solid #eee;
  font-family: "Yuanti-SC";
  margin: 3px;
}
</style>

