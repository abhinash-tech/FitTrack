import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateBMI, getBMICategory, calculateWeightTrend } from "@fittrack/business-logic";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

interface ProgressMetricsCardProps {
  latestWeight: number;
  previousWeight: number;
  heightCm: number;
}

export function ProgressMetricsCard({
  latestWeight,
  previousWeight,
  heightCm,
}: ProgressMetricsCardProps) {
  const bmi = calculateBMI(latestWeight, heightCm);
  const bmiCategory = getBMICategory(bmi);
  const weightTrend = calculateWeightTrend(latestWeight, previousWeight);

  const renderTrendIcon = () => {
    if (weightTrend.trend === "up") return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (weightTrend.trend === "down") return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Current Weight</span>
          <span className="text-3xl font-bold">{latestWeight ? `${latestWeight} kg` : "--"}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">BMI</span>
          <div className="flex items-center space-x-3">
            <span className="text-xl font-semibold">{bmi ? bmi.toFixed(1) : "--"}</span>
            <Badge className={cn(bmiCategory.colorClass, bmiCategory.textColor)}>
              {bmiCategory.category}
            </Badge>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Weight Trend</span>
          <div className="flex items-center space-x-2">
            <span className="font-semibold">
              {weightTrend.diff > 0 ? "+" : ""}{weightTrend.diff.toFixed(1)} kg
            </span>
            <span className="text-sm text-muted-foreground">
              ({weightTrend.percentage > 0 ? "+" : ""}{weightTrend.percentage.toFixed(1)}%)
            </span>
            {renderTrendIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
