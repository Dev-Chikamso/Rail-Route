export interface Station {
  id: string;
  name: string;
  city: string;
  state: string;
  code: string;
  description: string | null;
}

export const STATIONS: Station[] = [
  { id: "apapa", name: "Apapa Station", city: "Lagos", state: "Lagos", code: "APL", description: "Lagos terminus on the western line" },
  { id: "iddo", name: "Iddo Terminal", city: "Lagos", state: "Lagos", code: "IDO", description: "Main Lagos passenger terminal" },
  { id: "ebute-metta", name: "Ebute Metta Junction", city: "Lagos", state: "Lagos", code: "EBM", description: "Major Lagos junction" },
  { id: "agege", name: "Agege", city: "Agege", state: "Lagos", code: "AGG", description: null },
  { id: "iju", name: "Iju", city: "Lagos", state: "Lagos", code: "IJU", description: null },
  { id: "agbado", name: "Agbado", city: "Agbado", state: "Ogun", code: "ABD", description: null },
  { id: "abeokuta", name: "Abeokuta", city: "Abeokuta", state: "Ogun", code: "ABK", description: "Capital of Ogun State" },
  { id: "ibadan", name: "Ibadan", city: "Ibadan", state: "Oyo", code: "IBD", description: "Largest city in West Africa by area" },
  { id: "offa", name: "Offa", city: "Offa", state: "Kwara", code: "OFA", description: null },
  { id: "ilorin", name: "Ilorin", city: "Ilorin", state: "Kwara", code: "ILR", description: "Capital of Kwara State" },
  { id: "jebba", name: "Jebba", city: "Jebba", state: "Kwara", code: "JEB", description: "Niger River crossing" },
  { id: "minna", name: "Minna", city: "Minna", state: "Niger", code: "MNA", description: "Capital of Niger State" },
  { id: "kaduna", name: "Kaduna", city: "Kaduna", state: "Kaduna", code: "KDN", description: "Major northern commercial hub" },
  { id: "zaria", name: "Zaria", city: "Zaria", state: "Kaduna", code: "ZAR", description: null },
  { id: "kano", name: "Kano", city: "Kano", state: "Kano", code: "KNO", description: "Largest city in northern Nigeria" },
  { id: "idu", name: "Idu Station (Abuja)", city: "Abuja", state: "FCT", code: "IDU", description: "Abuja terminus of the Abuja–Kaduna line" },
  { id: "rigachikun", name: "Rigachikun", city: "Rigachikun", state: "Kaduna", code: "RGC", description: null },
  { id: "ph-port-harcourt", name: "Port Harcourt (Terminus)", city: "Port Harcourt", state: "Rivers", code: "PHC", description: "Southern Niger Delta terminus" },
  { id: "aba", name: "Aba", city: "Aba", state: "Abia", code: "ABA", description: "Commercial city in Abia State" },
  { id: "enugu", name: "Enugu", city: "Enugu", state: "Enugu", code: "ENU", description: "Coal City" },
  { id: "makurdi", name: "Makurdi", city: "Makurdi", state: "Benue", code: "MKD", description: "Capital of Benue State" },
  { id: "warri", name: "Warri", city: "Warri", state: "Delta", code: "WAR", description: "Major Delta State city" },
  { id: "sapele", name: "Sapele", city: "Sapele", state: "Delta", code: "SPL", description: null },
  { id: "benin-city", name: "Benin City", city: "Benin City", state: "Edo", code: "BNC", description: "Capital of Edo State" },
];
