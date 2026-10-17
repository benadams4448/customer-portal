"use client";

import { useState } from "react";
import { Box, Stack, styled, useTheme } from "@mui/material";

import Button from "src/components/Button/Button";
import TextField from "src/components/FormElementsv2/TextField/TextField";
import AccessIcon from "src/components/Icons/AccessControlIcon/AccessControlIcon";
import SearchLens from "src/components/Icons/SearchLens/SearchLens";
import DashboardIcon from "src/components/Icons/SideNavbar/Dashboard/Dashboard";
import ResourcesIcon from "src/components/Icons/SideNavbar/Resources/Resources";
import LinearProgress from "src/components/LinearProgress/LinearProgress";
import { DisplayText, Text } from "src/components/Typography/Typography";
import { useProviderOrgDetails } from "src/providers/ProviderOrgDetailsProvider";
import { colors } from "src/themeConfig";

import { ProjectContent } from "./components/ProjectContent";
import { WorkspaceForms } from "./components/WorkspaceForms";
import { initialProjects, roles } from "./demo";
import { Project, WorkspaceRole } from "./types";

export type WorkspaceTab = "Overview" | "Discussions" | "Documents" | "People" | "Organization";
const surface = { bgcolor: colors.gray800, border: `1px solid ${colors.gray700}`, borderRadius: "12px", p: 3 };
const muted = colors.gray400;

const WorkspaceHeading = styled(DisplayText)<{ size?: "small" | "xsmall" }>({});

