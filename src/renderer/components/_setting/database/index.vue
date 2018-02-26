<template>
    <div>
        <header>
            <p class="tip">{{status.db}}</p>
            <h1>{{$t('title.databaseHealth')}}</h1>
            <div class="summary">
                <div>
                    <span class="text">{{$t('database.dataSize')}}</span>
                    <span class="value">{{status.dataSize | mb}}</span>
                </div>
                <div>
                    <span class="text">{{$t('database.storageSize')}}</span>
                    <span class="value">{{status.storageSize | mb}}</span>
                </div>
                <div>
                    <span class="text">{{$t('database.objects')}}</span>
                    <span class="value">{{status.objects}}</span>
                </div>
                <div>
                    <span class="text">{{$t('database.averageSize')}}</span>
                    <span class="value">{{status.avgObjSize | kb}}</span>
                </div>
            </div>
        </header>
    </div>
</template>

<script>
export default {
  data() {
    return {
      status: {}
    };
  },
  created() {
    this.$socket.emit("[DB] STATUS", data => {
      this.status = data;
    });
  },
  filters: {
    mb(value) {
      return value ? (value / 1024 / 1024).toPrecision(4) + " MB" : value;
    },
    kb(value) {
      return value ? (value / 1024).toPrecision(4) + " KB" : value;
    }
  }
};
</script>

<style scoped>
header {
  padding: 20px 40px 0;
  background: #eee;
  border-bottom: 1px solid #eee;
}

.tip {
  font: 18px/1 "Microsoft Yahei";
  color: #37474f;
  height: 18px;
}

h1 {
  color: #37474f;
  font: bold 36px/50px "Microsoft Yahei";
}

.summary {
  color: #666;
  padding: 10px 30px;
}

.summary div {
  display: flex;
}

.text {
  min-width: 100px;
}
</style>