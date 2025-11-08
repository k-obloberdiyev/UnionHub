export type DepartmentCode = 1|2|3|4|5|6|7;

export interface Member {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  class_name?: string; // e.g., "Business 2027"
  biography?: string;
  department_code: DepartmentCode;
}

// Seed with a few example members per department. You can edit this file freely.
export const members: Member[] = [
  {
    id: "m-edu-1",
    name: "Yandillayev Ibragim",
    email: "alice@university.edu",
    avatar: "/placeholder.svg",
    class_name: "11-02",
    biography: "Passionate about tutoring and academic mentoring.",
    department_code: 1,
  },
  {
    id: "m-edu-2",
    name: "Qahramonova Go'zal",
    avatar: "/placeholder.svg",
    class_name: "10-01",
    biography: "Organizes study groups and peer review sessions.",
    department_code: 1,
  },
  {
    id: "m-social-1",
    name: "Sofia Li",
    avatar: "/placeholder.svg",
    class_name: "Hospitality 2026",
    biography: "Loves planning campus-wide social events.",
    department_code: 2,
  },
  {
    id: "m-int-1",
    name: "Marco Rossi",
    avatar: "/placeholder.svg",
    class_name: "Languages 2025",
    biography: "Supports international students and culture fairs.",
    department_code: 3,
  },
  {
    id: "m-media-1",
    name: "Rabbimov Ulug'bek",
    avatar: "/placeholder.svg",
    class_name: "10-02",
    biography: "Photographer and content creator.",
    department_code: 4,
  },
  {
    id: "m-sport-1",
    name: "Abdimizomov Javlonbek",
    avatar: "/placeholder.svg",
    class_name: "10-01",
    biography: "Coordinates intramural tournaments.",
    department_code: 5,
  },
  {
    id: "m-soceng-1",
    name: "Abdurahmon",
    avatar: "/placeholder.svg",
    class_name: "9-02",
    biography: "Leads community volunteering initiatives.",
    department_code: 6,
  },
  {
    id: "m-it-1",
    name: "Obloberdiyev Kamolbek",
    avatar: "/placeholder.svg",
    class_name: "10-01",
    biography: "Works on web and app tooling for the union.",
    department_code: 7,
  },
];
