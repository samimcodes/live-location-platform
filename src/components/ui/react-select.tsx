"use client"

import * as React from "react"
import Select, { Props as SelectProps } from "react-select"
import { useTheme } from "next-themes"

export function ReactSelect<
  Option,
  IsMulti extends boolean = false,
  Group extends import("react-select").GroupBase<Option> = import("react-select").GroupBase<Option>
>(props: SelectProps<Option, IsMulti, Group>) {
  const { theme } = useTheme()

  return (
    <Select
      {...props}
      styles={{
        control: (baseStyles, state) => ({
          ...baseStyles,
          backgroundColor: "transparent",
          borderColor: state.isFocused ? "var(--ring)" : "var(--input)",
          boxShadow: state.isFocused ? "0 0 0 1px var(--ring)" : "none",
          borderRadius: "var(--radius)",
          padding: "2px",
        }),
        menu: (baseStyles) => ({
          ...baseStyles,
          backgroundColor: theme === "dark" ? "var(--popover)" : "white",
          color: theme === "dark" ? "var(--popover-foreground)" : "black",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          zIndex: 50,
        }),
        option: (baseStyles, state) => ({
          ...baseStyles,
          backgroundColor: state.isFocused
            ? "var(--accent)"
            : "transparent",
          color: state.isFocused ? "var(--accent-foreground)" : "inherit",
          cursor: "pointer",
        }),
        singleValue: (baseStyles) => ({
          ...baseStyles,
          color: "inherit",
        }),
        ...props.styles,
      }}
      classNamePrefix="react-select"
    />
  )
}
