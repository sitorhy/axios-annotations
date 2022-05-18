import TestService from "./service";

export default async function () {
    const service = new TestService();
    const results = [];

    try {
        const res = await service.hello("world");
        results.push(res.data);
    } catch (e) {
        results.push(e.message);
    }

    try {
        const res = await service.postMessage("hello world", "client");
        results.push(res.data);
    } catch (e) {
        results.push(e.message);
    }

    try {
        const res = await service.postJSON("hello world");
        results.push(res.data);
    } catch (e) {
        results.push(e.message);
    }

    return results;
}