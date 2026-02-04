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
        demoService.getPackageConfig().then((response) => {
            setPackageConfig(response.data);
        });

        demoService.getPackageGraph().then((response) => {
            setPackageGraph(response.data);
        });

        demoService.getProductInfo().then((response) => {
            console.log(response.data);
        });

        demoService.getFileInfo('product-info.json').then((response) => {
            console.log(response.data);
        });

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