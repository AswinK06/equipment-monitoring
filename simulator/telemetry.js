const TYPE_PROFILES = {
  generator: { temperature: 78, vibration: 4.8, pressure: 108 },
  compressor: { temperature: 68, vibration: 4.0, pressure: 105 },
  turbine: { temperature: 75, vibration: 3.2, pressure: 110 },
  fan: { temperature: 42, vibration: 1.5, pressure: 50 },
  pump: { temperature: 64, vibration: 2.8, pressure: 92 },
  motor: { temperature: 70, vibration: 3.0, pressure: 98 },
};

const DEFAULT_PROFILE = { temperature: 65, vibration: 3.0, pressure: 90 };

const jitter = (v, k) => v + (Math.random() * 2 - 1) * k;

function getProfile(type = "") {
  const lower = type.toLowerCase();
  const match = Object.keys(TYPE_PROFILES).find((k) => lower.includes(k));
  return match ? TYPE_PROFILES[match] : DEFAULT_PROFILE;
}

function generateIdleReadings(runtimeHours) {
  const temp = +jitter(28, 1.2).toFixed(2);
  const vib = +Math.max(0.01, jitter(0.1, 0.04)).toFixed(2);
  const press = +Math.max(32, jitter(40, 2.0)).toFixed(2);

  return [
    { metric: "temperature", value: temp, unit: "°C" },
    { metric: "vibration", value: vib, unit: "mm/s" },
    { metric: "pressure", value: press, unit: "psi" },
    { metric: "runtime", value: +runtimeHours.toFixed(3), unit: "h" },
  ];
}

function generateActiveReadings(profile, isFaulty, runtimeHours) {
  const spike = Math.random() < 0.03;
  const tempBoost = (isFaulty ? 14 : 0) + (spike ? 12 : 0);
  const vibBoost = (isFaulty ? 2.5 : 0) + (spike ? 2 : 0);

  const temp = +(jitter(profile.temperature, 2.5) + tempBoost).toFixed(2);
  const vib = +Math.max(0, jitter(profile.vibration, 0.5) + vibBoost).toFixed(2);
  const press = +jitter(profile.pressure, 3.5).toFixed(2);

  return [
    { metric: "temperature", value: temp, unit: "°C" },
    { metric: "vibration", value: vib, unit: "mm/s" },
    { metric: "pressure", value: press, unit: "psi" },
    { metric: "runtime", value: +runtimeHours.toFixed(3), unit: "h" },
  ];
}

function generateReadings(equipment, runtimeHours) {
  const status = (equipment.status || "Active").replace(/\s+/g, "");

  if (status === "UnderMaintenance") {
    return null;
  }

  if (status === "Idle") {
    return generateIdleReadings(runtimeHours);
  }

  const profile = getProfile(equipment.type);
  const isFaulty = status === "Faulty";
  return generateActiveReadings(profile, isFaulty, runtimeHours);
}

module.exports = {
  TYPE_PROFILES,
  DEFAULT_PROFILE,
  generateReadings,
};
