<template>
    <div class="menu-wrap">
        <input type="checkbox" id="share">
        <div class="target">
            <label class="share" for="share">分享</label>
            <span class="menu-icon-weibo"><i class="fas fa-times-circle"></i></span>
            <span class="menu-icon-wechat"><i class="fas fa-sync-alt"></i></span>
            <span class="menu-icon-qq"><i class="fas fa-power-off"></i></span>
        </div>
        <svg width="0" height="0">
            <defs>
                <filter id="goo">
                <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
                <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
                </filter>
            </defs>
        </svg>
    </div>
</template>

<style scoped>
.menu-wrap {
  position: fixed;
  bottom: 50px;
  right: 0;
  left:0
}

input {
  position: absolute;
  clip: rect(0 0 0 0);
}

.target {
  width: 250px;
  margin: auto;
  filter: url("#goo");
  text-align: center;
  position: relative;
}

.share {
  display: block;
  width: 54px;
  line-height: 54px;
  color: #fff;
  margin: auto;
  position: relative;
  border-radius: 10px;
  z-index: 1;
  cursor: pointer;
  background-color: #2196f3;
}

[class*="menu-icon-"] {
  position: absolute;
  width: 48px;
  height: 48px;
  background-color: #2196f3;
  border-radius: 4px;
  transition: transform 0.5s;
  top: 8px;
  left: 0;
  right: 0;
  margin: auto;
  -ms-transform: scale(0.5);
  transform: scale(0.5);
}

[class*="menu-icon-"] > i {
  display: block;
  width: 20px;
  height: 20px;
  margin: 16px auto;
  color: #fff;
  cursor: pointer;
}

:checked + .target .menu-icon-weibo {
  transform: scale(1) translate(-70px, 50px);
}
:checked + .target .menu-icon-wechat {
  transform: scale(1) translate(0, 65px);
}
:checked + .target .menu-icon-qq {
  transform: scale(1) translate(70px, 50px);
}
:checked + .target .share {
  animation: sake 1s;
}

@keyframes sake {
  from,
  11.1%,
  to {
    transform: none;
  }
  22.2% {
    transform: skewX(-12.5deg) skewY(-12.5deg);
  }
  33.3% {
    transform: skewX(6.25deg) skewY(6.25deg);
  }
  44.4% {
    transform: skewX(-3.125deg) skewY(-3.125deg);
  }
  55.5% {
    transform: skewX(1.5625deg) skewY(1.5625deg);
  }
  66.6% {
    transform: skewX(-0.78125deg) skewY(-0.78125deg);
  }
  77.7% {
    transform: skewX(0.390625deg) skewY(0.390625deg);
  }
  88.8% {
    transform: skewX(-0.1953125deg) skewY(-0.1953125deg);
  }
}
</style>
