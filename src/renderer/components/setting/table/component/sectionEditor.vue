<template>
    <div class="popupMask dark center setting" @click.self="init.reject(false)">
        <div class="editor">
            <header>
                <template v-if="init.edit">
                    <h5>{{$t('title.edit')}}</h5>
                    <h3>{{init.section.zone}}</h3>
                </template>
                <template v-else>
                    <h5>{{$t('title.create')}}</h5>
                    <h3>{{$t('table.zone')}}</h3>
                </template>
            </header>
            <div class="wrap">
                <inputer title="text.primary" v-model="init.section.usEN"></inputer>
                <inputer title="text.secondary" v-model="init.section.zhCN"></inputer>
                <inputer title="table.zone" v-model="init.section.zone" :disabled="init.edit"></inputer>
            </div>
            <footer>
                <div class="opt">
                    <span class="del" @click="init.reject(true)">{{$t('button.delete')}}</span>
                </div>
                <button class="btn" @click="init.resolve(init.section)" :disabled="!init.section.zone">{{$t('button.confirm')}}</button>
            </footer>
        </div>
    </div>
</template>

<script>
import inputer from "../../common/inputer";
export default {
    props: ["init"],
    components: { inputer }
};
</script>