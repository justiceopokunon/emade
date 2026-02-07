import { loadDiyProjects } from "@/lib/diyData";
import { DiyClient } from "./DiyClient";

export const revalidate = 0;

export default async function DiyPage() {
  const projects = await loadDiyProjects();
  return <DiyClient initialProjects={projects} />;
}
