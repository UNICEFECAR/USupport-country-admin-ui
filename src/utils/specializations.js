export const PEER_SUPPORT = "peer_support";
export const PEER_SUPPORT_DISPLAY_LABEL = "U-FRIEND";

export const BASE_SPECIALIZATION_OPTIONS = [
  "psychologist",
  "psychiatrist",
  "psychotherapist",
];

export const isArmeniaCountry = (country) => country?.toUpperCase() === "AM";

export const getSpecializationOptionValues = (country) => {
  if (isArmeniaCountry(country)) {
    return [...BASE_SPECIALIZATION_OPTIONS, PEER_SUPPORT];
  }

  return [...BASE_SPECIALIZATION_OPTIONS];
};

export const translateSpecializationForDisplay = (t, value) => {
  const key = String(value ?? "").trim();
  if (!key) return "";

  if (key === PEER_SUPPORT) {
    return PEER_SUPPORT_DISPLAY_LABEL;
  }

  return t(key);
};

export const translateSpecializationForEdit = (t, value) => {
  const key = String(value ?? "").trim();
  if (!key) return "";

  if (key === PEER_SUPPORT) {
    return t("peer_support");
  }

  return t(key);
};

/** @deprecated Use translateSpecializationForDisplay or translateSpecializationForEdit */
export const translateSpecialization = translateSpecializationForDisplay;

export const buildSpecializationOptions = (country, t) =>
  getSpecializationOptionValues(country).map((value) => ({
    value,
    label: translateSpecializationForEdit(t, value),
    selected: false,
  }));

export const normalizeSpecializations = (selected) => {
  if (selected.includes(PEER_SUPPORT)) {
    return [PEER_SUPPORT];
  }

  return selected.filter((value) => value !== PEER_SUPPORT);
};

export const getNextSpecializations = (previous, options) => {
  const selected = options
    .filter((option) => option.selected)
    .map((option) => option.value);
  const toggledValue =
    selected.find((value) => !previous.includes(value)) ||
    previous.find((value) => !selected.includes(value));

  if (toggledValue === PEER_SUPPORT) {
    return previous.includes(PEER_SUPPORT) ? [] : [PEER_SUPPORT];
  }

  if (toggledValue) {
    const withoutPeer = previous.filter((value) => value !== PEER_SUPPORT);

    return withoutPeer.includes(toggledValue)
      ? withoutPeer.filter((value) => value !== toggledValue)
      : [...withoutPeer, toggledValue];
  }

  return normalizeSpecializations(selected);
};
