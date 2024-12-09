import {AxiosError, AxiosPromise, AxiosRequestConfig} from "axios";
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

    getSession(): Promise<Partial<Session>>;

    storageSession(session: Session): Promise<void>;

    refreshSession(session: Session): Promise<Partial<Session>> | Promise<Record<string, any>> | Promise<any>;

    withAuthentication(request: AxiosRequestConfig, session: Partial<Session>): void;

    checkSession(request: AxiosRequestConfig, session: Partial<Session>): boolean;

    checkResponse(response: Response): boolean;

    onAuthorizedDenied(error: AxiosError): Promise<void>;

    onSessionInvalidated(): void;

    invalidateSession(): Promise<void>;
}