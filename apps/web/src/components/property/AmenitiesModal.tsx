import { Modal } from '../ui/Modal';

interface AmenitiesModalProps {
  amenities: string[];
  onClose: () => void;
}

/**
 * Affiche une liste plate des équipements — la maquette de référence les
 * groupe par catégorie (Living room, Kitchen & dining...), mais cette
 * catégorisation dépend du catalogue d'équipements pré-catégorisé prévu
 * au cahier des charges (section 6.2.5), pas encore construit. À revoir
 * une fois ce catalogue en place.
 */
export function AmenitiesModal({
  amenities,
  onClose,
}: AmenitiesModalProps): React.JSX.Element {
  return (
    <Modal title="Tous les équipements" onClose={onClose}>
      {amenities.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Aucun équipement renseigné pour ce bien.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-y-3 text-sm text-ink">
          {amenities.map((amenity) => (
            <li key={amenity}>{amenity}</li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
