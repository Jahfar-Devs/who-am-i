import Site from "@/components/site/Site";
import { getContent } from "@/lib/store";

export default async function Page() {
  return <Site content={await getContent()} />;
}
