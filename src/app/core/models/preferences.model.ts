enum ExpressvpnPreference {
  autoConnect = 'auto_connect',
  blockTrackers = 'block_trackers',
  desktopNotifications = 'desktop_notifications',
  disableIpv6 = 'disable_ipv6',
  networkLock = 'network_lock',
  preferredProtocol = 'preferred_protocol',
  sendDiagnostics = 'send_diagnostics',
}

type ExpressvpnPreferences = Array<{
  preference: string;
  value: string;
}>;

type NetworkLock = 'off' | 'default';

type PreferredProtocol = 'auto' | 'udp' | 'tcp';

export {
  ExpressvpnPreferences,
  NetworkLock,
  PreferredProtocol,
  ExpressvpnPreference,
};
