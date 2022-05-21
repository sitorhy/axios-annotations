import {AxiosError, AxiosRequestConfig} from "axios";
import SessionStorage from "./storage";
import SessionHistory from "./history";

export interface Session {
    access_token?: string;

    refresh_token?: string;

    token?: string;

    accessToken?: string;

    refreshToken?: string;

    expires_in?: number;

    expiresIn?: number;

    scope?: string;

    token_type?: string;
}

export default class Authorizer {
    sessionKey: string;

    sessionStorage: SessionStorage;

    sessionHistory: SessionHistory;

    getSession(): Promise<Session>;

    storageSession(session: Session): Promise<void>;

    refreshSession(session: Session): Promise<Session>;

    withAuthentication(request: AxiosRequestConfig, session: Session): void;

    checkSession(request: AxiosRequestConfig, session: Session): boolean;

    checkResponse(response: Response): boolean;

    onAuthorizedDenied(error: AxiosError): Promise<void>;
}