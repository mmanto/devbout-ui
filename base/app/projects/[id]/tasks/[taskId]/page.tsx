import { TaskDetailScreen } from "./task-detail-screen"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>
}) {
  const { id, taskId } = await params

  return <TaskDetailScreen projectId={id} taskId={taskId} />
}
