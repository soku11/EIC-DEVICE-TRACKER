import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "#FFFFFF",       // white background
        color: "#1A1A1A",    // dark text
      },
    },
  },

  colors: {
    brand: {
      primary: "#F37321",   // Main orange
      primaryDark: "#D05F1C",
      primaryLight: "#F9A76B",
      white: "#FFFFFF",
      grayLight: "#F3F4F6",
      grayDark: "#2D2D2D",
    },
  },

  components: {
    Button: {
      variants: {
        solid: {
          bg: "brand.primary",
          color: "white",
          _hover: { bg: "brand.primaryDark" },
        },
        outline: {
          borderColor: "brand.primary",
          color: "brand.primary",
          _hover: {
            bg: "brand.primary",
            color: "white",
          },
        },
      },
    },

    Badge: {
      variants: {
        solid: (props) => ({
          bg: props.colorScheme === "orange" ? "brand.primary" : "brand.primary",
          color: "white",
        }),
      },
    },

    Input: {
      baseStyle: {
        field: {
          bg: "brand.grayLight",
          borderColor: "brand.primaryLight",
        },
      },
    },

    Table: {
      baseStyle: {
        th: {
          bg: "brand.grayLight",
          color: "brand.grayDark",
        },
        td: {
          color: "brand.grayDark",
        },
      },
    },
  },
});

export default theme;
