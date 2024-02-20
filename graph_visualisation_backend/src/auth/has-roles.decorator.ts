import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../user/user.entity';

/**
 * Decorator to specify the roles required to access an endpoint.
 * @param roles List of roles required to access the endpoint.
 * @returns A metadata key 'roles' with the specified roles.
 */
export const HasRoles = (...roles: UserRole[]) => SetMetadata('roles', roles);
