import { Role } from './role';

export { Role };

export interface Account {
    id: string;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    jwtToken?: string;
    refreshToken?: string;
    isVerified: boolean;
    password?: string;
    resetToken?: string;
    isDeleting?: boolean;
}
