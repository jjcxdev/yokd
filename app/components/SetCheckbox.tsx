import { Checkbox } from "@/components/ui/checkbox";
import { SetCheckboxProps } from "@/types/types";

export function SetCheckbox({ onCheckedChange, setId }: SetCheckboxProps) {
  const handleChange = (checked: boolean) => {
    // Only trigger the callback when the checkbox is checked
    if (checked === true) {
      onCheckedChange(setId);
    }
  };

  return <Checkbox onCheckedChange={handleChange} />;
}
