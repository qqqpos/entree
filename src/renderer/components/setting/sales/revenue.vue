<template>
    <div>
        <range-tab @update="fetchData" initial="currentWeek"></range-tab>
        <div class="table">
            <table class="data">
                <thead>
                    <tr>
                        <th class="date">{{$t('thead.date')}}</th>
                        <th>{{$t('thead.weeks')}}</th>
                        <th>{{$t('thead.subtotal')}}</th>
                        <th>{{$t('thead.tax')}}</th>
                        <th>{{$t('thead.salesTotal')}}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(ledger,index) in ledgers" :key="index">
                        <td class="date">{{ledger.date}}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
                <tfoot>
                    <!-- <tr>
                        <td colspan="9" class="f1">
                            <div class="summary">
                                <div class="static">
                                    <p class="date"></p>
                                    <p class="field">
                                        <span class="text">{{$t('setting.batchRecord')}}
                                            <span class="value"></span>
                                        </span>
                                        <span class="text">{{$t("text.total")}}
                                            <span class="value"></span>
                                        </span>
                                    </p>
                                </div>
                                <div class="option">

                                </div>
                            </div>
                        </td>
                    </tr> -->
                </tfoot>
            </table>
            <div :is="component" :init="componentData" @refresh="fetchData"></div>
        </div>
    </div>
</template>

<script>
import rangeTab from "../common/rangeTab";
export default {
  components: { rangeTab },
  data() {
    return {
      componentData: null,
      component: null,
      ledgers:[]
    };
  },
  methods: {
    fetchData(range) {

    }
  }
};
</script>