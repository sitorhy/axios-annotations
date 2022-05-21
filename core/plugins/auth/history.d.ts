export default class SessionHistory {
    add(session): void;

    check(jwt): boolean;

    deprecate(session): void;

    clean(): void;

    isDeprecated(session): boolean;

    size: number;
}