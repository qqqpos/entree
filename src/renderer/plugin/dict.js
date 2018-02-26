import locales from './locales'

const dict = {
    install(Vue, options) {
        Vue.language = 'us-en';
        Vue.locales = locales[Vue.language];
        Vue.mixin({
            methods: {
                $t(text, ...d) {
                    if (!text || !text.includes(".")) return text;
                    let i = 0;
                    let string = text.split('.').reduce((p, c) => p && p[c] || c, Vue.locales);
                    return d ? string.replace(/\{i\}/g, () => d[i++]) : string;
                }
            }
        })

        Vue.prototype.$setLanguage = function (language) {
            switch (language) {
                case 'usEN':
                case 'us-en':
                case 'en':
                    Vue.language = 'us-en';
                    break;
                case "zhCN":
                case "zh-cn":
                case "cn":
                    Vue.language = 'zh-cn';
                    break;
            }
            Vue.locales = locales[Vue.language]
        }
    }
}

export default dict;