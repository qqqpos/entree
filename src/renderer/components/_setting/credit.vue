<template>
    <div class="popupMask center">
        <div class="wrap">
            <header>
                <span>Credit</span>
            </header>   
            <div class="inner">
                <ul class="credit">
                    <li>
                        <h1>United POS</h1>
                    </li>
                    <li>
                        <h5>Program Design</h5>
                        <h3>XueWu Huang</h3>
                    </li>
                    <li>
                        <h5>User Interface Design</h5>
                        <h3>XueWu Huang</h3>
                    </li>
                    <li>
                        <h5>Project Manager</h5>
                        <h3>Kevin Din</h3>
                    </li>
                    <li>
                        <h5>Marketing Manager</h5>
                        <h3>XiuQin Liu</h3>
                    </li>
                    <li>
                        <h5>Test Team</h5>
                        <h3>Chris Liu</h3>
                        <h3>Joe Lin</h3>
                        <h3>ChunHao Zheng</h3>
                    </li>
                    <li>
                        <h5>Special Thanks To</h5>
                        <img src="static/image/credit/amano.png" class="store black">
                        <h3 class="restaurant">Amano Sushi</h3>
                        <img src="static/image/credit/hwaYuan.jpg" class="store">
                        <h3 class="restaurant">Hwa Yuan</h3>
                        <img src="static/image/credit/lotusBlue.jpg" class="store">
                        <h3 class="restaurant">Lotus Blue Dongtian Kitchen Bar</h3>
                        <br>
                        <img src="static/image/credit/tokyo.png" class="store">
                        <h3 class="restaurant">Tokyo Asian Kitchen</h3>
                        <h3 class="restaurant">Red 8</h3>
                        <h3 class="restaurant">The Dining Room</h3>
                        <h3 class="restaurant">Super China</h3>
                        <h3 class="restaurant">New Number One Tasty</h3>
                    </li>
                </ul>
            </div>
            <footer>
                <div class="f1">
                    <span class="copyright">Copyright © 2017 UnitedPOS Inc.</span>
                </div>
                <div class="btn" @click="init.resolve">{{$t('button.close')}}</div>
            </footer>
        </div>
    </div>
</template>

<script>
export default {
  props: ["init"],
  data() {
    return {};
  },
  mounted() {
    setTimeout(() => {
      document.querySelector("ul.credit").classList.add("scroll");
    }, 1000);
  }
};
</script>

<style scoped>
.popupMask {
  background: radial-gradient(
    circle at top center,
    rgba(51, 51, 51, 0.85) 0%,
    #111 100%
  );
}

.wrap {
  background: #fff;
  box-shadow: var(--shadow);
  width: 600px;
}

header {
  padding: 5px 10px;
  border-bottom: 1px solid #eceff1;
  background: #fafafa;
  font-weight: bold;
}

footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #eee;
  background: #fcfcfc;
}

.inner {
  overflow: hidden;
  position: relative;
  height: 326px;
}

h1 {
  font-size: 40px;
}

h5 {
  color: #3c3c3c;
}

ul {
  text-align: center;
  top: 100%;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}

ul.scroll {
  animation: credit 40s linear infinite forwards;
}

li {
  margin-bottom: 20px;
}

.f1 {
  display: flex;
  align-items: center;
  padding: 0 15px;
  color: #9e9e9e;
}

.store {
  width: 75px;
  height: 75px;
  border-radius: 50%;
  object-fit: contain;
  border: 3px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.restaurant{
  margin-bottom: 15px;
  color:#111;
}

.black {
  background: #333;
}

@keyframes credit {
  from {
    transform: translate3d(0px, 0%, 0px);
  }
  to {
    transform: translate3d(0px, -130%, 0px);
  }
}
</style>