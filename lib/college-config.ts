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
    name: process.env.COLLEGE_NAME ?? "SANT SANDHYA DAS MAHILA COLLEGE",
    address: process.env.COLLEGE_ADDRESS ?? "Gulabbag, Barh",
    city: process.env.COLLEGE_CITY ?? "Patna",
    state: process.env.COLLEGE_STATE ?? "Bihar",
    pincode: process.env.COLLEGE_PINCODE ?? "803213",
    email: process.env.COLLEGE_EMAIL ?? "principalssdmcbarh@gmail.com",
    phone: process.env.COLLEGE_PHONE ?? "7549298333",
    developer: "Vaastman Solutions",
  };
}
