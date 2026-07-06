export interface CollegeConfig {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  email: string;
  phone: string;
  developer: string;
}

export function getCollegeConfig(): CollegeConfig {
  return {
    name: "SANT SANDHYA DAS MAHILA COLLEGE",
    address: "Gulabbag, Barh",
    city: "Patna",
    state: "Bihar",
    pincode: "803213",
    email: "principalssdmcbarh@gmail.com",
    phone: "7549298333",
    developer: "Vaastman Solutions"
  };
}
