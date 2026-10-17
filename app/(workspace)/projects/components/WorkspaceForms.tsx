import { Box, Stack, useTheme } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";

import Button from "src/components/Button/Button";
import MenuItem from "src/components/FormElementsv2/MenuItem/MenuItem";
import TextField from "src/components/FormElementsv2/TextField/TextField";
import { Text } from "src/components/Typography/Typography";
import { colors } from "src/themeConfig";

import { createProject, templates } from "../demo";
import { Project } from "../types";

import { WorkspaceSelect as Select } from "./WorkspaceSelect";

type Props = {
  mode: "project" | "progress";
  project: Project;
  onClose: () => void;
  onUpdate: (update: Partial<Project>) => void;
  onCreate: (project: Project) => void;
};

export const WorkspaceForms = ({ mode, project, onClose, onUpdate, onCreate }: Props) => {
  const theme = useTheme();
  const form = useFormik<{ name: string; template: string; progress: number; due: string }>({
    initialValues: { name: "", template: templates[0], progress: project.progress, due: project.due },
    validationSchema: yup.object({
      name: mode === "project" ? yup.string().trim().required("Enter a project name").max(100) : yup.string(),
      template: yup.string().oneOf(templates).required(),
      progress: yup.number().required("Enter progress").min(0).max(100).integer(),
      due: yup.string().trim().required("Enter a target delivery date").max(80),
    }),
    onSubmit: (values) => {
      if (mode === "project") onCreate(createProject(values.name.trim(), values.template));
      else {
        onUpdate({ progress: values.progress, due: values.due.trim() });
        onClose();
      }
    },
  });
  return (
    <Box
      component="form"
      onSubmit={form.handleSubmit}
      sx={{
        border: "1px solid",
        borderColor: "primary.main",
        borderRadius: "12px",
        p: 3,
        mb: 3,
        bgcolor: colors.gray800,
      }}
    >
      <Text size="large" color={colors.white}>
        {mode === "project" ? "Start with a solid foundation." : "Update project progress"}
      </Text>
      <Text color={colors.gray400} weight="regular" sx={{ mt: "8px" }}>
        Saved in this preview only. Changes reset when you refresh.
      </Text>
      <Stack gap={2} sx={{ my: 2 }}>
        {mode === "project" ? (
          <>
            <TextField
              label="Project name"
              name="name"
              value={form.values.name}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              error={!!form.touched.name && !!form.errors.name}
              helperText={form.touched.name ? form.errors.name : ""}
            />
            <Text color={colors.white} component="label" htmlFor="project-template">
              Project template
            </Text>
            <Select
              id="project-template"
              name="template"
              value={form.values.template}
              onChange={form.handleChange}
              inputProps={{ "aria-label": "Project template" }}
            >
              {templates.map((template) => (
                <MenuItem key={template} value={template}>
                  {template}
                </MenuItem>
              ))}
            </Select>
          </>
        ) : (
          <>
            <TextField
              label="Progress (%)"
              name="progress"
              type="number"
              inputProps={{ min: 0, max: 100 }}
              value={form.values.progress}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              error={!!form.touched.progress && !!form.errors.progress}
              helperText={form.touched.progress ? form.errors.progress : ""}
            />
            <TextField
              label="Target delivery date"
              name="due"
              value={form.values.due}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              error={!!form.touched.due && !!form.errors.due}
              helperText={form.touched.due ? form.errors.due : ""}
            />
          </>
        )}
      </Stack>
      <Stack direction="row" gap={1}>
        <Button variant="contained" bgColor={theme.palette.primary.main} type="submit">
          {mode === "project" ? "Create preview project" : "Save progress"}
        </Button>
        <Button fontColor={colors.gray400} onClick={onClose}>
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};
