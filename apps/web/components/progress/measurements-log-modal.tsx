"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BodyMeasurementSchema } from "@fittrack/validation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { logBodyMeasurement } from "@/app/actions/progress";
import { z } from "zod";

type BodyMeasurementFormValues = z.infer<typeof BodyMeasurementSchema>;

export function MeasurementsLogModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BodyMeasurementFormValues>({
    resolver: zodResolver(BodyMeasurementSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      waist_cm: null,
      chest_cm: null,
      arms_cm: null,
      thighs_cm: null,
    }
  });

  const onSubmit = async (data: BodyMeasurementFormValues) => {
    try {
      await logBodyMeasurement(data);
      toast({
        title: "Success",
        description: "Measurements logged successfully.",
      });
      reset();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log measurements.",
        variant: "error",
      });
    }
  };

  const toNumberOrNull = (value: string | number) => {
    if (value === "" || value === null || value === undefined) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Log Measurements</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Body Measurements</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="waist_cm">Waist (cm)</Label>
              <Input
                id="waist_cm"
                type="number"
                step="0.1"
                {...register("waist_cm", { setValueAs: toNumberOrNull })}
              />
              {errors.waist_cm && (
                <p className="text-sm text-red-500">{errors.waist_cm.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="chest_cm">Chest (cm)</Label>
              <Input
                id="chest_cm"
                type="number"
                step="0.1"
                {...register("chest_cm", { setValueAs: toNumberOrNull })}
              />
              {errors.chest_cm && (
                <p className="text-sm text-red-500">{errors.chest_cm.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="arms_cm">Arms (cm)</Label>
              <Input
                id="arms_cm"
                type="number"
                step="0.1"
                {...register("arms_cm", { setValueAs: toNumberOrNull })}
              />
              {errors.arms_cm && (
                <p className="text-sm text-red-500">{errors.arms_cm.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="thighs_cm">Thighs (cm)</Label>
              <Input
                id="thighs_cm"
                type="number"
                step="0.1"
                {...register("thighs_cm", { setValueAs: toNumberOrNull })}
              />
              {errors.thighs_cm && (
                <p className="text-sm text-red-500">{errors.thighs_cm.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...register("date")}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Logging..." : "Log Measurements"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
