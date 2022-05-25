import AuthTestService from "./auth-service";

export default async function (channel, marker) {
    const service = new AuthTestService();

    try {
        if (channel === "channel1") {
            const res = await service.channel1(marker);
            return res.data;
        } else {
            const res = await service.channel2(marker);
            return res.data;
        }
    } catch (e) {
        return {
            error: (e.response ? `[${e.response.status}] ` : "") + e.message
        }
    }
}