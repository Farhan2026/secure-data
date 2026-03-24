function cleanText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\0/g, "").slice(0, 20000);
}

function normalizeBoolean(value, defaultValue) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return defaultValue;
}

function parseOptions(rawOptions) {
  if (!rawOptions) {
    return {
      mask: true,
      log_analysis: true,
    };
  }

  if (typeof rawOptions === "string") {
    try {
      const parsed = JSON.parse(rawOptions);
      return {
        mask: normalizeBoolean(parsed.mask, true),
        log_analysis: normalizeBoolean(parsed.log_analysis, true),
      };
    } catch (error) {
      return {
        mask: true,
        log_analysis: true,
      };
    }
  }

  return {
    mask: normalizeBoolean(rawOptions.mask, true),
    log_analysis: normalizeBoolean(rawOptions.log_analysis, true),
  };
}

module.exports = {
  cleanText,
  normalizeBoolean,
  parseOptions,
};
