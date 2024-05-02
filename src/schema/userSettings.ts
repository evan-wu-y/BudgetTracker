import { Currencies } from "@/lib/currencies";
import { z } from "zod";

export const UpdateUserSettingsSchema = z.object({
  currency: z.custom((value) => {
    const found = Currencies.find((currency) => currency.value === value);
    if (!found) {
      throw new Error(`Invalid currency: ${value}`);
    }
    return value;
  }),
});
