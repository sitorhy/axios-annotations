export default function RequestConfig(config) {
    return function (target) {
        target.prototype._config = config;
    };
}