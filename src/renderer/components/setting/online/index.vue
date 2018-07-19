<template>
    <div class="wrap">
        <h1>计算您可节省的网络订单费用</h1>
        <p>快速评估您的使用方式在 Entree POS 上所需的费用。与其他网络订单提供商相比, 我们在易用以及价格方面更优。请查看我们针对不同类型餐馆的费用计算器来评估您自己的情况。</p>
        <ul>
            <li v-for="(plan,index) in plans" :key="index"></li>
        </ul>
    </div>
</template>

<script>
export default {
  data() {
    return {
      plans: [
        {
          type: "Beyound Menu",
          cost: 0,
          save: 0,
          difference: 0,
          adventage: [],
          disadvantage: [],
          link: ""
        },
        {
          type: "Grubhub",
          cost: 0,
          save: 0,
          difference: 0,
          adventage: [],
          disadvantage: [],
          link: ""
        },
        {
          type: "Entree POS",
          cost: 0,
          save: 0,
          difference: 0,
          adventage: [],
          disadvantage: [],
          link: ""
        }
      ]
    };
  }
};
</script>

<style scoped>
.wrap {
  padding: 15px;
  background: rgba(246, 246, 246, 0.8);
}

h1 {
  font-weight: 300;
  font-size: 40px;
  color: #424242;
}

p {
  font-weight: 400;
  font-size: 14px;
  color: #4a5960;
  margin-top: 15px;
}
</style>


