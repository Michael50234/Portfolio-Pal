import { createTheme } from "@mui/material";

const theme = createTheme({
    typography: {
        fontFamily: '"DM Sans Variable", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiTypography: {
            styleOverrides: {
                root: {
                    color: "var(--text)"
                }
            }
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
                disableRipple: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: "none",
                    fontWeight: 600,
                    padding: "6px 16px",
                    lineHeight: 1.5,
                    transition: "background-color 150ms ease-out, border-color 150ms ease-out",
                    "&.Mui-focusVisible": {
                        outline: "2px solid var(--accent)",
                        outlineOffset: 2,
                    },
                    "@media (prefers-reduced-motion: reduce)": { transition: "none" },
                },

                // Primary: filled accent
                contained: {
                    backgroundColor: "var(--accent)",
                    color: "var(--text)",
                    "&:hover": {
                        backgroundColor: "hsl(36, 51%, 54%)",
                    },
                    "&.Mui-disabled": {
                        backgroundColor: "var(--surface-sunken)",
                        color: "var(--text-muted)",
                    },
                },

                // Secondary: outlined
                outlined: {
                    backgroundColor: "transparent",
                    color: "var(--text)",
                    border: "1px solid var(--border-strong)",
                    "&:hover": {
                        backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)",
                        borderColor: "var(--accent)",
                    },
                    "&.Mui-disabled": {
                        borderColor: "var(--border)",
                        color: "var(--text-muted)",
                    },
                },

                // Tertiary: text only
                text: {
                    color: "var(--text-muted)",
                    "&:hover": {
                        backgroundColor: "var(--surface-sunken)",
                        color: "var(--text)",
                    },
                    "&.Mui-disabled": {
                        color: "var(--text-muted)",
                        opacity: 0.5,
                    },
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    backgroundColor: "var(--surface)",
                    color: "var(--text)",

                    // rest
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "var(--border)",
                        borderWidth: 1,
                        transition: "border-color 150ms ease-out"
                    },
                    // hover: quiet hint that the field is interactive
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "var(--border-strong)"
                    },
                    // focus: same as hover (overrides MUI's default blue 2px border)
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "var(--border-strong)",
                        borderWidth: 1
                    },
                    // error (declared after hover/focus so it wins over both)
                    "&.Mui-error .MuiOutlinedInput-notchedOutline": {
                        borderColor: "var(--losses)"
                    },
                    // disabled
                    "&.Mui-disabled": {
                        backgroundColor: "var(--surface-sunken)"
                    },
                    "&.Mui-disabled .MuiOutlinedInput-input": {
                        WebkitTextFillColor: "var(--text-muted)"
                    },

                    "@media (prefers-reduced-motion: reduce)": {
                        "& .MuiOutlinedInput-notchedOutline": {
                            transition: "none"
                        }
                    }
                }
            }
        }
    }
})

export default theme;