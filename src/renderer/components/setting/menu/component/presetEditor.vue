<template>
    <div class="popupMask setting dark center" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h5>{{$t('title.create')}}</h5>
                <h3>{{$t('text.presetItem')}}</h3>
            </header>
            <div class="wrap">
                <ul>
                    <li v-for="(item,index) in preset" :key="index">
                        <input v-model="item.qty" placeholder="1" class="qty">
                        <input v-model="item.usEN" class="item" :placeholder="$t('text.primary')">
                        <input v-model="item.zhCN" class="item" :placeholder="$t('text.secondary')">
                        <input v-model.number="item.price" placeholder="0.00" class="price">
                        <i class="fa fa-times" @click="remove(index)"></i>
                    </li>
                    <li v-show="preset.length < 10">
                        <span @click="more" class="more">{{$t('button.more')}}</span>
                    </li>
                </ul>
            </div>
            <footer>
                <button class="btn" @click="confirm">{{$t('button.done')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";

export default {
    props: ["init"],
    components: { inputer },
    data() {
        return {
            preset: []
        };
    },
    created() {
        if (Array.isArray(this.init.preset))
            this.preset = this.init.preset.slice()

    },
    methods: {
        more() {
            const item = {
                qty: 1,
                zhCN: "",
                usEN: "",
                price: "0.00"
            }
            this.preset.push(item)
        },
        remove(index) {
            this.preset.splice(index, 1);
        },
        confirm() {
            const preset = this.preset.filter(p => p.usEN).map(p => {
                p.zhCN = p.zhCN || p.usEN;
                return p;
            })

            this.init.resolve(preset);
        }
    }
};
</script>

<style scoped>
li {
  text-align: center;
  margin-bottom: 3px;
}

input {
  width: 100px;
  border: 1px solid #eee;
  border-radius: 2px;
  padding: 2px;
}

.qty {
  width: 20px;
  text-align: center;
}

.price {
  width: 40px;
  text-align: center;
}

i {
  color: #ff5722;
  margin-left: 10px;
  cursor: pointer;
}

.more {
  margin: 10px auto 0;
  display: block;
  width: 50px;
  background: linear-gradient(#fafafa, #eeeeee);
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}
</style>