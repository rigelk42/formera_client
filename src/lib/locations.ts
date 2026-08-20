import { Country, State } from 'country-state-city'

export interface LocationOption {
  value: string
  label: string
}

// Countries are stored as ISO 3166-1 alpha-2 codes (e.g. "US"), and states
// as their ISO 3166-2 subdivision code (e.g. "CA"), so values here double
// as what gets saved to the address record.
export function getCountryOptions(): LocationOption[] {
  return Country.getAllCountries()
    .map((country) => ({ value: country.isoCode, label: country.name }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export function getStateOptions(countryCode: string | undefined): LocationOption[] {
  if (!countryCode) return []
  return State.getStatesOfCountry(countryCode)
    .map((state) => ({ value: state.isoCode, label: state.name }))
    .sort((a, b) => a.label.localeCompare(b.label))
}
