import React from "react";
import { Alert } from "@heroui/react";
import classNames from "classnames";

const CustomAlert = React.forwardRef(
  (
    { title, children, variant = "faded", color = "secondary", className, classNames: customClassNames = {}, ...props },
    ref
  ) => {
    const colorClass = React.useMemo(() => {
      switch (color) {
        case "default":
          return "before:bg-default-300";
        case "primary":
          return "before:bg-primary";
        case "secondary":
          return "before:bg-secondary";
        case "success":
          return "before:bg-success";
        case "warning":
          return "before:bg-warning";
        case "danger":
          return "before:bg-danger";
        default:
          return "before:bg-default-200";
      }
    }, [color]);

    return (
      <Alert
        ref={ref}
        classNames={{
          ...customClassNames,
          base: classNames(
            [
              "bg-default-50 dark:bg-background shadow-sm",
              "border-1 border-default-200 dark:border-default-100",
              "relative before:content-[''] before:absolute before:z-10",
              "before:left-0 before:top-[-1px] before:bottom-[-1px] before:w-1",
              "rounded-l-none border-l-0",
              colorClass,
            ],
            customClassNames.base,
            className
          ),
          mainWrapper: classNames("pt-1", customClassNames.mainWrapper),
          iconWrapper: classNames("dark:bg-transparent", customClassNames.iconWrapper),
          title: classNames("font-semibold", customClassNames.title),
          description: classNames("text-sm text-gray-700", customClassNames.description),
        }}
        color={color}
        title={title}
        variant={variant}
        {...props}
      >
        {children}
      </Alert>
    );
  }
);

CustomAlert.displayName = "CustomAlert";

export default CustomAlert;