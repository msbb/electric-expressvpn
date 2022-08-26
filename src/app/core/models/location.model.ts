interface ExpressvpnLocation {
  alias: string;
  country: string;
  countryCode: string;
  location: string;
  recommended: boolean;
}

interface LocationsSortedByCountry {
  [key: string]: Array<ExpressvpnLocation>;
}

export { ExpressvpnLocation, LocationsSortedByCountry };
