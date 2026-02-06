import {localConfig} from '../api/config';
import {useEffect, useMemo, useState} from "react";
import {DemoService} from "../api/test.ts";

const demoService = new DemoService();

export default function BaseInfo() {

    const [packageConfig, setPackageConfig] = useState({});

    const [packageGraph, setPackageGraph] = useState({});

    const packageConfigText = useMemo(() => {
        return JSON.stringify(packageConfig, null, 4);
    }, [packageGraph]);

    const packageGraphText = useMemo(() => {
        return JSON.stringify(packageGraph, null, 4);
    }, [packageGraph]);

    useEffect(() => {
        const controller = new AbortController();

        demoService.getPackageConfig({
            signal: controller.signal
        }).then((response) => {
            setPackageConfig(response.data);
        });

        demoService.getPackageGraph({
            signal: controller.signal
        }).then((response) => {
            setPackageGraph(response.data);
        });

        demoService.getProductInfo({signal: controller.signal}).then((response) => {
            console.log(response.data);
        });

        demoService.getFileInfo({
            fileName: 'product-info.json',
            signal: controller.signal
        }).then((response) => {
            console.log(response.data);
        });

        return function () {
            controller.abort(controller.signal);
        }

    }, []);

    return (
        <div>
            <p>origin: {localConfig.origin}</p>
            <p>baseURL: {localConfig.baseURL}</p>
            <p>getPackageConfig[GET]:</p>
            <p>{packageConfigText}</p>
            <p>getPackageGraph[POST]:</p>
            <p>{packageGraphText}</p>
        </div>
    );
}