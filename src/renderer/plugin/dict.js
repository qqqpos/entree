import locales from './locales'

const dict = {
    install(Vue, ) {
        Vue.language = 'us-en';
        Vue.locales = locales[Vue.language];
        Vue.mixin({
            methods: {
                $t(text, ...d) {
                    if (!text || !text.includes(".")) return text;
                    let i = 0;
                    const dictionary = locales[Vue.language];
                    const string = text.split('.').reduce((p, c) => p && p[c] || c, dictionary);
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
            Vue.set(Vue.locales, locales[Vue.language])
        }
    }
}

export default dict;