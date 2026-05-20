export enum AlertType {
    Success,
    Error,
    Info,
    Warning
}

export interface AlertOptions {
    id?: string;
    autoClose?: boolean;
    keepAfterRouteChange?: boolean;
}

export class Alert implements AlertOptions {
    id?: string;
    autoClose?: boolean;
    keepAfterRouteChange?: boolean;
    fade?: boolean;
    type!: AlertType;
    message!: string;

    constructor(init?: Partial<Alert>) {
        Object.assign(this, init);
    }
}
