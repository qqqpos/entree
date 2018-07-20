<template>
    <div class="popupMask dark center" @click.self="init.resolve">
        <div class="book">
            <div class="form">
                <header>
                    <h3>{{$t("title.book")}}</h3>
                </header>
                <section>
                    <h5>Date</h5>
                    <div class="content">
                        <p>
                            <i class="far fa-calendar-alt light space"></i>
                            <input type="text" v-model="book.date">
                        </p>
                        <p>
                            <i class="far fa-clock light space"></i>
                            <input type="text" v-model="book.time">
                        </p>                        
                    </div>
                </section>                
                <section>
                    <h5>Type</h5>
                    <div class="content">
                        <input type="radio" name="type" v-model="book.type" value="WALK_IN" id="WALK_IN">
                        <label for="WALK_IN" class="mini-btn"><i class="fas fa-user-friends light space"></i>{{$t('type.WALK_IN')}}</label>
                        <input type="radio" name="type" v-model="book.type" value="PHONE" id="PHONE">
                        <label for="PHONE" class="mini-btn"><i class="fas fa-phone light space"></i>{{$t('type.PHONE')}}</label>
                    </div>
                </section>
                <section>
                    <h5>Party Size</h5>
                    <div class="content">
                        <p>
                            <span>Adult</span>
                        </p>
                        <p>
                            <span>Kid</span>
                        </p>
                        <p>
                            <span>Elder</span>
                        </p>
                    </div>
                </section>
                <section>
                    <h5>Contact Info</h5>
                    <div class="content">
                        <p>
                            <i class="fas fa-phone light space"></i>
                            <input type="text" v-model="book.phone">
                        </p>
                        <p>
                            <i class="fas fa-user-friends light space"></i>
                            <input type="text" v-model="book.name">
                        </p>  
                    </div>
                </section>
                <section>
                    <h5>Special Request</h5>
                    <div class="content">
                        <textarea v-model="book.note"></textarea>
                    </div>
                </section>
            </div>
            <div class="detail">

            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: ["init"],
  data() {
    return {
      book: {
        type: "WALK_IN",
        date: today(),
        time: moment().format("HH:mm"),
        guest: [1, 0, 0],
        seat: null,
        phone: null,
        name: null,
        request: [],
        note: ""
      }
    };
  },
  computed: {
    ...mapGetters(["op", "books"])
  }
};
</script>

<style scoped>
.book {
  display: flex;
  width: 95%;
  height: 650px;
  overflow: hidden;
  margin-top: -42px;
  border-radius: 6px;
  background: #f6f6f6;
}

.form {
  flex: 2;
  overflow: hidden;
  background: #f4f4f4;
  border-right: 1px solid #ddd;
}

.form h3 {
  padding: 20px 0 15px 20px;
  border-bottom: 10px solid #009688;
}

h5 {
  text-indent: 1em;
  margin: 7px 0;
  color: #424242;
}

.content {
  text-align: center;
}

.content p {
  padding: 5px 0;
  font-size: 1.1em;
}

p input {
  background: transparent;
  cursor: pointer;
  border: none;
  outline: none;
  color: #4e626b;
  border-bottom: 1px solid #ccc;
  font-size: 18px;
  width: 200px;
  text-indent: 5px;
}

.content label {
  margin: 4px 6px;
  display: inline-block;
  opacity: 0.5;
}

input:checked + label {
  opacity: 1;
}

.detail {
  flex: 5;
}
</style>

