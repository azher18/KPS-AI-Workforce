// ============================================================================
// KPS AI Workforce - Centralized Role-Based Access Control (RBAC)
// Section 7 & 8 of PRD V2: Centralized permission checks, no duplicated logic.
// ============================================================================

import { Role } from '../types/index.ts';

export type Permission =
  | 'view_calls'
  | 'manage_agents'
  | 'publish_agents'
  | 'manage_billing'
  | 'view_billing'
  | 'invite_members'
  | 'manage_organization'
  | 'manage_knowledge'
  | 'manage_leads'
  | 'manage_appointments'
  | 'manage_integrations'
  | 'manage_platform'
  | 'impersonate_tenant'
  | 'view_audit_logs'
  | 'manage_privacy';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  platform_owner: [
    'view_calls',
    'manage_agents',
    'publish_agents',
    'manage_billing',
    'view_billing',
    'invite_members',
    'manage_organization',
    'manage_knowledge',
    'manage_leads',
    'manage_appointments',
    'manage_integrations',
    'manage_platform',
    'impersonate_tenant',
    'view_audit_logs',
    'manage_privacy'
  ],
  agency_staff: [
    'view_calls',
    'manage_agents',
    'publish_agents',
    'view_billing',
    'manage_organization',
    'manage_knowledge',
    'manage_leads',
    'manage_appointments',
    'view_audit_logs'
  ],
  organization_owner: [
    'view_calls',
    'manage_agents',
    'publish_agents',
    'manage_billing',
    'view_billing',
    'invite_members',
    'manage_organization',
    'manage_knowledge',
    'manage_leads',
    'manage_appointments',
    'manage_integrations',
    'view_audit_logs',
    'manage_privacy'
  ],
  organization_member: [
    'view_calls',
    'manage_leads',
    'manage_appointments',
    'manage_knowledge'
  ]
};

export class AccessControl {
  static hasPermission(role: Role, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  static canViewCalls(role: Role): boolean {
    return this.hasPermission(role, 'view_calls');
  }

  static canManageAgents(role: Role): boolean {
    return this.hasPermission(role, 'manage_agents');
  }

  static canPublishAgents(role: Role): boolean {
    return this.hasPermission(role, 'publish_agents');
  }

  static canManageBilling(role: Role): boolean {
    return this.hasPermission(role, 'manage_billing');
  }

  static canInviteMembers(role: Role): boolean {
    return this.hasPermission(role, 'invite_members');
  }

  static canManageOrganization(role: Role): boolean {
    return this.hasPermission(role, 'manage_organization');
  }

  static canManagePlatform(role: Role): boolean {
    return this.hasPermission(role, 'manage_platform');
  }

  static canManagePrivacy(role: Role): boolean {
    return this.hasPermission(role, 'manage_privacy');
  }
}
