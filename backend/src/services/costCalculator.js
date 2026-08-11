/**
 * Financial Downtime Cost Avoidance Estimator
 * Formula: Avoided Savings = (Downtime Hours Avoided * Revenue Loss Rate/hr) - Preventive Repair Cost
 */

function calculateCostAvoidance(downtimeHoursAvoided, productionLossRateUsdPerHr, repairCostUsd) {
    const grossLossAvoided = downtimeHoursAvoided * productionLossRateUsdPerHr;
    const netSavings = Math.max(0, grossLossAvoided - repairCostUsd);

    return {
        grossLossAvoided: parseFloat(grossLossAvoided.toFixed(2)),
        repairCostUsd: parseFloat(repairCostUsd.toFixed(2)),
        netSavingsUsd: parseFloat(netSavings.toFixed(2)),
        roiPercentage: repairCostUsd > 0 ? parseFloat(((netSavings / repairCostUsd) * 100).toFixed(1)) : 0
    };
}

module.exports = {
    calculateCostAvoidance
};
