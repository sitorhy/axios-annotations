import {Alert, Button, Spin} from 'antd';
import {authorizer, AuthTestService, OAuthService} from "../api/auth.ts";
import React, {useEffect, useRef, useState} from "react";

const testService = new AuthTestService();
const oauthService = new OAuthService();

const ApiResultDisplay = ({title, loading, data, error}: {
    title: string,
    loading: boolean,
    data: any,
    error: any
}) => {
    let errorMessage = null;
    if (error) {
        const httpCode = error.response?.status;
        const message = error.message || 'Failed to fetch';
        errorMessage = httpCode ? `[${httpCode}] ${message}` : message;
    }

    return (
        <div style={{border: '1px solid #eee', padding: '10px', marginTop: '10px', borderRadius: '5px'}}>
            <h4>{title}</h4>
            {loading && <Spin/>}
            {errorMessage && <Alert message={errorMessage} type="error"/>}
            {data && <pre style={{background: '#f5f5f5', padding: '8px'}}>{JSON.stringify(data, null, 2)}</pre>}
        </div>
    );
};

export default function AuthInfo() {

    const [at, setAt] = useState('');
    const [rt, setRt] = useState('');

    const [api1, setApi1] = useState({loading: false, data: null, error: null});
    const [api2, setApi2] = useState({loading: false, data: null, error: null});
    const [api3, setApi3] = useState({loading: false, data: null, error: null});
    
    // Use useRef to hold abort controllers, so they persist across re-renders
    const apiControllers = useRef<{ [key: string]: AbortController | null }>({ api1: null, api2: null, api3: null });

    async function authPluginTest() {
        const verifier = oauthService.generateVerifier();
        sessionStorage.setItem('code_verifier', verifier);
        const challenge = await oauthService.getCodeChallenge(verifier);
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: 'test-client',
            scope: 'read',
            redirect_uri: 'http://localhost:5173',
            code_challenge: challenge,
            code_challenge_method: 'S256'
        });
        window.location.href = `http://localhost:8080/oauth2/authorize?${params.toString()}`
    }

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const controller = new AbortController();
        const verifier = sessionStorage.getItem('code_verifier');

        if (code && verifier) {
            oauthService.getToken({
                code: code,
                redirect_uri: 'http://localhost:5173',
                code_verifier: verifier,
                signal: controller.signal,
            }).then((response) => {
                const {access_token, refresh_token} = response.data;
                setAt(access_token);
                setRt(refresh_token);
                authorizer.storageSession({access_token, refresh_token}).then(() => {
                    console.log({access_token, refresh_token});
                });
                window.history.replaceState({}, document.title, window.location.pathname);
            }).catch(error => {
                if (error.name !== 'AbortError') console.error("Failed to get token:", error);
            });
        } else {
            authorizer.getSession().then(session => {
                if (session) {
                    setAt(session.access_token);
                    setRt(session.refresh_token);
                }
            });
        }
        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!at) return;

        const scheduleRequest = (
            apiName: string,
            apiSetter: React.Dispatch<any>,
            apiMethod: (signal: AbortSignal) => Promise<any>,
            interval: number
        ) => {
            const execute = () => {
                // Abort previous request if it's still running
                apiControllers.current[apiName]?.abort();
                
                const controller = new AbortController();
                apiControllers.current[apiName] = controller;

                apiSetter({loading: true, data: null, error: null});
                apiMethod(controller.signal)
                    .then(response => {
                        apiSetter({loading: false, data: response.data, error: null});
                    })
                    .catch(error => {
                        if (error.name !== 'AbortError') {
                            apiSetter({loading: false, data: null, error: error});
                        }
                    });
            };

            execute(); // Execute immediately on start
            return setInterval(execute, interval);
        };

        const timers = [
            scheduleRequest('api1', setApi1, testService.api_1, 3000),
            scheduleRequest('api2', setApi2, testService.api_2, 5000),
            scheduleRequest('api3', setApi3, testService.api_3, 7000)
        ];

        // Stop all tests after 10 minutes
        const testDurationTimeout = setTimeout(() => {
            console.log("10-minute test duration finished. Stopping all intervals.");
            timers.forEach(clearInterval);
            Object.values(apiControllers.current).forEach(controller => controller?.abort());
        }, 10 * 60 * 1000);

        // Cleanup function
        return () => {
            console.log("Cleaning up periodic requests.");
            timers.forEach(clearInterval);
            clearTimeout(testDurationTimeout);
            Object.values(apiControllers.current).forEach(controller => controller?.abort());
        };
    }, [at]);

    return (
        <div>
            <Button onClick={authPluginTest} type={'primary'}>授权测试</Button>
            {at ? <p>AccessToken: {at}</p> : null}
            {rt ? <p>RefreshToken: {rt}</p> : null}

            {at && (
                <div style={{marginTop: '20px'}}>
                    <h3>API Call Results (updates every 3/5/7 seconds for 10 mins):</h3>
                    <ApiResultDisplay title="API 1 Result" {...api1} />
                    <ApiResultDisplay title="API 2 Result" {...api2} />
                    <ApiResultDisplay title="API 3 Result" {...api3} />
                </div>
            )}
        </div>
    );
}
