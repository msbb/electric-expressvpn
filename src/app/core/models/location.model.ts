interface ExpressvpnLocation {
  alias: string;
  country: string;
  countryCode: string;
  location: string;
  recommended: boolean;
}

type LocationsSortedByCountry = Array<{
  country: string;
  countryWithoutCode: string;
  countryCode: string;
  locations: Array<ExpressvpnLocation>;
}>;

export { ExpressvpnLocation, LocationsSortedByCountry };
