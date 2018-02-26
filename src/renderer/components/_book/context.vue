<template>
    <div class="popupMask" @click.self="init.reject">
        <ul :style="pos">
            <li class="divider" @click="$emit('seat')">
                <i class="fa fa-cutlery"></i>
                <span class="text">{{$t('reservation.seat')}}<span class="name">{{init.book.name}}</span></span>
            </li>
            <li>
                <i class="fa fa-commenting"></i>
                <span class="text">{{$t('reservation.sentSMS')}}</span>
            </li>
            <li @click="$emit('reprint')">
                <i class="fa fa-print"></i>
                <span class="text">{{$t('reservation.reprint')}}</span>
            </li>
            <li class="divider">
                <i class="fa fa-pencil-square"></i>
                <span class="text">{{$t('reservation.edit')}}</span>
            </li>
            <!-- <li>
                <i class="fa fa-paperclip"></i>
                <span class="text">{{$t('reservation.checkIn')}}</span>
            </li> -->
            <li @click="$emit('inactive')" v-if="init.book.status === 1">
                <i class="fa fa-eye-slash"></i>
                <span class="text">{{$t('reservation.inactive')}}</span>
            </li>
            <li @click="$emit('active')" v-else-if="init.book.status === 0">
                <i class="fa fa-eye-slash"></i>
                <span class="text">{{$t('reservation.active')}}</span>
            </li>
            <li @click="$emit('cancel')">
                <i class="fa fa-trash-o"></i>
                <span class="text">{{$t('reservation.cancel')}}</span>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    props: ['init'],
    created() {
        let { top, left } = this.init;
        this.pos = {
            top: top + 'px',
            left: left + 'px'
        }
    },
    data() {
        return {
            pos: {
                top: 0,
                left: 0
            }
        }
    },
    methods: {

    }
}
</script>

<style scoped>
ul {
    position: absolute;
    min-width: 160px;
    background: #fff;
    box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.2);
}

li {
    padding: 10px;
    border-left: 3px solid transparent;
}

li.divider {
    border-bottom: 1px solid #e5e5e5;
}

li i {
    color: rgba(0, 0, 0, .87);
    margin-right: 5px;
    width: 25px;
    text-align: center;
}

li:hover {
    background: #E0E0E0;
    border-left: 3px solid #37474F;
}

.name {
    color: #FF5722;
    margin-left: 5px;
    text-transform: capitalize;
}
</style>