import { supabase } from '../lib/supabase';

interface CVRData {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  phone?: string;
  email?: string;
  status: string;
  industry?: string;
  employees?: number;
}

interface DAWAAddress {
  id: string;
  tekst: string;
  adresse: {
    vejnavn: string;
    husnr: string;
    postnr: string;
    postnrnavn: string;
  };
}

export const cvrService = {
  // CVR API opslag
  async lookupCVR(cvr: string): Promise<{ data: CVRData | null; error?: string }> {
    try {
      // Rens CVR nummer
      const cleanCVR = cvr.replace(/\D/g, '');
      
      if (cleanCVR.length !== 8) {
        return { data: null, error: 'CVR-nummer skal være 8 cifre' };
      }

      // Simuleret CVR API opslag da cvrapi.dk ikke er tilgængelig i dette miljø
      // I en produktionsmiljø ville dette være et rigtigt API kald
      console.log(`Simulerer CVR opslag for: ${cleanCVR}`);
      
      // Simuleret data baseret på CVR-nummer
      const mockData: Record<string, CVRData> = {
        '12345678': {
          name: 'Netto Supermarked A/S',
          address: 'Hovedgade 123',
          postalCode: '2000',
          city: 'Frederiksberg',
          phone: '+45 70 12 34 56',
          email: 'kontakt@netto.dk',
          status: 'Aktiv',
          industry: 'Detailhandel',
          employees: 120
        },
        '87654321': {
          name: 'Kontorbygning A/S',
          address: 'Erhvervsvej 45',
          postalCode: '2100',
          city: 'København Ø',
          phone: '+45 80 12 34 56',
          email: 'facility@kontorbygning.dk',
          status: 'Aktiv',
          industry: 'Ejendomsadministration',
          employees: 35
        },
        '55667788': {
          name: 'Restaurant Bella ApS',
          address: 'Cafégade 78',
          postalCode: '2200',
          city: 'København N',
          phone: '+45 90 12 34 56',
          email: 'info@restaurantbella.dk',
          status: 'Aktiv',
          industry: 'Restauration',
          employees: 18
        }
      };

      // Tjek om vi har mock data for dette CVR
      if (mockData[cleanCVR]) {
        return { data: mockData[cleanCVR], error: undefined };
      }
      
      // Hvis ikke, generer noget generisk data
      const genericData: CVRData = {
        name: `Virksomhed ${cleanCVR} ApS`,
        address: `Virksomhedsvej ${cleanCVR.substring(0, 3)}`,
        postalCode: '2100',
        city: 'København Ø',
        phone: `+45 ${cleanCVR.substring(0, 2)} ${cleanCVR.substring(2, 4)} ${cleanCVR.substring(4, 6)} ${cleanCVR.substring(6, 8)}`,
        email: `kontakt@virksomhed${cleanCVR}.dk`,
        status: 'Aktiv',
        industry: 'Anden virksomhed',
        employees: Math.floor(Math.random() * 50) + 1
      };

      return { data: genericData, error: undefined };
    } catch (error) {
      console.error('CVR lookup error:', error);
      return { data: null, error: 'Kunne ikke hente CVR data' };
    }
  },

  // DAWA adresse autocomplete
  async searchAddresses(query: string): Promise<{ data: DAWAAddress[]; error?: string }> {
    try {
      if (query.length < 3) {
        return { data: [] };
      }

      // Simuleret DAWA API - i produktion ville dette være et rigtigt API kald
      console.log(`Simulerer adressesøgning for: ${query}`);
      
      // Simulerede adresser baseret på søgning
      const mockAddresses: DAWAAddress[] = [
        {
          id: '1',
          tekst: 'Hovedgade 123, 2000 Frederiksberg',
          adresse: {
            vejnavn: 'Hovedgade',
            husnr: '123',
            postnr: '2000',
            postnrnavn: 'Frederiksberg'
          }
        },
        {
          id: '2',
          tekst: 'Hovedgade 124, 2000 Frederiksberg',
          adresse: {
            vejnavn: 'Hovedgade',
            husnr: '124',
            postnr: '2000',
            postnrnavn: 'Frederiksberg'
          }
        },
        {
          id: '3',
          tekst: 'Hovedgade 125, 2000 Frederiksberg',
          adresse: {
            vejnavn: 'Hovedgade',
            husnr: '125',
            postnr: '2000',
            postnrnavn: 'Frederiksberg'
          }
        },
        {
          id: '4',
          tekst: 'Erhvervsvej 45, 2100 København Ø',
          adresse: {
            vejnavn: 'Erhvervsvej',
            husnr: '45',
            postnr: '2100',
            postnrnavn: 'København Ø'
          }
        },
        {
          id: '5',
          tekst: 'Cafégade 78, 2200 København N',
          adresse: {
            vejnavn: 'Cafégade',
            husnr: '78',
            postnr: '2200',
            postnrnavn: 'København N'
          }
        }
      ];

      // Filtrer adresser baseret på søgning
      const filteredAddresses = mockAddresses.filter(addr => 
        addr.tekst.toLowerCase().includes(query.toLowerCase())
      );

      return { data: filteredAddresses };
    } catch (error) {
      console.error('DAWA search error:', error);
      return { data: [], error: 'Kunne ikke søge adresser' };
    }
  },

  // Valider CVR format
  validateCVR(cvr: string): boolean {
    const cleanCVR = cvr.replace(/\D/g, '');
    return cleanCVR.length === 8;
  },

  // Formatér CVR til visning
  formatCVR(cvr: string): string {
    const cleanCVR = cvr.replace(/\D/g, '');
    if (cleanCVR.length === 8) {
      return `${cleanCVR.slice(0, 2)} ${cleanCVR.slice(2, 4)} ${cleanCVR.slice(4, 6)} ${cleanCVR.slice(6, 8)}`;
    }
    return cvr;
  }
};