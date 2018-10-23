<template>
    <transition-group name="fadeUp" mode="out-in">
        <div v-if="query.length !== 0 && items.length == 0" class="bar" key="0">
            <span class="row flex-center">{{query}}</span>
        </div>
        <ul v-if="items.length" key="1">
            <li v-for="(item,index) in items" :key="index" class="item">
                <span class="index text-center">{{index + 1}}</span>
                <span class="f1">{{item[language]}}</span>
            </li>
        </ul>
    </transition-group>
</template>

<script>
export default {
  props: ["query", "items", "language"]
};
</script>

<style scoped>
.bar {
  position: fixed;
  bottom: 390px;
  right: 10px;
  width: 265px;
  display: flex;
  justify-content: center;
}

.row {
  box-shadow: var(--shadow);
  background: #404040;
  border-radius: 3px;
  color: #fff;
  min-width: 100px;
  max-width: 190px;
  overflow: hidden;
  font-size: 18px;
  padding: 10px;
}

ul {
  position: absolute;
  bottom: 387px;
  right: 10px;
  width: 265px;
  padding: 4px 0;
  border-radius: 3px;
  background: rgb(64, 64, 64);
  box-shadow: var(--shadow);
}

li {
  display: flex;
  padding: 3px;
  color: #fff;
}

.index {
  width: 20px;
  text-align: center;
  padding: 0 5px 0 3px;
}
</style>