import allDE from "~~/public/locale/_all-de.json";
import allEN from "~~/public/locale/_all-en.json";
import timetackerDE from "~~/public/locale/timetracker-de.json";
import timetackerEN from "~~/public/locale/timetracker-en.json";

Object.assign(allEN, timetackerEN);
Object.assign(allDE, timetackerDE);

export default defineEventHandler((event) => {
  const locale = event?.context?.params?.locale;

  switch (locale) {
    case "de":
      return allDE;

    case "en":
    default:
      return allEN;
  }
});
