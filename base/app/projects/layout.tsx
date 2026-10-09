import { ProjectsProvider } from "./projects-store"

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProjectsProvider>{children}</ProjectsProvider>
}
