import { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const backgroundVariants = cva(
  "rounded-full flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-gray-300",
        success: "bg-emerald-100",
      },
      size: {
        default: "p-2",
        small: "p-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const iconVariants = cva("", {
  variants: {
    variant: {
      default: "text-gray-700",
      success: "text-emerald-700",
    },
    size: {
      default: "h-8 w-8",
      sm: "h-4 w-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type BackgroundVariantsProps = VariantProps<typeof backgroundVariants>;
type IconvariantsProps = VariantProps<typeof iconVariants>;

//@ts-ignore
interface IconBadgeProps extends BackgroundVariantsProps, IconvariantsProps {
  icon: LucideIcon;
}

const IconBadge = ({
  icon: Icon,
  size,
  variant,
}: IconBadgeProps) => {
  return (
    <div className={cn(backgroundVariants({ variant, size }))}>
      <Icon
        //@ts-ignore
        className={cn(iconVariants({ variant, size }))}
      />
    </div>
  );
};

export default IconBadge;
