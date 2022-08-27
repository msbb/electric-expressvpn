type ExpressvpnPreferences = Array<{
  option: string;
  options: 'boolean' | Array<any>;
  value?: string;
  mustBeDisconnected?: boolean;
  reconnectOnChange?: boolean;
}>;

type NetworkLock = 'off' | 'default';

export { ExpressvpnPreferences, NetworkLock };
