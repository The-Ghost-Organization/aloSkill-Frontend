import { SectionHeader } from "../Components";
import AuthorsView from "./AuthorsView";
import { getAdminAuthors } from "./action";

export default async function AuthorsPage() {
  const response = await getAdminAuthors();
  return <div className='animate-slide-up'>
    <SectionHeader title='Authors' sub='Manage author profiles linked to your books' />
    {!response.success || !response.data ? (
      <div role='alert' className='rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300'>Could not load authors. Please refresh the page and try again.</div>
    ) : <AuthorsView authors={response.data} />}
  </div>;
}
