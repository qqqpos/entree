<template>
    <div class="popupMask dark center setting" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <h5>{{$t(init.edit ? 'title.edit':'title.create')}}</h5>
                <h3>{{$t('title.departments')}}</h3>
            </header>
            <div class="banner"></div>
            <div class="wrap">
                <inputer title="text.primary" v-model.trim="department.usEN" :autoFocus="true"></inputer>
                <inputer title="text.secondary" v-model.trim="department.zhCN"></inputer>
                <inputer title="text.commission" v-model="department.commission" type="number">
                    <i class="fa fa-percent icon"></i>
                </inputer>
                <div class="checkboxes">
                    <checkbox v-model="department.contain" v-for="(category,index) in categories" :title="category" :key="index" :val="category" :multiple="true"></checkbox>
                </div>
            </div>
            <footer>
                <div class="opt">
                    <span class="del" @click="init.reject(true)" v-show="init.edit">{{$t('button.delete')}}</span>
                </div>
                <button class="btn" @click="confirm">{{$t( init.edit ? 'button.save':'button.create')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
import checkbox from "../../common/checkbox";

export default {
  props: ["init"],
  components: { inputer, checkbox },
  data() {
    return {
      department: clone(this.init.department),
      categories: this.init.categories.sort()
    };
  },
  methods: {
    confirm() {
      this.init.resolve(this.department);
    }
  }
};
</script>

<style scoped>
div.checkbox {
  min-width: 120px;
}

.icon {
  position: absolute;
  right: 3px;
  background: #eee;
  padding: 2px 10px 3px;
  color: #455a64;
  border-radius: 2px;
  top: 8px;
}
</style>