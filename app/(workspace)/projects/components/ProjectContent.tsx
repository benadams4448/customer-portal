import { useState } from "react";
import { Box, Stack, useTheme } from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";

import Button from "src/components/Button/Button";
import MenuItem from "src/components/FormElementsv2/MenuItem/MenuItem";
import TextField from "src/components/FormElementsv2/TextField/TextField";
import { Text } from "src/components/Typography/Typography";
import { colors } from "src/themeConfig";
import getSafeExternalURL from "src/utils/getSafeExternalURL";

import type { WorkspaceTab } from "../page";
import { Project, WorkspaceRole } from "../types";

import { WorkspaceSelect as Select } from "./WorkspaceSelect";

const panel = { bgcolor: colors.gray800, border: `1px solid ${colors.gray700}`, borderRadius: "12px", p: 3 };
const folders = ["All files", "Requirements", "Design", "Deliverables"];
const labels = ["All threads", "General", "Design", "Requirements"];
type Props = {
  tab: WorkspaceTab;
  project: Project;
  updateProject: (update: Partial<Project>) => void;
  search: string;
  canManage: boolean;
  canContribute: boolean;
  role: WorkspaceRole;
  initialDiscussionFilter?: "All threads" | "Open requests" | "Unread";
};

const CommentForm = ({ onSubmit, disabled }: { onSubmit: (value: string) => void; disabled: boolean }) => {
  const theme = useTheme();
  const form = useFormik<{ comment: string }>({
    initialValues: { comment: "" },
    validationSchema: yup.object({
      comment: yup.string().trim().required("Write a comment first").max(4000, "Keep comments under 4,000 characters"),
    }),
    onSubmit: (values) => {
      if (disabled) return;
      onSubmit(values.comment.trim());
      form.resetForm();
    },
  });
  return (
    <Stack component="form" onSubmit={form.handleSubmit} gap={1.5} sx={{ mt: 2 }}>
      <TextField
        label="Comment"
        name="comment"
        multiline
        minRows={2}
        value={form.values.comment}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        error={!!form.touched.comment && !!form.errors.comment}
        helperText={form.touched.comment ? form.errors.comment : ""}
        disabled={disabled}
      />
      <Button
        type="submit"
        variant="contained"
        bgColor={theme.palette.primary.main}
        disabled={disabled}
        disabledMessage="Read-only members can view comments but cannot post."
        sx={{ alignSelf: "flex-start" }}
      >
        Post comment
      </Button>
    </Stack>
  );
};

