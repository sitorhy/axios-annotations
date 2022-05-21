export default class SessionStorage {
    set(key: string, value: any): Promise<void>;

    get(key: string): Promise<any>;

    remove(key: string): Promise<void>;
}