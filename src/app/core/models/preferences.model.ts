type ExpressvpnPreferences = Array<{
  option: string;
  options: 'boolean' | Array<any>;
  value?: string;
  mustBeDisconnected?: boolean;
  reconnectOnChange?: boolean;
}>;

export { ExpressvpnPreferences };
