/**
 * Predictive Maintenance & Telemetry Analytics Engine
 * Designed for Upstream/Midstream Oil & Gas Rotating Equipment
 */

// Baseline normal thresholds for industrial pumps/compressors
const THRESHOLDS = {
    vibration_rms: { warning: 4.5, critical: 8.0 }, // mm/s
    temperature: { warning: 75.0, critical: 95.0 },  // °C
    pressure_delta: { warning: 15.0, critical: 30.0 } // % deviation
};

function analyzeTelemetry(telemetryData) {
    const { vibration_rms_mms, temperature_c, pressure_psi, flow_rate_bpd } = telemetryData;

    let anomalyFlag = false;
    let failurePrediction = 'NORMAL';
    let penaltyScore = 0;

    // 1. Vibration analysis
    if (vibration_rms_mms >= THRESHOLDS.vibration_rms.critical) {
        anomalyFlag = true;
        penaltyScore += 45;
        failurePrediction = 'Critical Dynamic Unbalance / Bearing Failure';
    } else if (vibration_rms_mms >= THRESHOLDS.vibration_rms.warning) {
        anomalyFlag = true;
        penaltyScore += 20;
        failurePrediction = 'Bearing Wear & Overheating';
    }

    // 2. Temperature analysis
    if (temperature_c >= THRESHOLDS.temperature.critical) {
        anomalyFlag = true;
        penaltyScore += 40;
        if (failurePrediction === 'NORMAL') failurePrediction = 'Severe Thermal Degradation / Lubrication Loss';
    } else if (temperature_c >= THRESHOLDS.temperature.warning) {
        penaltyScore += 15;
        if (failurePrediction === 'NORMAL') failurePrediction = 'Overheating Risk';
    }

    // 3. Pressure/Flow anomaly correlation (Impeller Cavitation / Seal Leakage)
    if (flow_rate_bpd < 10000 && pressure_psi > 1500) {
        anomalyFlag = true;
        penaltyScore += 25;
        if (failurePrediction === 'NORMAL') failurePrediction = 'Impeller Cavitation & Flow Restriction';
    }

    // Calculate Health Index (0 to 100)
    const healthIndex = Math.max(0, Math.min(100, parseFloat((100 - penaltyScore).toFixed(1))));

    // Estimate Remaining Useful Life (RUL) in operating hours
    let estimatedRulHours = 2400.0; // Baseline 100 days
    if (healthIndex < 40) {
        estimatedRulHours = Math.max(12.0, healthIndex * 1.5);
    } else if (healthIndex < 70) {
        estimatedRulHours = healthIndex * 8.0;
    } else if (healthIndex < 90) {
        estimatedRulHours = healthIndex * 20.0;
    }

    return {
        healthIndex,
        anomalyFlag: anomalyFlag ? 1 : 0,
        failurePrediction,
        estimatedRulHours: parseFloat(estimatedRulHours.toFixed(1))
    };
}

module.exports = {
    analyzeTelemetry,
    THRESHOLDS
};
