import { z } from "zod";

export const exhibitionFormSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  subtitle: z.string().optional(),
  address: z.string().optional(),
});

export type ExhibitionFormData = z.infer<typeof exhibitionFormSchema>;

export interface ArtworkFormState {
  title: string;
  description: string;
  price: string;
  size: string;
  status: 'available' | 'reserved' | 'sold' | 'preparation';
  createdLocation: string;
  storedLocation: string;
  exhibitionLocation?: string;
  interiorImageDescriptions: string[];
  collectionId?: number;
}
