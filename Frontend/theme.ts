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