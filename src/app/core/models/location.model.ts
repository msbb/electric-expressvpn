interface ExpressvpnLocation {
  alias: string;
  country: string;
  countryCode: string;
  location: string;
  recommended: boolean;
}

interface CountryWithLocations {
  country: string;
  countryWithoutCode: string;
  countryCode: string;
  locations: Array<ExpressvpnLocation>;
}

type LocationsSortedByCountry = Array<CountryWithLocations>;

export { ExpressvpnLocation, LocationsSortedByCountry, CountryWithLocations };
