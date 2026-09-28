import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminField, selfOrAdmin } from '../access';

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'User', plural: 'Users' },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7, // a week, so reception is not logged out mid-morning
    maxLoginAttempts: 8,
    lockTime: 10 * 60 * 1000,
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Admin',
    description: 'Who can log in. Editors change content; admins (GYA) also manage users.',
  },
  access: {
    read: selfOrAdmin,
    create: isAdmin,
    update: selfOrAdmin,
    delete: isAdmin,
    // /cms (Payload's own admin) is GYA only. Editors use the /admin dashboard.
    admin: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Editor (practice team)', value: 'editor' },
        { label: 'Admin (GYA)', value: 'admin' },
      ],
      access: { update: isAdminField, create: isAdminField },
      saveToJWT: true,
    },
  ],
};
