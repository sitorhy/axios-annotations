export default function RequestWith(cname) {
    return function (target, name, descriptor) {
        if (descriptor) {
            const fn = descriptor.value;
            descriptor.value = function () {
                this.for(name, cname);
                return fn.apply(this, arguments);
            };
        }
    };
}