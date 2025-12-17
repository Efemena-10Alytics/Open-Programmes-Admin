import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateTimePickerProps {
  value?: Date | null;
  onChange: (value: Date | null) => void;
  granularity?: "minute" | "second";
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  granularity = "minute",
}) => {
  return (
    <DatePicker
      selected={value}
      onChange={onChange}
      showTimeSelect
      timeIntervals={granularity === "minute" ? 1 : 5}
      dateFormat={
        granularity === "minute" 
          ? "yyyy-MM-dd HH:mm" 
          : "yyyy-MM-dd HH:mm:ss"
      }
      className="border border-gray-300 rounded-md p-2 w-full"
      wrapperClassName="w-full"
    />
  );
};