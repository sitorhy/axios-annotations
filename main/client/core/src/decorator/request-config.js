export default function RequestConfig(config) {
    return function (target, name, descriptor) {
        if (descriptor) {
            const fn = descriptor.value;
            descriptor.value = function () {
                this.configs(name, config);
                return fn.apply(this, arguments);
            };
        } else {
            target.prototype._config = config;
        }
    };
}