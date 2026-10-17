import { ComponentProps } from "react";

import Select from "src/components/FormElementsv2/Select/Select";
import { colors } from "src/themeConfig";

export const WorkspaceSelect = (props: ComponentProps<typeof Select>) => (
  <Select
    {...props}
    sx={{ bgcolor: colors.gray900, color: colors.white, ...props.sx }}
    MenuProps={{
      sx: {
        "& .MuiPaper-root": { bgcolor: colors.workspacePanel, color: colors.white },
        "& .MuiMenuItem-root": { color: colors.white },
        "& .MuiMenuItem-root.Mui-selected": { bgcolor: `${colors.workspaceBorder} !important` },
      },
    }}
  />
);
