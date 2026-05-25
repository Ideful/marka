export type Vacancy = {
  slug: string;
  title: string;
  summary: string;
};

export const VACANCIES: Vacancy[] = [
  {
    slug: "brow-master",
    title: "Бровист",
    summary: "Опыт работы и портфолио — приветствуются.",
  },
  {
    slug: "admin",
    title: "Администратор",
    summary: "Встреча гостей, запись, консультации по услугам.",
  },
  {
    slug: "manicurist",
    title: "Мастер маникюра",
    summary: "Аккуратность, стерильность, любовь к деталям.",
  },
  {
    slug: "cosmetologist",
    title: "Косметолог",
    summary: "Диплом и допуски по действующим требованиям.",
  },
];
