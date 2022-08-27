import { ExpressvpnPreferences } from '../models';

export const preferences: ExpressvpnPreferences = [
  { option: 'auto_connect', options: 'boolean' },
  { option: 'block_trackers', options: 'boolean', reconnectOnChange: true },
  { option: 'desktop_notifications', options: 'boolean' },
  { option: 'disable_ipv6', options: 'boolean', mustBeDisconnected: true },
  {
    option: 'network_lock',
    options: ['off', 'default'],
    mustBeDisconnected: true,
  },
  { option: 'preferred_protocol', options: ['auto', 'udp', 'tcp'] },
];
