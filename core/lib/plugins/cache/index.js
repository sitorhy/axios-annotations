export default function CachePlugin() {
    return function (config) {
        const defaultAdapter = config.axios.defaults.adapter;
        config.axios.defaults.adapter = function (config) {
            return defaultAdapter(config);
        };
    }
}