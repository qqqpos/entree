<template>
    <div class="tables">
        <div class="seat" v-for="(table,index) in tables" :key="index" :class="{available:table.status === 1,unavailable:table.status === 0,select:selected.includes(table.name)}" @click="setTable(table)">
            <span>{{table.name}}</span>
        </div>
    </div>
</template>

<script>
export default {
    props: ['section', 'status'],
    data() {
        return {
            tables: [],
            selected: []
        }
    },
    created() {
        this.tables = JSON.parse(JSON.stringify(this.section.item));
    },
    methods: {
        setTable(table) {
            if (!table._id && table.status !== 1) return;
            let { name } = table;
            let index = this.selected.indexOf(name);
            index === -1 ? this.selected.push(name) : this.selected.splice(index, 1);
            this.$emit("pick", this.selected)
        }
    },
    watch: {
        section() {
            this.tables = JSON.parse(JSON.stringify(this.section.item));
        }
    }
}
</script>

<style scoped>
.tables {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    padding: 10px 32px;
    align-items: flex-start;
}

.seat {
    width: 25px;
    height: 25px;
    line-height: 25px;
    font-weight: bold;
    background: #ECEFF1;
    margin: 6px;
}

.seat.available:hover {
    transform: scale(1.2)
}

.seat.available {
    cursor: pointer;
    background: #CFD8DC;
    transition: transform 0.22s ease;
}

.seat.unavailable {
    background: #ff9800;
}

.seat.select {
    background: #4CAF50!important;
}
</style>