const ProjectsPage = () => {
  const theme = useTheme();
  const { orgName } = useProviderOrgDetails();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedId, setSelectedId] = useState("website");
  const [tab, setTab] = useState<WorkspaceTab>("Overview");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("Project admin");
  const [editor, setEditor] = useState<"project" | "progress" | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [discussionFilter, setDiscussionFilter] = useState<"All threads" | "Open requests" | "Unread">("All threads");
  const project = projects.find((item) => item.id === selectedId) || projects[0];
  const canManage = role !== "Read only" && role !== "Project collaborator";
  const canContribute = role !== "Read only";
  const updateProject = (update: Partial<Project>) =>
    setProjects((items) => items.map((item) => (item.id === project.id ? { ...item, ...update } : item)));
  const unread = project.discussions.filter((item) => item.unread).length;
  const issues = project.discussions.filter((item) => !item.resolved && item.label === "Requirements").length;
  const complete = project.milestones.filter((item) => item.done).length;
  const nav = (label: WorkspaceTab, icon: React.ReactNode) => (
    <Button
      key={label}
      variant="text"
      aria-label={label}
      aria-current={tab === label ? "page" : undefined}
      onClick={() => {
        setTab(label);
        setSearch("");
        setDiscussionFilter("All threads");
        setMobileNavOpen(false);
      }}
      fontColor={tab === label ? colors.white : muted}
      sx={{
        width: "100%",
        justifyContent: "flex-start",
        gap: 1.5,
        px: 2,
        py: 1.25,
        bgcolor: tab === label ? "primary.main" : "transparent",
        "&:hover": { bgcolor: "primary.main", color: colors.white },
        "& svg": { width: 20, height: 20 },
      }}
    >
      {icon}
      {label}
    </Button>
  );

  return (
    <Box
      sx={{
        "--gray-25": colors.workspaceBackground,
        "--gray-50": colors.workspacePanel,
        "--gray-100": colors.workspacePanel,
        "--gray-200": colors.workspaceBorder,
        "--gray-300": colors.workspaceBorder,
        "--gray-400": colors.workspaceMuted,
        "--gray-700": colors.workspaceBorder,
        "--gray-800": colors.workspacePanel,
        "--gray-900": colors.workspaceBackground,
        bgcolor: colors.gray900,
        color: colors.white,
        minHeight: "100vh",
        "& .MuiButton-root:focus-visible, & a:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 3,
        },
        "& .MuiOutlinedInput-root": { color: colors.white },
        "& .MuiOutlinedInput-input": { bgcolor: `${colors.gray900} !important`, color: colors.white },
        "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.gray700 },
        "& .MuiInputLabel-root": { color: muted },
        "& .MuiButton-text:hover": { color: colors.white },
      }}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "248px minmax(0, 1fr)" } }}>
        <Stack
          component="aside"
          sx={{
            display: { xs: mobileNavOpen ? "flex" : "none", md: "flex" },
            borderRight: `1px solid ${colors.gray700}`,
            bgcolor: colors.gray800,
            p: 2.5,
            minHeight: { md: "100vh" },
            gap: 3,
          }}
        >
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ px: 1, py: 1 }}>
            <Box
              sx={{
                bgcolor: "primary.main",
                width: 36,
                height: 36,
                display: "grid",
                placeItems: "center",
                borderRadius: "10px",
              }}
            >
              <ResourcesIcon color={colors.white} />
            </Box>
            <Box>
              <Text size="large" color={colors.white}>
                {orgName || "Client workspace"}
              </Text>
              <Text size="xsmall" weight="regular" color={muted}>
                Your client workspace
              </Text>
            </Box>
          </Stack>
          <Box sx={{ p: 1.5, border: `1px solid ${colors.gray700}`, borderRadius: "8px" }}>
            <Text size="xsmall" color={muted}>
              DEMO ORGANIZATION
            </Text>
            <Text color={colors.white} sx={{ mt: "6px" }}>
              Acme Studio
            </Text>
          </Box>
          <Stack gap={0.5}>
            <Text size="xsmall" color={muted} sx={{ px: 2, mb: 1 }}>
              WORKSPACE
            </Text>
            {nav("Overview", <DashboardIcon color={tab === "Overview" ? colors.white : muted} />)}
            {nav(
              "Discussions",
              <Text component="span" color="inherit">
                ◎
              </Text>
            )}
            {nav("Documents", <ResourcesIcon color={muted} />)}
            {nav("People", <AccessIcon color={muted} />)}
            {nav(
              "Organization",
              <Text component="span" color="inherit">
                ▦
              </Text>
            )}
          </Stack>
          <Stack gap={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2 }}>
              <Text size="xsmall" color={muted}>
                YOUR PROJECTS
              </Text>
              <Button
                aria-label="Create project"
                onClick={() => setEditor("project")}
                disabled={!canManage}
                disabledMessage="A project or organization admin can create projects."
                fontColor={muted}
              >
                +
              </Button>
            </Stack>
            {projects.map((item) => (
              <Button
                key={item.id}
                onClick={() => {
                  setSelectedId(item.id);
                  setTab("Overview");
                  setEditor(null);
                  setSearch("");
                  setMobileNavOpen(false);
                }}
                fontColor={item.id === project.id ? colors.white : muted}
                sx={{ justifyContent: "flex-start", gap: 1.5 }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    bgcolor: item.id === project.id ? "primary.main" : colors.gray500,
                  }}
                />
                {item.name}
              </Button>
            ))}
          </Stack>
          <Box sx={{ mt: "auto", p: 2, border: `1px solid ${colors.gray700}`, borderRadius: "12px" }}>
            <Text color={colors.white}>Good work starts here.</Text>
            <Text color={muted} size="xsmall" weight="regular" sx={{ mt: "8px" }}>
              One place for your team, your ideas, and everything in between.
            </Text>
          </Box>
          <Stack direction="row" gap={1.5} alignItems="center">
            <Box sx={{ borderRadius: "50%", bgcolor: "primary.main", p: 1 }}>
              <Text color={colors.white}>JD</Text>
            </Box>
            <Box>
              <Text color={colors.white}>Jamie Davis</Text>
              <Text color={muted} size="xsmall">
                {role} · Demo
              </Text>
            </Box>
          </Stack>
        </Stack>
        <Box sx={{ minWidth: 0 }}>
          <Stack
            component="header"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ borderBottom: `1px solid ${colors.gray700}`, px: { xs: 2, md: 4 }, py: 2, gap: 2, flexWrap: "wrap" }}
          >
            <Button
              aria-label="Toggle workspace navigation"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              fontColor={colors.white}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              Menu
            </Button>
            <Text color={muted} weight="regular">
              Workspace{" "}
              <Text component="span" color={colors.gray500}>
                {" "}
                /{" "}
              </Text>
              <Text component="span" color={colors.white}>
                {project.name}
              </Text>
            </Text>
            <Stack direction="row" alignItems="center" gap={2}>
              <Text color={muted} size="xsmall">
                PROJECT WORKSPACE
              </Text>
              <Button
                onClick={() => {
                  setTab("Discussions");
                  setDiscussionFilter("Unread");
                  setSearch("");
                }}
                aria-label={`${unread} unread discussions`}
                fontColor={colors.white}
              >
                ◎ {unread}
              </Button>
            </Stack>
          </Stack>
          <Box component="main" sx={{ px: { xs: 2, md: 4 }, py: 4, maxWidth: 1600, mx: "auto" }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: colors.success500 }} />
              <Text size="xsmall" color={muted} weight="regular">
                Interactive preview · Sample data · Changes reset on refresh
              </Text>
            </Stack>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              gap={2}
            >
              <Box>
                <Stack direction="row" gap={1.5} alignItems="center" flexWrap="wrap">
                  <WorkspaceHeading as="h1" size="small" color={colors.white}>
                    {project.name}
                  </WorkspaceHeading>
                  <Text
                    size="xsmall"
                    color={colors.success200}
                    sx={{ px: 1, py: 0.5, borderRadius: "6px", border: `1px solid ${colors.gray700}` }}
                  >
                    {project.progress === 100 ? "Completed" : project.progress === 0 ? "Not started" : "In progress"}
                  </Text>
                </Stack>
                <Text color={muted} weight="regular" sx={{ mt: "8px" }}>
                  {project.description}
                </Text>
              </Box>
              <Button
                variant="contained"
                bgColor={theme.palette.primary.main}
                onClick={() => setEditor("project")}
                disabled={!canManage}
                disabledMessage="A project or organization admin can create projects."
              >
                + New project
              </Button>
            </Stack>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 3, mb: 4, flexWrap: "wrap", gap: 2 }}
            >
              <Stack direction="row" alignItems="center" gap={1}>
                <Text size="xsmall" color={muted}>
                  AC
                </Text>
                <Text size="small" color={muted}>
                  Acme Studio
                </Text>
                <Text color={colors.gray500}>·</Text>
                <Text size="xsmall" color={muted}>
                  {project.template}
                </Text>
              </Stack>
              <Text size="xsmall" color={muted}>
                Target delivery{" "}
                <Text component="span" size="xsmall" color={colors.white}>
                  {project.due}
                </Text>
              </Text>
            </Stack>
            {editor ? (
              <WorkspaceForms
                mode={editor}
                project={project}
                onClose={() => setEditor(null)}
                onUpdate={updateProject}
                onCreate={(item) => {
                  setProjects((items) => [...items, item]);
                  setSelectedId(item.id);
                  setTab("Overview");
                  setEditor(null);
                }}
              />
            ) : null}
            {tab === "Overview" ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(4, 1fr)" },
                  "@media (min-width: 1100px)": { gridTemplateColumns: "repeat(4, 1fr)" },
                  gap: 2,
                  mb: 4,
                }}
              >
                {[
                  {
                    label: "Overall progress",
                    value: `${project.progress}%`,
                    detail: project.progress === 0 ? "Ready for kickoff" : "Moving in the right direction",
                    symbol: "↗",
                  },
                  {
                    label: "Milestones",
                    value: `${complete} / ${project.milestones.length}`,
                    detail: "Milestones completed",
                    symbol: "◈",
                  },
                  {
                    label: "Open requests",
                    value: `${issues}`,
                    detail: issues ? "Needs your attention" : "All clear",
                    symbol: "⚑",
                  },
                  {
                    label: "Unread updates",
                    value: `${unread}`,
                    detail: "Keep the conversation going",
                    symbol: "◎",
                  },
                ].map((stat, i) => (
                  <Button
                    key={stat.label}
                    aria-label={`View ${stat.label.toLowerCase()}`}
                    onClick={() => {
                      setSearch("");
                      if (i < 2)
                        document
                          .getElementById("project-milestones")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      else {
                        setDiscussionFilter(i === 2 ? "Open requests" : "Unread");
                        setTab("Discussions");
                      }
                    }}
                    fontColor={colors.white}
                    sx={{
                      ...surface,
                      display: "block",
                      textAlign: "left",
                      "&:hover": { bgcolor: colors.gray800, borderColor: "primary.main" },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between">
                      <Text color={muted} weight="regular">
                        {stat.label}
                      </Text>
                      <Text color={i === 0 ? theme.palette.primary.light : muted}>{stat.symbol}</Text>
                    </Stack>
                    <WorkspaceHeading size="small" color={colors.white} sx={{ my: 1.5 }}>
                      {stat.value}
                    </WorkspaceHeading>
                    <Text size="xsmall" color={muted} weight="regular">
                      {stat.detail}
                    </Text>
                  </Button>
                ))}
              </Box>
            ) : null}
            <Stack
              direction="row"
              gap={0.5}
              sx={{
                display: { xs: "flex", md: "none" },
                borderBottom: `1px solid ${colors.gray700}`,
                mb: 3,
                overflowX: "auto",
              }}
            >
              {(["Overview", "Discussions", "Documents", "People"] as WorkspaceTab[]).map((item) => (
                <Button
                  key={item}
                  onClick={() => setTab(item)}
                  fontColor={tab === item ? colors.white : muted}
                  sx={{
                    px: 2.5,
                    pb: 1.75,
                    borderRadius: 0,
                    borderBottom: "2px solid",
                    borderColor: tab === item ? "primary.main" : "transparent",
                  }}
                >
                  {item}
                  {item === "Discussions" ? ` (${project.discussions.length})` : ""}
                </Button>
              ))}
            </Stack>
            {tab === "Overview" ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1.6fr) minmax(280px, 1fr)" },
                  "@media (min-width: 1200px)": { gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, 1fr)" },
                  gap: 3,
                }}
              >
                <Box id="project-milestones" sx={{ ...surface, scrollMarginTop: "24px" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Text size="large" color={colors.white}>
                      Every step, a little closer.
                    </Text>
                    <Button
                      onClick={() => setEditor("progress")}
                      fontColor={muted}
                      disabled={!canManage}
                      disabledMessage="A project admin can update progress."
                    >
                      Edit progress ↗
                    </Button>
                  </Stack>
                  <Text color={muted} weight="regular" sx={{ mt: "8px" }}>
                    Here’s where your project stands.
                  </Text>
                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 4, mb: 1.5 }}>
                    <Text color={colors.white}>Project completion</Text>
                    <Text color={theme.palette.primary.light}>{project.progress}%</Text>
                  </Stack>
                  <LinearProgress
                    aria-label="Project completion"
                    variant="determinate"
                    value={project.progress}
                    sx={{
                      "&.MuiLinearProgress-colorPrimary": { bgcolor: colors.gray700 },
                      "& .MuiLinearProgress-bar": { bgcolor: "primary.main" },
                    }}
                  />
                  <Stack gap={0} sx={{ mt: 3 }}>
                    {project.milestones.map((milestone, index) => (
                      <Stack
                        key={milestone.title}
                        direction="row"
                        alignItems="center"
                        gap={2}
                        sx={{
                          py: 2,
                          borderBottom: index < project.milestones.length - 1 ? `1px solid ${colors.gray700}` : "none",
                        }}
                      >
                        <Button
                          aria-label={`${milestone.done ? "Reopen" : "Complete"} ${milestone.title}`}
                          disabled={!canManage}
                          disabledMessage="A project admin can update milestones."
                          onClick={() =>
                            updateProject({
                              milestones: project.milestones.map((m, i) => (i === index ? { ...m, done: !m.done } : m)),
                            })
                          }
                          fontColor={milestone.done ? colors.success200 : colors.white}
                          sx={{
                            border: "1px solid",
                            borderColor: milestone.done ? colors.success500 : colors.gray500,
                            borderRadius: "50%",
                            minWidth: 30,
                            height: 30,
                            p: 0,
                          }}
                        >
                          {milestone.done ? "✓" : `${index + 1}`}
                        </Button>
                        <Box sx={{ flex: 1 }}>
                          <Text color={colors.white}>{milestone.title}</Text>
                          <Text
                            size="xsmall"
                            color={milestone.done ? colors.success200 : muted}
                            weight="regular"
                            sx={{ mt: "4px" }}
                          >
                            {milestone.done ? "Completed" : index === complete ? "In progress" : "Upcoming"}
                          </Text>
                        </Box>
                        <Text size="xsmall" color={muted}>
                          {milestone.date}
                        </Text>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
                <Stack gap={3}>
                  <Box
                    sx={{
                      ...surface,
                      background: `linear-gradient(130deg, ${theme.palette.primary.main}25, ${colors.gray800})`,
                    }}
                  >
                    <Text size="xsmall" color={theme.palette.primary.light}>
                      LET’S KEEP THINGS MOVING
                    </Text>
                    <Text size="xlarge" color={colors.white} sx={{ mt: "16px" }}>
                      Your next big milestone.
                    </Text>
                    <Text color={muted} weight="regular" sx={{ mt: "8px" }}>
                      {project.milestones.find((item) => !item.done)?.title ||
                        "You’ve reached every milestone. Well done!"}
                    </Text>
                    <Button
                      onClick={() => setTab("Discussions")}
                      variant="contained"
                      bgColor={theme.palette.primary.main}
                      sx={{ mt: 3 }}
                    >
                      View discussions ↗
                    </Button>
                  </Box>
                  <Box sx={surface}>
                    <Text size="large" color={colors.white}>
                      Your project team
                    </Text>
                    <Text color={muted} weight="regular" sx={{ mt: "8px" }}>
                      Good people. Shared goals.
                    </Text>
                    {[
                      ["EW", "Emma Wilson", "Customer success manager"],
                      ["AM", "Alex Morgan", "Project lead"],
                    ].map(([initials, name, title]) => (
                      <Stack key={name} direction="row" gap={1.5} alignItems="center" sx={{ mt: 2 }}>
                        <Box sx={{ bgcolor: colors.gray700, borderRadius: "50%", p: 1.25 }}>
                          <Text size="xsmall" color={colors.white}>
                            {initials}
                          </Text>
                        </Box>
                        <Box>
                          <Text color={colors.white}>{name}</Text>
                          <Text size="xsmall" color={muted} weight="regular">
                            {title}
                          </Text>
                        </Box>
                      </Stack>
                    ))}
                  </Box>
                </Stack>
                <Box sx={{ ...surface, gridColumn: "1 / -1" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Text size="large" color={colors.white}>
                      Latest conversations
                    </Text>
                    <Button fontColor={muted} onClick={() => setTab("Discussions")}>
                      View all ↗
                    </Button>
                  </Stack>
                  {project.discussions.slice(0, 2).map((thread) => (
                    <Stack
                      key={thread.id}
                      direction="row"
                      gap={2}
                      alignItems="center"
                      sx={{ borderTop: `1px solid ${colors.gray700}`, mt: 2, pt: 2 }}
                    >
                      <Box sx={{ borderRadius: "10px", bgcolor: colors.gray900, p: 1.5 }}>
                        <Text color={theme.palette.primary.light}>◎</Text>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Button
                          onClick={() => setTab("Discussions")}
                          fontColor={colors.white}
                          sx={{ p: 0, justifyContent: "flex-start", textAlign: "left" }}
                        >
                          {thread.title}
                        </Button>
                        <Text size="xsmall" color={muted} weight="regular" sx={{ mt: "4px" }}>
                          {thread.author} · {thread.label}
                        </Text>
                      </Box>
                      <Text size="xsmall" color={muted}>
                        {thread.replies.length} replies
                      </Text>
                    </Stack>
                  ))}
                  {!project.discussions.length ? (
                    <Text color={muted} sx={{ mt: "16px" }}>
                      No conversations yet. Start one in Discussions.
                    </Text>
                  ) : null}
                </Box>
              </Box>
            ) : (
              <>
                <Text size="heading" component="h2" color={colors.white} sx={{ mb: 2 }}>
                  {tab}
                </Text>
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
                  <SearchLens color={muted} />
                  <TextField
                    placeholder={`Search ${tab.toLowerCase()}`}
                    inputProps={{ "aria-label": `Search ${tab.toLowerCase()}` }}
                    value={search}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
                    marginTop="0"
                  />
                </Stack>
                <ProjectContent
                  key={`${project.id}-${tab}-${discussionFilter}`}
                  tab={tab}
                  project={project}
                  updateProject={updateProject}
                  search={search}
                  canManage={canManage}
                  canContribute={canContribute}
                  role={role}
                  initialDiscussionFilter={discussionFilter}
                />
              </>
            )}
            <Box component="details" sx={{ mt: 4, pt: 2, borderTop: `1px solid ${colors.gray700}` }}>
              <Box component="summary" sx={{ cursor: "pointer", color: muted, py: 1 }}>
                <Text component="span" color={muted}>
                  Design review tools · {role}
                </Text>
              </Box>
              <Stack direction={{ xs: "column", md: "row" }} gap={2} alignItems={{ md: "center" }} sx={{ pt: 2 }}>
                <Text size="xsmall" color={muted}>
                  Preview as:
                </Text>
                <Stack direction="row" gap={0.5} flexWrap="wrap">
                  {roles.map((item) => (
                    <Button
                      key={item}
                      size="small"
                      onClick={() => {
                        setRole(item);
                        setEditor(null);
                      }}
                      fontColor={role === item ? colors.white : muted}
                      sx={{ border: "1px solid", borderColor: role === item ? "primary.main" : "transparent" }}
                    >
                      {item}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectsPage;
