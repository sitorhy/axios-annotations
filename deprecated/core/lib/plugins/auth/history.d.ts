import {Session} from "./authorizer";

export default class SessionHistory {
    add(session: Session): void;

    check(jwt: string): boolean;

    deprecate(session: Session): void;

    clean(): void;

    isDeprecated(session: Session): boolean;

    size: number;
}