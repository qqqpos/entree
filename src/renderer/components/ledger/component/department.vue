<template>
    <div>
        <table>
            <thead>
            <tr>
                <th></th>
                <th>{{$t('type.WALK_IN')}}</th>
                <th>{{$t('type.PICK_UP')}}</th>
                <th>{{$t('type.DELIVERY')}}</th>
                <th>{{$t('type.DINE_IN')}}</th>
                <th>{{$t('type.HIBACHI')}}</th>
                <th>{{$t('text.commission')}}</th>
                <th>{{$t('text.subtotal')}}</th>
                <th>{{$t('text.tax')}}</th>
                <th>{{$t('text.total')}}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(department,index) in deps" :key="index">
                <td>{{department[language]}}</td>
                <td>{{department.WALK_IN.subtotal | decimal}}</td>
                <td>{{department.PICK_UP.subtotal | decimal}}</td>
                <td>{{department.DELIVERY.subtotal | decimal}}</td>
                <td>{{department.DINE_IN.subtotal | decimal}}</td>
                <td>{{department.HIBACHI.subtotal | decimal}}</td>
                <td>{{department.commission | decimal}}</td>
                <td>{{department.subtotal | decimal}}</td>
                <td>{{department.tax | decimal}}</td>
                <td>{{department.total | decimal}}</td>
            </tr>
            </tbody>
        </table>
</div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  props: ["transactions", "invoices"],
  computed: {
    ...mapGetters(["departments", "language", "tax"])
  },
  data() {
    return {
      deps: []
    };
  },
  created() {
    this.initialDepartment()
      .then(this.process)
      .catch(this.failed);
  },
  methods: {
    initialDepartment() {
      const departments = JSON.parse(JSON.stringify(this.departments));

      return new Promise(next => {
        this.deps = departments.map(department => {
          Object.assign(department, {
            WALK_IN: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            PICK_UP: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            DELIVERY: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            DINE_IN: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            BUFFET: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            HIBACHI: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            BAR: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            },
            SALES: {
              count: 0,
              subtotal: 0,
              tax: 0,
              discount: 0,
              total: 0
            }
          });

          return department;
        });

        this.deps.push({
          zhCN: this.$t("type.other"),
          usEN: "Other",
          contain: [],

          WALK_IN: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          PICK_UP: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          DELIVERY: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          DINE_IN: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          BUFFET: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          HIBACHI: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          BAR: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          },
          SALES: {
            count: 0,
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0
          }
        });

        next();
      });
    },
    process() {
      const departments = this.deps.map(d => d.contain);
      const last = departments.length - 1;

      this.invoices.forEach(invoice => {
        const { type, status, content, taxFree = false } = invoice;
        if (status) {
          content.forEach(item => {
            const { category, choiceSet, qty, single, taxClass } = item;
            const Tax = this.tax.class[taxClass];

            const index = departments.findIndex(contain =>
              contain.includes(category)
            );

            let tax = 0;
            let subtotal = 0;
            let amount = toFixed(qty * single, 2);

            item.choiceSet.forEach(set => {
              const p = parseFloat(set.single);
              const s = set.qty || 1;
              const t = toFixed(p * s, 2);
              amount = toFixed(amount + t, 2);
            });

            subtotal = toFixed(subtotal + amount, 2);

            if (!taxFree && Tax.apply[type])
              tax += toFixed(Tax.rate / 100 * amount, 2);

            if (index !== -1) {
              let pointer = this.deps[index][type];
              pointer.count += qty;
              pointer.tax += tax;
              pointer.subtotal += subtotal;
              pointer.total += subtotal + tax;
            } else {
              let pointer = this.deps[last][type];
              pointer.count += qty;
              pointer.tax += tax;
              pointer.subtotal += subtotal;
              pointer.total += subtotal + tax;
            }
          });
        }
      });

      this.deps.forEach(department => {
        let subtotal = 0;
        let tax = 0;
        let total = 0;
        Object.keys(department).forEach(key => {
          if (department[key].hasOwnProperty("subtotal"))
            subtotal += department[key].subtotal;

          if (department[key].hasOwnProperty("tax")) tax += department[key].tax;

          if (department[key].hasOwnProperty("total"))
            total += department[key].total;
        });

        Object.assign(department, { subtotal, tax, total });
      });

      this.calculateCommission();

      this.deps.push({
        zhCN: this.$t("report.overallTotal"),
        usEN: "Overall",
        WALK_IN: {
          subtotal: this.deps.reduce((a, c) => a + c.WALK_IN.subtotal, 0)
        },
        PICK_UP: {
          subtotal: this.deps.reduce((a, c) => a + c.PICK_UP.subtotal, 0)
        },
        DELIVERY: {
          subtotal: this.deps.reduce((a, c) => a + c.DELIVERY.subtotal, 0)
        },
        DINE_IN: {
          subtotal: this.deps.reduce((a, c) => a + c.DINE_IN.subtotal, 0)
        },
        HIBACHI: {
          subtotal: this.deps.reduce((a, c) => a + c.HIBACHI.subtotal, 0)
        },
        subtotal: this.deps.reduce((a, c) => a + c.subtotal, 0),
        tax: this.deps.reduce((a, c) => a + c.tax, 0),
        total: this.deps.reduce((a, c) => a + c.total, 0)
      });
    },
    calculateCommission() {
      const departments = JSON.parse(JSON.stringify(this.departments));

      departments.forEach(dep => {
        if (isNumber(dep.commission)) {
          const index = this.deps.findIndex(
            each => each.usEN === dep.usEN && each.zhCN === dep.zhCN
          );

          if (index !== -1) {
            this.deps[index].commission =
              this.deps[index].subtotal * dep.commission / 100;
          }
        }
      });
    }
  }
};
</script>

<style scoped>
table {
  box-shadow: var(--shadow);
  border-radius: 4px;
  overflow: hidden;
}

tr td {
  text-align: center;
  padding: 10px 0;
}

tr th {
  border-bottom: 1px solid #eceff1;
  padding: 5px 0;
  color: rgba(0, 0, 0, 0.75);
}
</style>