const OrganizationDetails = ({ canManage }: { canManage: boolean }) => {
  const theme = useTheme();
  const [saved, setSaved] = useState(false);
  const form = useFormik<{
    name: string;
    email: string;
    location: string;
    address: string;
    notes: string;
    invoice: string;
  }>({
    initialValues: {
      name: "Acme Studio",
      email: "hello@example.com",
      location: "Austin, Texas",
      address: "123 Example Street",
      notes: "Primary contact: Jamie Davis. Please include the project lead in milestone reviews.",
      invoice: "Paid",
    },
    validationSchema: yup.object({
      name: yup.string().trim().required("Enter an organization name").max(150),
      email: yup.string().email("Enter a valid email").required("Enter a contact email"),
      location: yup.string().max(150),
      address: yup.string().max(500),
      notes: yup.string().max(4000),
      invoice: yup.string().oneOf(["Paid", "Unpaid", "Pending"]).required(),
    }),
    onSubmit: () => {
      if (canManage) setSaved(true);
    },
  });
  return (
    <Box component="form" onSubmit={form.handleSubmit} sx={panel}>
      <Text size="large" color={colors.white}>
        Organization profile
      </Text>
      <Text color={colors.gray400} weight="regular" sx={{ mt: "8px" }}>
        Shared context for your team. Sample information only.
      </Text>
      <Stack gap={2} sx={{ my: 3 }}>
        {(["name", "email", "location", "address", "notes"] as const).map((name) => (
          <TextField
            key={name}
            label={
              {
                name: "Organization name",
                email: "Contact email",
                location: "Location",
                address: "Address",
                notes: "Shared notes",
              }[name]
            }
            name={name}
            value={form.values[name]}
            onChange={(event) => {
              setSaved(false);
              form.handleChange(event);
            }}
            onBlur={form.handleBlur}
            disabled={!canManage}
            multiline={name === "notes"}
            error={!!form.touched[name] && !!form.errors[name]}
            helperText={form.touched[name] ? form.errors[name] : ""}
          />
        ))}
        <Text color={colors.white} component="label" htmlFor="invoice-status">
          Invoice status (no payment card details)
        </Text>
        <Select
          id="invoice-status"
          name="invoice"
          value={form.values.invoice}
          onChange={(event) => {
            setSaved(false);
            form.handleChange(event);
          }}
          disabled={!canManage}
          inputProps={{ "aria-label": "Invoice status" }}
        >
          {["Paid", "Unpaid", "Pending"].map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </Select>
      </Stack>
      <Button
        variant="contained"
        bgColor={theme.palette.primary.main}
        type="submit"
        disabled={!canManage}
        disabledMessage="An organization administrator can edit this profile."
      >
        Save preview profile
      </Button>
      {saved ? (
        <Text role="status" color={colors.success200} sx={{ mt: "16px" }}>
          Profile updated for this preview. Changes reset when you leave this view.
        </Text>
      ) : null}
    </Box>
  );
};

export const ProjectContent = ({
  tab,
  project,
  updateProject,
  search,
  canManage,
  canContribute,
  role,
  initialDiscussionFilter = "All threads",
}: Props) => {
  const theme = useTheme();
  const [filter, setFilter] = useState("All files");
  const [label, setLabel] = useState<string>(initialDiscussionFilter);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const link = useFormik<{ title: string; url: string; folder: string }>({
    initialValues: { title: "", url: "", folder: "Requirements" },
    validationSchema: yup.object({
      title: yup.string().trim().required("Enter a title").max(120),
      url: yup
        .string()
        .trim()
        .url("Enter a complete document URL")
        .test(
          "safe-url",
          "Use a secure HTTPS link",
          (value) => !!value && !!getSafeExternalURL(value) && value.startsWith("https://")
        )
        .required("Enter a document link"),
      folder: yup.string().oneOf(folders.slice(1)).required(),
    }),
    onSubmit: (values) => {
      if (!canContribute) return;
      updateProject({
        documents: [
          ...project.documents,
          {
            id: crypto.randomUUID(),
            title: values.title.trim(),
            url: getSafeExternalURL(values.url.trim()),
            kind: "External link",
            folder: values.folder,
            comments: [],
          },
        ],
      });
      link.resetForm();
      setAdding(false);
    },
  });
  const thread = useFormik<{ title: string; body: string; label: string }>({
    initialValues: { title: "", body: "", label: "General" },
    validationSchema: yup.object({
      title: yup.string().trim().required("Enter a thread title").max(160),
      body: yup.string().trim().required("Write your message").max(6000),
      label: yup.string().oneOf(labels.slice(1)).required(),
    }),
    onSubmit: (values) => {
      if (!canContribute) return;
      updateProject({
        discussions: [
          {
            id: crypto.randomUUID(),
            title: values.title.trim(),
            body: values.body.trim(),
            label: values.label,
            author: "Jamie Davis",
            replies: [],
            unread: false,
            resolved: false,
          },
          ...project.discussions,
        ],
      });
      thread.resetForm();
      setAdding(false);
    },
  });
  const document = project.documents.find((item) => item.id === selectedDocument);
  const discussion = project.discussions.find((item) => item.id === selectedThread);
  const matches = (value: string) => value.toLowerCase().includes(search.toLowerCase());

  if (tab === "Organization") return <OrganizationDetails canManage={!!canManage && role !== "Project admin"} />;
  if (tab === "People")
    return (
      <Box sx={panel}>
        <Stack direction="row" justifyContent="space-between" gap={2}>
          <Box>
            <Text size="large" color={colors.white}>
              The people behind your project
            </Text>
            <Text color={colors.gray400} weight="regular" sx={{ mt: "8px" }}>
              A shared directory with clearly defined responsibilities.
            </Text>
          </Box>
          <Button
            disabled
            disabledMessage="Email invitations need an identity service and organization-level authorization before they can be sent."
            fontColor={colors.gray400}
          >
            + Invite people
          </Button>
        </Stack>
        {[
          ["Jamie Davis", "Client · Acme Studio", "Project admin"],
          ["Emma Wilson", "Internal · All organizations", "Customer success manager"],
          ["Alex Morgan", "Internal · Acme Studio", "Assigned organization manager"],
          ["Sam Taylor", "Internal · Shared on this project", "Project collaborator"],
        ]
          .filter((person) => matches(person.join(" ")))
          .map(([name, scope, memberRole]) => (
            <Stack
              key={name}
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              gap={1}
              sx={{ mt: 3, pt: 2, borderTop: `1px solid ${colors.gray700}` }}
            >
              <Box>
                <Text color={colors.white}>{name}</Text>
                <Text color={colors.gray400} size="xsmall" weight="regular" sx={{ mt: "4px" }}>
                  {scope}
                </Text>
              </Box>
              <Text color={colors.gray400}>{memberRole}</Text>
            </Stack>
          ))}
        <Text color={colors.gray400} size="xsmall" weight="regular" sx={{ mt: "24px" }}>
          Role switching previews the controls only. Production access must be enforced by the server on every request.
        </Text>
      </Box>
    );

  if (tab === "Documents") {
    const visible = project.documents.filter(
      (item) => (filter === "All files" || item.folder === filter) && matches(item.title)
    );
    return (
      <Stack gap={3}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
          <Stack direction="row" gap={0.5} flexWrap="wrap">
            {folders.map((folder) => (
              <Button
                key={folder}
                onClick={() => setFilter(folder)}
                aria-pressed={filter === folder}
                fontColor={filter === folder ? colors.white : colors.gray400}
                sx={{
                  bgcolor: filter === folder ? "primary.main" : "transparent",
                  "&:hover": { bgcolor: filter === folder ? "primary.main" : colors.gray700, color: colors.white },
                }}
              >
                {folder}
              </Button>
            ))}
          </Stack>
          <Stack direction="row" gap={1}>
            <Button
              disabled
              disabledMessage="Secure file storage and upload scanning must be connected first."
              fontColor={colors.gray400}
            >
              Upload file
            </Button>
            <Button
              variant="contained"
              bgColor={theme.palette.primary.main}
              onClick={() => setAdding(!adding)}
              disabled={!canContribute}
              disabledMessage="Read-only members cannot add documents."
            >
              + Add document link
            </Button>
          </Stack>
        </Stack>
        {adding ? (
          <Box component="form" onSubmit={link.handleSubmit} sx={panel}>
            <Text color={colors.white} size="large">
              Keep your documents connected.
            </Text>
            <Text color={colors.gray400} weight="regular" sx={{ mt: "8px" }}>
              Add a link to a Google Doc, spreadsheet, PDF, or any secure page.
            </Text>
            <Stack gap={2} sx={{ my: 2 }}>
              {(["title", "url"] as const).map((name) => (
                <TextField
                  key={name}
                  label={name === "title" ? "Document title" : "Document URL"}
                  name={name}
                  value={link.values[name]}
                  onChange={link.handleChange}
                  onBlur={link.handleBlur}
                  error={!!link.touched[name] && !!link.errors[name]}
                  helperText={link.touched[name] ? link.errors[name] : ""}
                />
              ))}
              <Text color={colors.white} component="label" htmlFor="new-link-folder">
                Folder
              </Text>
              <Select
                id="new-link-folder"
                name="folder"
                value={link.values.folder}
                onChange={link.handleChange}
                inputProps={{ "aria-label": "Folder" }}
              >
                {folders.slice(1).map((folder) => (
                  <MenuItem key={folder} value={folder}>
                    {folder}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
            <Button type="submit" variant="contained" bgColor={theme.palette.primary.main}>
              Add link
            </Button>
            <Button
              fontColor={colors.gray400}
              onClick={() => {
                setAdding(false);
                link.resetForm();
              }}
            >
              Cancel
            </Button>
          </Box>
        ) : null}
        <Text color={colors.gray400} size="xsmall">
          Sample cards open the service homepages. Add your own document links to try the complete flow.
        </Text>
        <Box
          sx={{
            display: document ? "none" : "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {visible.map((item) => (
            <Box key={item.id} sx={{ ...panel, display: "flex", flexDirection: "column", minHeight: 215 }}>
              <Stack direction="row" justifyContent="space-between">
                <Box sx={{ bgcolor: colors.gray900, borderRadius: "8px", p: 1.5 }}>
                  <Text color={theme.palette.primary.light}>▤</Text>
                </Box>
                <Text size="xsmall" color={colors.gray400}>
                  {item.folder}
                </Text>
              </Stack>
              <Box
                component="a"
                href={getSafeExternalURL(item.url)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 2, color: colors.white, "&:hover": { textDecoration: "underline" } }}
              >
                <Text color={colors.white}>{item.title} ↗</Text>
              </Box>
              <Text color={colors.gray400} weight="regular" size="xsmall" sx={{ mt: "6px" }}>
                {item.kind} · Opens in a new tab
              </Text>
              <Button
                sx={{ mt: 2, alignSelf: "flex-start", p: 0 }}
                fontColor={colors.gray400}
                onClick={() => setSelectedDocument(item.id)}
              >
                {item.comments.length} {item.comments.length === 1 ? "comment" : "comments"} · Manage
              </Button>
            </Box>
          ))}
        </Box>
        {!visible.length ? (
          <Box sx={panel}>
            <Text color={colors.white}>No documents here yet.</Text>
            <Text color={colors.gray400} weight="regular" sx={{ mt: "8px" }}>
              Add a document link or choose another folder.
            </Text>
          </Box>
        ) : null}
        {document ? (
          <Box sx={panel}>
            <Stack direction="row" justifyContent="space-between">
              <Text color={colors.white} size="large">
                {document.title}
              </Text>
              <Button onClick={() => setSelectedDocument(null)} fontColor={colors.gray400}>
                Close
              </Button>
            </Stack>
            <Text color={colors.white} component="label" htmlFor="move-folder" sx={{ mt: "16px" }}>
              Move to folder
            </Text>
            <Select
              id="move-folder"
              value={document.folder}
              disabled={!canContribute}
              onChange={(event) =>
                updateProject({
                  documents: project.documents.map((item) =>
                    item.id === document.id ? { ...item, folder: event.target.value as string } : item
                  ),
                })
              }
              inputProps={{ "aria-label": "Move to folder" }}
            >
              {folders.slice(1).map((folder) => (
                <MenuItem key={folder} value={folder}>
                  {folder}
                </MenuItem>
              ))}
            </Select>
            {document.comments.map((comment, index) => (
              <Text
                key={index}
                color={colors.white}
                weight="regular"
                sx={{ borderBottom: `1px solid ${colors.gray700}`, py: 2 }}
              >
                {comment}
              </Text>
            ))}
            <CommentForm
              disabled={!canContribute}
              onSubmit={(value) =>
                updateProject({
                  documents: project.documents.map((item) =>
                    item.id === document.id ? { ...item, comments: [...item.comments, value] } : item
                  ),
                })
              }
            />
          </Box>
        ) : null}
      </Stack>
    );
  }

  const visible = project.discussions.filter(
    (item) =>
      (label === "All threads" ||
        (label === "Unread"
          ? item.unread
          : label === "Open requests"
            ? item.label === "Requirements" && !item.resolved
            : item.label === label)) &&
      matches(`${item.title} ${item.body} ${item.label}`)
  );
  return (
    <Stack gap={2}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
        <Stack direction="row" flexWrap="wrap">
          {[...labels, "Unread", "Open requests"].map((item) => (
            <Button
              key={item}
              fontColor={label === item ? colors.white : colors.gray400}
              onClick={() => setLabel(item)}
              aria-pressed={label === item}
              sx={{ bgcolor: label === item ? "primary.main" : "transparent" }}
            >
              {item}
            </Button>
          ))}
        </Stack>
        <Button
          variant="contained"
          bgColor={theme.palette.primary.main}
          disabled={!canContribute}
          disabledMessage="Read-only members cannot start threads."
          onClick={() => setAdding(!adding)}
        >
          + New thread
        </Button>
      </Stack>
      {adding ? (
        <Box component="form" onSubmit={thread.handleSubmit} sx={panel}>
          <Text size="large" color={colors.white}>
            Start a conversation
          </Text>
          <Stack gap={2} sx={{ my: 2 }}>
            {(["title", "body"] as const).map((name) => (
              <TextField
                key={name}
                label={name === "title" ? "Thread title" : "Message"}
                name={name}
                multiline={name === "body"}
                minRows={name === "body" ? 3 : undefined}
                value={thread.values[name]}
                onChange={thread.handleChange}
                onBlur={thread.handleBlur}
                error={!!thread.touched[name] && !!thread.errors[name]}
                helperText={thread.touched[name] ? thread.errors[name] : ""}
              />
            ))}
            <Text color={colors.white} component="label" htmlFor="thread-label">
              Label
            </Text>
            <Select
              id="thread-label"
              name="label"
              value={thread.values.label}
              onChange={thread.handleChange}
              inputProps={{ "aria-label": "Label" }}
            >
              {labels.slice(1).map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </Stack>
          <Button type="submit" variant="contained" bgColor={theme.palette.primary.main}>
            Post thread
          </Button>
          <Button
            fontColor={colors.gray400}
            onClick={() => {
              setAdding(false);
              thread.resetForm();
            }}
          >
            Cancel
          </Button>
        </Box>
      ) : null}
      {(discussion ? [] : visible).map((item) => (
        <Box key={item.id} sx={panel}>
          <Stack direction="row" justifyContent="space-between" gap={2}>
            <Button
              fontColor={colors.white}
              onClick={() => {
                setSelectedThread(item.id);
                updateProject({
                  discussions: project.discussions.map((t) => (t.id === item.id ? { ...t, unread: false } : t)),
                });
              }}
              sx={{ p: 0, textAlign: "left", justifyContent: "flex-start" }}
            >
              {item.unread ? "● " : ""}
              {item.title}
            </Button>
            <Text color={item.resolved ? colors.success200 : colors.gray400} size="xsmall">
              {item.resolved ? "Resolved" : "Open"}
            </Text>
          </Stack>
          <Text color={colors.gray400} size="xsmall" sx={{ mt: "8px" }}>
            {item.author} · {item.label} · {item.replies.length} replies
          </Text>
          <Text color={colors.gray400} weight="regular" sx={{ mt: "16px" }}>
            {item.body}
          </Text>
        </Box>
      ))}
      {!discussion && !visible.length ? (
        <Box sx={panel}>
          <Text color={colors.white}>No conversations match.</Text>
          <Text color={colors.gray400} weight="regular" sx={{ mt: "8px" }}>
            Try another label or start a new thread.
          </Text>
        </Box>
      ) : null}
      {discussion ? (
        <Box sx={panel}>
          <Stack direction="row" justifyContent="space-between">
            <Text size="large" color={colors.white}>
              {discussion.title}
            </Text>
            <Button onClick={() => setSelectedThread(null)} fontColor={colors.gray400}>
              Back to discussions
            </Button>
          </Stack>
          <Text color={colors.gray400} weight="regular" sx={{ mt: "16px" }}>
            {discussion.body}
          </Text>
          {discussion.replies.map((reply, index) => (
            <Text
              key={index}
              color={colors.white}
              weight="regular"
              sx={{ borderBottom: `1px solid ${colors.gray700}`, py: 2 }}
            >
              {reply}
            </Text>
          ))}
          <CommentForm
            disabled={!canContribute}
            onSubmit={(value) =>
              updateProject({
                discussions: project.discussions.map((item) =>
                  item.id === discussion.id ? { ...item, replies: [...item.replies, value] } : item
                ),
              })
            }
          />
          <Button
            sx={{ mt: 2 }}
            disabled={!canManage}
            disabledMessage="A project administrator can resolve threads."
            fontColor={colors.gray400}
            onClick={() =>
              updateProject({
                discussions: project.discussions.map((item) =>
                  item.id === discussion.id ? { ...item, resolved: !item.resolved } : item
                ),
              })
            }
          >
            {discussion.resolved ? "Reopen thread" : "Mark resolved"}
          </Button>
        </Box>
      ) : null}
    </Stack>
  );
};
