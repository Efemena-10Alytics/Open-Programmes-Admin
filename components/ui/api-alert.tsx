import React from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Copy, Server } from "lucide-react";
import { Badge, BadgeProps } from "./badge";
import { Button } from "./button";
import { toast } from "sonner";


interface ApiAlertprops {
  title: string;
  description: string;
  variant: "public" | "admin";
}

const textMap: Record<ApiAlertprops["variant"], BadgeProps["variant"]> = {
  //@ts-expect-error
    public: "Public", admin: "Admin",
};

const variantMap: Record<ApiAlertprops["variant"], string> = {
  public: "secondary",
  admin: "destructive",
};

const ApiAlert: React.FC<ApiAlertprops> = ({
  title,
  description,
  variant = "public",
}) => {

  const onCopy = () => {
    navigator.clipboard.writeText(description);
    toast.success("Api route copied to the clipboard");
  };

  return (
    <Alert>
      <Server className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-x-2">
        {title}
        <Badge
          //@ts-ignore
          variant={variantMap[variant]}
        >
          {textMap[variant]}
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-4 flex items-center justify-between">
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
          {description}
        </code>
        <Button variant={"outline"} size={"icon"} onClick={onCopy}>
          <Copy className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ApiAlert;
