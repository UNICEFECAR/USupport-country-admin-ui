// Every country admin lives on <country name>.usupport.online (or
// <country name>.staging.usupport.online), unless it has its own subdomain here
const CUSTOM_SUBDOMAINS = {
  XH: "teacher.wellbeing", // Hosn El Hal
};

// usupport.online or staging.usupport.online at the end of a hostname
const ROOT_DOMAIN = /(?:^|\.)((?:staging\.)?usupport\.online)$/;

/**
 * Alpha2 code of the country whose host this is
 *
 * @param {Array<{ alpha2: string, name: string }>} countries
 * @param {string} hostname
 * @returns {string|null}
 */
export const getCountryFromHostname = (
  countries,
  hostname = window.location.hostname
) => {
  const custom = Object.keys(CUSTOM_SUBDOMAINS).find((alpha2) =>
    hostname.startsWith(`${CUSTOM_SUBDOMAINS[alpha2]}.`)
  );
  if (custom) return custom;

  const subdomain = hostname.split(".")[0];
  return (
    countries.find((x) => x.name.toLocaleLowerCase() === subdomain)?.alpha2 ||
    null
  );
};

/**
 * The current URL moved to the country's host, e.g. usupport.online/country-admin
 * -> poland.usupport.online/country-admin. Unknown hosts are left as they are.
 *
 * @param {{ alpha2: string, name: string }} country
 * @param {string} href
 * @returns {string}
 */
export const getCountryUrl = ({ alpha2, name }, href = window.location.href) => {
  const url = new URL(href);
  const root = url.hostname.match(ROOT_DOMAIN)?.[1];
  const subdomain =
    CUSTOM_SUBDOMAINS[alpha2.toUpperCase()] || name?.toLocaleLowerCase();
  if (!root || !subdomain) return href;

  url.hostname = `${subdomain}.${root}`;
  return url.toString();
};
