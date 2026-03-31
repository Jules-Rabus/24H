import { z } from "zod";

export const runFormSchema = z
  .object({
    startDate: z.string().min(1, "Date de début requise"),
    endDate: z.string().min(1, "Date de fin requise"),
  })
  .refine((d) => new Date(d.endDate) > new Date(d.startDate), {
    message: "La fin doit être après le début",
    path: ["endDate"],
  });

export type RunFormValues = z.infer<typeof runFormSchema>;

export const batchRunFormSchema = z.object({
  firstHour: z.string().min(1, "Heure de départ requise"),
  lastHour: z.string().min(1, "Heure de fin requise"),
});

export type BatchRunFormValues = z.infer<typeof batchRunFormSchema>;
