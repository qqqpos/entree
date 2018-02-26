<template>
    <div>
        <header>
            <p class="tip">Online Server</p>
            <h1>Online order server statistic</h1>
            <div class="summary">
                <div>
                    <span class="text">Total order place:</span>
                    <span class="value">0</span>
                </div>
                <div>
                    <span class="text">Total order amount:</span>
                    <span class="value">$0.00</span>
                </div>
                <div>
                    <span class="text">Today order:</span>
                    <span class="value">0</span>
                </div>
                <div>
                    <span class="text">Today order amount:</span>
                    <span class="value">$0.00</span>
                </div>
            </div>
        </header>
    </div>
</template>

<script>
export default {

}
</script>

<style scoped>
header {
    padding: 25px 45px 0;
    background: #eee;
}

.tip {
    font: 18px/1 "Microsoft Yahei";
    color: #404040;
}

h1 {
    color: #37474F;
    font: bold 36px/50px "Microsoft Yahei";
}

.summary {
    color: #666;
    padding: 15px;
}

.summary div {
    display: flex;
}

.text {
    min-width: 100px;
}
</style>