import { EditTaskScreen } from "./edit-task-screen"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>
}) {
  const { id, taskId } = await params

  return <EditTaskScreen projectId={id} taskId={taskId} />
}
