using EquipmentMonitoring.Api.Enums;
using EquipmentMonitoring.Api.Services;
using Xunit;

namespace EquipmentMonitoring.Tests;

public class ThresholdEvaluatorTests
{
    [Fact]
    public void Value_above_max_is_a_max_breach() =>
        Assert.Equal(new Breach(BreachKind.Max, 85), ThresholdEvaluator.Evaluate(90, null, 85));

    [Fact]
    public void Value_below_min_is_a_min_breach() =>
        Assert.Equal(new Breach(BreachKind.Min, 30), ThresholdEvaluator.Evaluate(20, 30, 120));

    [Theory]
    [InlineData(85)]   // exactly at max is still safe
    [InlineData(30)]   // exactly at min is still safe
    [InlineData(60)]
    public void Value_inside_range_is_not_a_breach(double v) =>
        Assert.Null(ThresholdEvaluator.Evaluate(v, 30, 85));

    [Fact]
    public void No_limits_never_breach() =>
        Assert.Null(ThresholdEvaluator.Evaluate(9999, null, null));
}
