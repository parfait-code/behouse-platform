import { notFound } from 'next/navigation';
import { PropertyDetailView } from '../../../components/property/PropertyDetailView';
import { getPropertyDetail } from '../../../lib/properties/api';

interface PropertyPageProps {
  params: { id: string };
}

export default async function PropertyPage({
  params,
}: PropertyPageProps): Promise<React.JSX.Element> {
  try {
    const property = await getPropertyDetail(params.id);
    return <PropertyDetailView property={property} />;
  } catch {
    notFound();
  }
}
